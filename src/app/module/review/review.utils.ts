import { Prisma } from "../../../generated/prisma/client";

type TransactionClient = Prisma.TransactionClient;

const roundRating = (value: number | null) => (value ? Math.round(value * 10) / 10 : 0);

/**
 * Recalculates the cached rating of a property and/or agent.
 * Always called inside the same transaction as the review write.
 */
export const recalculateRatings = async (
  tx: TransactionClient,
  target: { propertyId?: string | null; agentId?: string | null },
) => {
  if (target.propertyId) {
    const stats = await tx.review.aggregate({
      where: { propertyId: target.propertyId, isHidden: false },
      _avg: { rating: true },
      _count: { _all: true },
    });

    await tx.property.update({
      where: { id: target.propertyId },
      data: { avgRating: roundRating(stats._avg.rating), totalReviews: stats._count._all },
    });
  }

  if (target.agentId) {
    const stats = await tx.review.aggregate({
      where: { agentId: target.agentId, isHidden: false },
      _avg: { rating: true },
      _count: { _all: true },
    });

    await tx.agentProfile.update({
      where: { userId: target.agentId },
      data: { avgRating: roundRating(stats._avg.rating), totalReviews: stats._count._all },
    });
  }
};
