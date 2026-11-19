import z from "zod";

const ratingZodSchema = z
  .number("Rating must be a number")
  .int("Rating must be a whole number")
  .min(1, "Rating must be between 1 and 5")
  .max(5, "Rating must be between 1 and 5");

const commentZodSchema = z
  .string()
  .trim()
  .min(20, "Review must be at least 20 characters")
  .max(1000, "Review must be at most 1000 characters");

export const createReviewZodSchema = z
  .object({
    target: z.enum(["PROPERTY", "AGENT"], "Target must be PROPERTY or AGENT"),
    propertyId: z.uuid("Invalid property ID").optional(),
    agentId: z.uuid("Invalid agent ID").optional(),
    rating: ratingZodSchema,
    comment: commentZodSchema,
  })
  .refine(
    (data) =>
      data.target === "PROPERTY"
        ? Boolean(data.propertyId) && !data.agentId
        : Boolean(data.agentId) && !data.propertyId,
    { message: "Send propertyId for a property review or agentId for an agent review" },
  );

export const updateReviewZodSchema = z
  .object({
    rating: ratingZodSchema.optional(),
    comment: commentZodSchema.optional(),
  })
  .refine((data) => data.rating !== undefined || data.comment !== undefined, {
    message: "Nothing to update",
  });

export const updateReviewVisibilityZodSchema = z.object({
  isHidden: z.boolean("isHidden must be true or false"),
});

export const reviewIdParamsZodSchema = z.object({
  id: z.uuid("Invalid review ID"),
});

const paginationQuery = {
  page: z.string().regex(/^\d+$/, "page must be a number").optional(),
  limit: z.string().regex(/^\d+$/, "limit must be a number").optional(),
  sortBy: z.enum(["createdAt", "rating"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
};

export const getTargetReviewsQueryZodSchema = z
  .object({
    propertyId: z.uuid("Invalid property ID").optional(),
    agentId: z.uuid("Invalid agent ID").optional(),
    ...paginationQuery,
  })
  .refine((data) => Boolean(data.propertyId) !== Boolean(data.agentId), {
    message: "Send either propertyId or agentId",
  });

export const getReviewsQueryZodSchema = z.object({
  target: z.enum(["PROPERTY", "AGENT"]).optional(),
  rating: z.enum(["1", "2", "3", "4", "5"]).optional(),
  isHidden: z.enum(["true", "false"]).optional(),
  searchTerm: z.string().max(100).optional(),
  ...paginationQuery,
});
