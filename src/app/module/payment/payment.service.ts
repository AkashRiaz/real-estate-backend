import httpStatus from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import { PaymentWhereInput } from "../../../generated/prisma/models";
import {
  BookingStatus,
  NotificationType,
  PaymentStatus,
  PropertyStatus,
  Role,
} from "../../../generated/prisma/enums";
import { config } from "../../config";
import { generatePaymentTransactionId } from "../../helper/generateTransactionId";
import { buildMeta, calculatePagination } from "../../helper/paginationHelper";
import { IQuery } from "../../interfaces";
import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import { logger } from "../../utils/logger";
import { cancelUnpaidBookings } from "../../lib/cron";
import { NotificationService } from "../notification/notification.service";
import { ICreateBkashPaymentPayload, IPaymentCallbackResult } from "./payment.interface";
import {
  IBkashExecuteResponse,
  createBkashCheckout,
  executeBkashPayment,
  isBkashPaymentCompleted,
  parseBkashPaymentDate,
  queryBkashPayment,
} from "./payment.utils";

const IN_PROGRESS: PaymentStatus[] = [PaymentStatus.PENDING, PaymentStatus.PROCESSING];

const paymentInclude = {
  booking: {
    select: {
      id: true,
      status: true,
      property: { select: { id: true, title: true, slug: true, area: true, city: true } },
      agent: { select: { id: true, name: true } },
    },
  },
  user: { select: { id: true, name: true, email: true, phone: true } },
} as const;

const redirectTo = (
  status: IPaymentCallbackResult["status"],
  transactionId?: string,
): IPaymentCallbackResult => {
  const path = status === "completed" ? "success" : status;
  const query = transactionId ? `?transactionId=${encodeURIComponent(transactionId)}` : "";

  return {
    success: status === "completed",
    status,
    redirectURL: `${config.frontend_url.split(",")[0]}/payment/${path}${query}`,
  };
};

const formatBdt = (amount: Prisma.Decimal | number | string) =>
  `BDT ${Number(amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const createBkashPayment = async (userId: string, payload: ICreateBkashPaymentPayload) => {
  await cancelUnpaidBookings();

  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId },
    include: {
      user: { select: { email: true, phone: true } },
      property: { select: { status: true, isDeleted: true } },
    },
  });

  if (!booking || booking.userId !== userId) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }

  if (booking.status !== BookingStatus.PENDING_PAYMENT) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      booking.status === BookingStatus.CONFIRMED
        ? "This booking is already paid"
        : "This booking was cancelled. Please create a new booking.",
    );
  }

  if (booking.property.isDeleted || booking.property.status !== PropertyStatus.AVAILABLE) {
    throw new AppError(httpStatus.BAD_REQUEST, "This property is no longer available for booking");
  }

  // An abandoned checkout should not block a new attempt.
  await prisma.payment.updateMany({
    where: { bookingId: booking.id, status: { in: IN_PROGRESS } },
    data: { status: PaymentStatus.CANCELLED },
  });

  const payment = await prisma.payment.create({
    data: {
      transactionId: generatePaymentTransactionId(),
      bookingId: booking.id,
      userId,
      amount: booking.amount,
      status: PaymentStatus.PENDING,
    },
  });

  try {
    const bkashResult = await createBkashCheckout({
      amount: booking.amount.toFixed(2),
      payerReference: booking.user.phone ?? booking.user.email,
      invoiceNumber: payment.transactionId,
    });

    if (!bkashResult.paymentID || !bkashResult.bkashURL) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.FAILED,
          gatewayResponse: bkashResult as Prisma.InputJsonValue,
        },
      });

      throw new AppError(
        httpStatus.BAD_GATEWAY,
        bkashResult.statusMessage ?? "Failed to create bKash payment",
      );
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.PROCESSING,
        gatewayPaymentId: bkashResult.paymentID,
        gatewayResponse: bkashResult as Prisma.InputJsonValue,
      },
    });

    return {
      paymentId: payment.id,
      transactionId: payment.transactionId,
      amount: booking.amount.toString(),
      paymentURL: bkashResult.bkashURL,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.FAILED,
        gatewayResponse: { error: error instanceof Error ? error.message : "Unknown error" },
      },
    });

    throw new AppError(httpStatus.BAD_GATEWAY, "Unable to reach bKash. Please try again.");
  }
};

/**
 * Marks the payment as successful and confirms the booking in ONE transaction.
 * Safe to call twice (idempotent).
 */
export const completeBkashPayment = async (
  paymentID: string,
  bkashResult: IBkashExecuteResponse,
) => {
  const outcome = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { gatewayPaymentId: paymentID },
      include: { booking: { include: { property: { select: { id: true, title: true } } } } },
    });

    if (!payment) {
      throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      return { payment, alreadyCompleted: true };
    }

    if (!new Prisma.Decimal(payment.amount).equals(new Prisma.Decimal(bkashResult.amount ?? 0))) {
      throw new AppError(httpStatus.BAD_REQUEST, "Payment amount does not match bKash amount");
    }

    const paidAt = parseBkashPaymentDate(bkashResult.paymentExecuteTime);

    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.SUCCESS,
        gatewayTrxId: bkashResult.trxID,
        paidAt,
        gatewayResponse: bkashResult as Prisma.InputJsonValue,
      },
      include: { booking: { include: { property: { select: { id: true, title: true } } } } },
    });

    await tx.booking.update({
      where: { id: payment.bookingId },
      data: { status: BookingStatus.CONFIRMED, confirmedAt: paidAt, cancelledAt: null },
    });

    // The property is now under offer: take it off the market.
    await tx.property.update({
      where: { id: payment.booking.propertyId },
      data: { status: PropertyStatus.PENDING },
    });

    // Other buyers' unpaid bookings for the same property can no longer be completed.
    await tx.booking.updateMany({
      where: {
        propertyId: payment.booking.propertyId,
        id: { not: payment.bookingId },
        status: BookingStatus.PENDING_PAYMENT,
      },
      data: { status: BookingStatus.CANCELLED, cancelledAt: new Date() },
    });

    return { payment: updatedPayment, alreadyCompleted: false };
  });

  if (!outcome.alreadyCompleted) {
    const { payment } = outcome;
    const propertyTitle = payment.booking.property.title;

    await NotificationService.createNotification({
      userId: payment.userId,
      type: NotificationType.PAYMENT_SUCCESS,
      title: "Payment successful",
      message: `We received ${formatBdt(payment.amount)} for "${propertyTitle}". Your booking is confirmed.`,
      link: "/dashboard/user/payments",
      email: {
        subject: "Payment received: your booking is confirmed",
        actionText: "View payment history",
        details: [
          { label: "Property", value: propertyTitle },
          { label: "Amount", value: formatBdt(payment.amount) },
          { label: "Transaction ID", value: payment.transactionId },
          { label: "bKash TrxID", value: payment.gatewayTrxId ?? "-" },
        ],
      },
    });

    await NotificationService.createNotification({
      userId: payment.booking.agentId,
      type: NotificationType.BOOKING_CONFIRMED,
      title: "New confirmed booking",
      message: `A buyer paid the booking fee for "${propertyTitle}". The listing is now marked as pending.`,
      link: "/dashboard/agent/bookings",
      email: { subject: `Booking confirmed: ${propertyTitle}`, actionText: "View bookings" },
    });
  }

  return redirectTo("completed", outcome.payment.transactionId);
};

const markPaymentAs = async (
  paymentID: string,
  status: PaymentStatus,
  gatewayResponse: Prisma.InputJsonValue,
) => {
  await prisma.payment.updateMany({
    where: { gatewayPaymentId: paymentID, status: { in: IN_PROGRESS } },
    data: { status, gatewayResponse },
  });

  const payment = await prisma.payment.findUnique({
    where: { gatewayPaymentId: paymentID },
    select: { transactionId: true },
  });

  return payment?.transactionId;
};

const bkashPaymentCallback = async (
  paymentID: string,
  status?: string,
): Promise<IPaymentCallbackResult> => {
  const payment = await prisma.payment.findUnique({
    where: { gatewayPaymentId: paymentID },
    select: { status: true, transactionId: true },
  });

  if (!payment) {
    return redirectTo("failed");
  }

  if (payment.status === PaymentStatus.SUCCESS) {
    return redirectTo("completed", payment.transactionId);
  }

  if (status === "cancel") {
    const transactionId = await markPaymentAs(paymentID, PaymentStatus.CANCELLED, { status });
    return redirectTo("cancelled", transactionId);
  }

  if (status !== "success") {
    const transactionId = await markPaymentAs(paymentID, PaymentStatus.FAILED, {
      status: status ?? "unknown",
    });
    return redirectTo("failed", transactionId);
  }

  let result: IBkashExecuteResponse;
  try {
    result = await executeBkashPayment(paymentID);

    // Execute can fail if it already ran (e.g. a repeated callback): ask bKash for the real status.
    if (!isBkashPaymentCompleted(result)) {
      result = await queryBkashPayment(paymentID);
    }
  } catch (error) {
    logger.error("bKash execute failed", error);
    try {
      result = await queryBkashPayment(paymentID);
    } catch {
      return redirectTo("failed", payment.transactionId);
    }
  }

  if (isBkashPaymentCompleted(result)) {
    try {
      return await completeBkashPayment(paymentID, result);
    } catch (error) {
      logger.error("Completing bKash payment failed", error);
      return redirectTo("failed", payment.transactionId);
    }
  }

  const transactionId = await markPaymentAs(
    paymentID,
    PaymentStatus.FAILED,
    result as Prisma.InputJsonValue,
  );
  return redirectTo("failed", transactionId);
};

const getPayments = async (scope: PaymentWhereInput, query: IQuery) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(query, [
    "createdAt",
    "amount",
    "paidAt",
  ]);

  const andConditions: PaymentWhereInput[] = [scope];

  if (query.status) andConditions.push({ status: query.status as PaymentStatus });
  if (query.searchTerm) {
    andConditions.push({
      OR: [
        { transactionId: { contains: query.searchTerm, mode: "insensitive" } },
        { gatewayTrxId: { contains: query.searchTerm, mode: "insensitive" } },
        { booking: { property: { title: { contains: query.searchTerm, mode: "insensitive" } } } },
        { user: { name: { contains: query.searchTerm, mode: "insensitive" } } },
      ],
    });
  }

  const where: PaymentWhereInput = { AND: andConditions };

  const [payments, total, totals] = await prisma.$transaction([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ [sortBy]: sortOrder }, { id: "asc" }],
      include: paymentInclude,
      omit: { gatewayResponse: true },
    }),
    prisma.payment.count({ where }),
    prisma.payment.aggregate({
      where: { AND: [...andConditions, { status: PaymentStatus.SUCCESS }] },
      _sum: { amount: true },
    }),
  ]);

  return {
    data: payments,
    meta: { ...buildMeta(page, limit, total), totalPaid: totals._sum.amount ?? 0 },
  };
};

const getMyPayments = (userId: string, query: IQuery) => getPayments({ userId }, query);

const getAgentPayments = (agentId: string, query: IQuery) =>
  getPayments({ booking: { agentId } }, query);

const getAllPayments = (query: IQuery) => getPayments({}, query);

const getSinglePayment = async (paymentId: string, user: RequestUser) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: paymentInclude,
    omit: { gatewayResponse: user.role !== Role.ADMIN },
  });

  const canView =
    payment &&
    (payment.userId === user.userId ||
      payment.booking.agent.id === user.userId ||
      user.role === Role.ADMIN);

  if (!payment || !canView) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  }

  return payment;
};

export const PaymentService = {
  createBkashPayment,
  bkashPaymentCallback,
  getMyPayments,
  getAgentPayments,
  getAllPayments,
  getSinglePayment,
};
