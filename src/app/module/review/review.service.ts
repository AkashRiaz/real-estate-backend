import httpStatus from "http-status";
import { ReviewWhereInput } from "../../../generated/prisma/models";
import { ReviewTarget, Role, UserStatus } from "../../../generated/prisma/enums";
import { buildMeta, calculatePagination } from "../../helper/paginationHelper";
import { IQuery } from "../../interfaces";
import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import { publicPropertyWhere } from "../property/property.utils";
import {
  ICreateReviewPayload,
  IUpdateReviewPayload,
  IUpdateReviewVisibilityPayload,
} from "./review.interface";
import { recalculateRatings } from "./review.utils";

const reviewInclude = {
  user: { select: { id: true, name: true, imageUrl: true } },
  property: { select: { id: true, title: true, slug: true } },
  agent: {
    select: { id: true, name: true, imageUrl: true, agentProfile: { select: { agencyName: true } } },
  },
} as const;

/**
 * Reviews are only allowed after a real interaction
 * (an inquiry, a viewing or a booking) with the property or agent.
 */
const assertHasInteracted = async (userId: string, scope: { propertyId?: string; agentId?: string }) => {
  const where = { userId, ...scope };

  const [inquiries, viewings, bookings] = await prisma.$transaction([
    prisma.inquiry.count({ where }),
    prisma.viewing.count({ where }),
    prisma.booking.count({ where }),
  ]);

  if (inquiries + viewings + bookings === 0) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can review only after sending an inquiry, booking a viewing or making a booking",
    );
  }
};

const createReview = async (userId: string, payload: ICreateReviewPayload) => {
  if (payload.target === ReviewTarget.PROPERTY) {
    const property = await prisma.property.findFirst({
      where: { id: payload.propertyId, ...publicPropertyWhere },
      select: { id: true, agentId: true },
    });

    if (!property) {
      throw new AppError(httpStatus.NOT_FOUND, "Property not found");
    }

    await assertHasInteracted(userId, { propertyId: property.id });
  } else {
    if (payload.agentId === userId) {
      throw new AppError(httpStatus.BAD_REQUEST, "You cannot review yourself");
    }

    const agent = await prisma.user.findFirst({
      where: {
        id: payload.agentId,
        role: Role.AGENT,
        isDeleted: false,
        status: UserStatus.ACTIVE,
      },
      select: { id: true },
    });

    if (!agent) {
      throw new AppError(httpStatus.NOT_FOUND, "Agent not found");
    }

    await assertHasInteracted(userId, { agentId: agent.id });
  }

  const duplicate = await prisma.review.findFirst({
    where: {
      userId,
      ...(payload.target === ReviewTarget.PROPERTY
        ? { propertyId: payload.propertyId }
        : { agentId: payload.agentId }),
    },
    select: { id: true },
  });

  if (duplicate) {
    throw new AppError(httpStatus.CONFLICT, "You have already reviewed this. You can edit your review instead.");
  }

  return prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: { ...payload, userId },
      include: reviewInclude,
    });

    await recalculateRatings(tx, review);

    return review;
  });
};

const getReviews = async (where: ReviewWhereInput, query: IQuery) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(query, [
    "createdAt",
    "rating",
  ]);

  const [reviews, total] = await prisma.$transaction([
    prisma.review.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ [sortBy]: sortOrder }, { id: "asc" }],
      include: reviewInclude,
    }),
    prisma.review.count({ where }),
  ]);

  return { data: reviews, meta: buildMeta(page, limit, total) };
};

const getTargetReviews = async (query: IQuery) => {
  const where: ReviewWhereInput = {
    isHidden: false,
    ...(query.propertyId ? { propertyId: query.propertyId } : { agentId: query.agentId }),
  };

  const [result, summary] = await Promise.all([
    getReviews(where, query),
    prisma.review.aggregate({ where, _avg: { rating: true }, _count: { _all: true } }),
  ]);

  return {
    data: result.data,
    meta: {
      ...result.meta,
      averageRating: summary._avg.rating ? Math.round(summary._avg.rating * 10) / 10 : 0,
      totalReviews: summary._count._all,
    },
  };
};

const getTestimonials = async () => {
  return prisma.review.findMany({
    where: { target: ReviewTarget.AGENT, isHidden: false, rating: { gte: 4 } },
    orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
    take: 6,
    include: reviewInclude,
  });
};

const getMyReviews = (userId: string, query: IQuery) => getReviews({ userId }, query);

const getAllReviews = async (query: IQuery) => {
  const andConditions: ReviewWhereInput[] = [];

  if (query.target) andConditions.push({ target: query.target as ReviewTarget });
  if (query.rating) andConditions.push({ rating: Number(query.rating) });
  if (query.isHidden) andConditions.push({ isHidden: query.isHidden === "true" });
  if (query.searchTerm) {
    andConditions.push({
      OR: [
        { comment: { contains: query.searchTerm, mode: "insensitive" } },
        { user: { name: { contains: query.searchTerm, mode: "insensitive" } } },
        { property: { title: { contains: query.searchTerm, mode: "insensitive" } } },
        { agent: { name: { contains: query.searchTerm, mode: "insensitive" } } },
      ],
    });
  }

  return getReviews({ AND: andConditions }, query);
};

const updateReview = async (id: string, userId: string, payload: IUpdateReviewPayload) => {
  const review = await prisma.review.findUnique({ where: { id } });

  if (!review || review.userId !== userId) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.review.update({
      where: { id },
      data: payload,
      include: reviewInclude,
    });

    await recalculateRatings(tx, updated);

    return updated;
  });
};

const updateReviewVisibility = async (id: string, payload: IUpdateReviewVisibilityPayload) => {
  const review = await prisma.review.findUnique({ where: { id } });

  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.review.update({
      where: { id },
      data: { isHidden: payload.isHidden },
      include: reviewInclude,
    });

    await recalculateRatings(tx, updated);

    return updated;
  });
};

const deleteReview = async (id: string, user: RequestUser) => {
  const review = await prisma.review.findUnique({ where: { id } });

  if (!review || (review.userId !== user.userId && user.role !== Role.ADMIN)) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  }

  return prisma.$transaction(async (tx) => {
    const deleted = await tx.review.delete({ where: { id } });

    await recalculateRatings(tx, deleted);

    return deleted;
  });
};

export const ReviewService = {
  createReview,
  getTargetReviews,
  getTestimonials,
  getMyReviews,
  getAllReviews,
  updateReview,
  updateReviewVisibility,
  deleteReview,
};
