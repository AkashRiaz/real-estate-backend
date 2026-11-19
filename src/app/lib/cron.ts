import cron from "node-cron";
import { BookingStatus, PaymentStatus } from "../../generated/prisma/enums";
import { logger } from "../utils/logger";
import { prisma } from "./prisma";

const UNPAID_BOOKING_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Cancels bookings that were never paid, so the property is free to book again.
 */
export const cancelUnpaidBookings = async () => {
  const cutoff = new Date(Date.now() - UNPAID_BOOKING_TTL_MS);

  const staleBookings = await prisma.booking.findMany({
    where: { status: BookingStatus.PENDING_PAYMENT, createdAt: { lt: cutoff } },
    select: { id: true },
  });

  if (!staleBookings.length) return;

  const bookingIds = staleBookings.map((booking) => booking.id);

  await prisma.$transaction([
    prisma.payment.updateMany({
      where: {
        bookingId: { in: bookingIds },
        status: { in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING] },
      },
      data: { status: PaymentStatus.CANCELLED },
    }),
    prisma.booking.updateMany({
      where: { id: { in: bookingIds } },
      data: { status: BookingStatus.CANCELLED, cancelledAt: new Date() },
    }),
  ]);

  logger.info(`Cancelled ${bookingIds.length} unpaid booking(s).`);
};

const deleteExpiredRefreshTokens = async () => {
  await prisma.refreshToken.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
};

export const startCronJobs = () => {
  cron.schedule("*/10 * * * *", () => {
    cancelUnpaidBookings().catch((error) => logger.error("Cron: unpaid bookings", error));
  });

  cron.schedule("0 3 * * *", () => {
    deleteExpiredRefreshTokens().catch((error) => logger.error("Cron: refresh tokens", error));
  });
};
