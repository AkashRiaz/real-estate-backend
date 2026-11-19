import z from "zod";

export const addFavoriteZodSchema = z.object({
  propertyId: z.uuid("Invalid property ID"),
});

export const favoritePropertyParamsZodSchema = z.object({
  propertyId: z.uuid("Invalid property ID"),
});

export const getFavoritesQueryZodSchema = z.object({
  page: z.string().regex(/^\d+$/, "page must be a number").optional(),
  limit: z.string().regex(/^\d+$/, "limit must be a number").optional(),
});
