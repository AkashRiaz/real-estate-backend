import httpStatus from "http-status";
import { buildMeta, calculatePagination } from "../../helper/paginationHelper";
import { IQuery } from "../../interfaces";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { propertyCardSelect, publicPropertyWhere } from "../property/property.utils";
import { IAddFavoritePayload } from "./favorite.interface";

const getMyFavorites = async (userId: string, query: IQuery) => {
  const { page, limit, skip } = calculatePagination(query, ["createdAt"]);

  // Hide favorites whose listing was later removed or unpublished.
  const where = { userId, property: publicPropertyWhere };

  const [favorites, total] = await prisma.$transaction([
    prisma.favorite.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true, property: { select: propertyCardSelect } },
    }),
    prisma.favorite.count({ where }),
  ]);

  return { data: favorites, meta: buildMeta(page, limit, total) };
};

const getMyFavoriteIds = async (userId: string) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { propertyId: true },
  });

  return favorites.map((favorite) => favorite.propertyId);
};

const addFavorite = async (userId: string, payload: IAddFavoritePayload) => {
  const property = await prisma.property.findFirst({
    where: { id: payload.propertyId, ...publicPropertyWhere },
    select: { id: true },
  });

  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, "Property not found");
  }

  // Idempotent: adding twice keeps a single favorite.
  return prisma.favorite.upsert({
    where: { userId_propertyId: { userId, propertyId: payload.propertyId } },
    update: {},
    create: { userId, propertyId: payload.propertyId },
  });
};

const removeFavorite = async (userId: string, propertyId: string) => {
  const result = await prisma.favorite.deleteMany({ where: { userId, propertyId } });

  if (!result.count) {
    throw new AppError(httpStatus.NOT_FOUND, "This property is not in your favorites");
  }

  return { propertyId };
};

export const FavoriteService = {
  getMyFavorites,
  getMyFavoriteIds,
  addFavorite,
  removeFavorite,
};
