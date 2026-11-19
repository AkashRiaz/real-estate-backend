import httpStatus from "http-status";
import { BookingWhereInput } from "../../../generated/prisma/models";
import {
  BookingStatus,
  PaymentStatus,
  PropertyStatus,
  Role,
} from "../../../generated/prisma/enums";
import { buildMeta, calculatePagination } from "../../helper/paginationHelper";
import { IQuery } from "../../interfaces";
import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import { cancelUnpaidBookings } from "../../lib/cron";
import { publicPropertyWhere } from "../property/property.utils";
import { ICancelBookingPayload, ICreateBookingPayload } from "./booking.interface";

const ACTIVE_STATUSES: BookingStatus[] = [BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED];

export const bookingInclude = {
  property: {
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      purpose: true,
      area: true,
      city: true,
      status: true,
      images: { where: { isCover: true }, take: 1, select: { url: true } },
    },
  },
  user: { select: { id: true, name: true, email: true, phone: true, imageUrl: true } },
  agent: { select: { id: true, name: true, email: true, phone: true, imageUrl: true } },
  payments: {
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      transactionId: true,
      amount: true,
      status: true,
      gatewayTrxId: true,
      paidAt: true,
      createdAt: true,
    },
  },
} as const;

const createBooking = async (userId: string, payload: ICreateBookingPayload) => {
  // Serverless has no long-running cron, so expired unpaid bookings are also released here.
  await cancelUnpaidBookings();

  const property = await prisma.property.findFirst({
    where: { id: payload.propertyId, ...publicPropertyWhere },
    select: { id: true, agentId: true, status: true, bookingFee: true },
  });

  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, "Property not found");
  }

  if (property.status !== PropertyStatus.AVAILABLE) {
    throw new AppError(httpStatus.BAD_REQUEST, "This property is no longer available for booking");
  }

  const activeBooking = await prisma.booking.findFirst({
    where: { userId, propertyId: property.id, status: { in: ACTIVE_STATUSES } },
    select: { id: true, status: true },
  });

  if (activeBooking) {
    throw new AppError(
      httpStatus.CONFLICT,
      activeBooking.status === BookingStatus.CONFIRMED
        ? "You have already booked this property"
        : "You already have a booking waiting for payment for this property",
    );
  }

  return prisma.booking.create({
    data: {
      propertyId: property.id,
      userId,
      agentId: property.agentId,
      amount: property.bookingFee,
      note: payload.note,
    },
    include: bookingInclude,
  });
};

const getBookings = async (scope: BookingWhereInput, query: IQuery) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(query, [
    "createdAt",
    "amount",
    "status",
  ]);

  const andConditions: BookingWhereInput[] = [scope];

  if (query.status) andConditions.push({ status: query.status as BookingStatus });
  if (query.searchTerm) {
    andConditions.push({
      OR: [
        { property: { title: { contains: query.searchTerm, mode: "insensitive" } } },
        { user: { name: { contains: query.searchTerm, mode: "insensitive" } } },
      ],
    });
  }

  const where: BookingWhereInput = { AND: andConditions };

  const [bookings, total] = await prisma.$transaction([
    prisma.booking.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: bookingInclude,
    }),
    prisma.booking.count({ where }),
  ]);

  return { data: bookings, meta: buildMeta(page, limit, total) };
};

const getMyBookings = (userId: string, query: IQuery) => getBookings({ userId }, query);

const getAgentBookings = (agentId: string, query: IQuery) => getBookings({ agentId }, query);

const getAllBookings = (query: IQuery) => getBookings({}, query);

const getBookingById = async (id: string, user: RequestUser) => {
  const booking = await prisma.booking.findUnique({ where: { id }, include: bookingInclude });

  const canView =
    booking &&
    (booking.userId === user.userId ||
      booking.agentId === user.userId ||
      user.role === Role.ADMIN);

  if (!booking || !canView) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }

  return booking;
};

const cancelBooking = async (id: string, user: RequestUser, payload: ICancelBookingPayload) => {
  const booking = await prisma.booking.findUnique({ where: { id } });
  const isOwner = booking?.userId === user.userId;
  const isAdmin = user.role === Role.ADMIN;

  if (!booking || (!isOwner && !isAdmin)) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }

  if (booking.status === BookingStatus.CANCELLED) {
    throw new AppError(httpStatus.BAD_REQUEST, "This booking is already cancelled");
  }

  if (booking.status === BookingStatus.CONFIRMED && !isAdmin) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "A paid booking can only be cancelled by our support team. Please contact us.",
    );
  }

  return prisma.$transaction(async (tx) => {
    await tx.payment.updateMany({
      where: {
        bookingId: id,
        status: { in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING] },
      },
      data: { status: PaymentStatus.CANCELLED },
    });

    // Cancelling a confirmed booking puts the property back on the market.
    if (booking.status === BookingStatus.CONFIRMED) {
      await tx.property.update({
        where: { id: booking.propertyId },
        data: { status: PropertyStatus.AVAILABLE },
      });
    }

    return tx.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
        ...(payload.reason && {
          note: booking.note ? `${booking.note}\nCancelled: ${payload.reason}` : `Cancelled: ${payload.reason}`,
        }),
      },
      include: bookingInclude,
    });
  });
};

export const BookingService = {
  createBooking,
  getMyBookings,
  getAgentBookings,
  getAllBookings,
  getBookingById,
  cancelBooking,
};
