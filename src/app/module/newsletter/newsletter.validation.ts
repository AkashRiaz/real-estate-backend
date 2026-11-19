import z from "zod";

export const subscribeNewsletterZodSchema = z.object({
  email: z.email("Email must be a valid email address").toLowerCase(),
});

export const newsletterIdParamsZodSchema = z.object({
  id: z.uuid("Invalid subscriber ID"),
});

export const getSubscribersQueryZodSchema = z.object({
  searchTerm: z.string().max(100).optional(),
  page: z.string().regex(/^\d+$/, "page must be a number").optional(),
  limit: z.string().regex(/^\d+$/, "limit must be a number").optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
