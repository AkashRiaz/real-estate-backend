import httpStatus from "http-status";
import { buildMeta, calculatePagination } from "../../helper/paginationHelper";
import { IQuery } from "../../interfaces";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { ISubscribeNewsletterPayload } from "./newsletter.interface";

const subscribeNewsletter = async (payload: ISubscribeNewsletterPayload) => {
  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email: payload.email },
  });

  if (existing) {
    return { subscriber: existing, isNew: false };
  }

  const subscriber = await prisma.newsletterSubscriber.create({ data: payload });

  return { subscriber, isNew: true };
};

const getAllSubscribers = async (query: IQuery) => {
  const { page, limit, skip, sortOrder } = calculatePagination(query, ["createdAt"]);

  const where = query.searchTerm
    ? { email: { contains: query.searchTerm, mode: "insensitive" as const } }
    : {};

  const [subscribers, total] = await prisma.$transaction([
    prisma.newsletterSubscriber.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: sortOrder },
    }),
    prisma.newsletterSubscriber.count({ where }),
  ]);

  return { data: subscribers, meta: buildMeta(page, limit, total) };
};

const deleteSubscriber = async (id: string) => {
  const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { id } });

  if (!subscriber) {
    throw new AppError(httpStatus.NOT_FOUND, "Subscriber not found");
  }

  return prisma.newsletterSubscriber.delete({ where: { id } });
};

export const NewsletterService = {
  subscribeNewsletter,
  getAllSubscribers,
  deleteSubscriber,
};
