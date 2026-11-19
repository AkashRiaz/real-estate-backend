import z from "zod";
import { phoneZodSchema } from "../auth/auth.validation";

export const createInquiryZodSchema = z.object({
  propertyId: z.uuid("Invalid property ID"),
  subject: z.string().trim().min(5, "Subject must be at least 5 characters").max(120),
  message: z
    .string()
    .trim()
    .min(20, "Message must be at least 20 characters")
    .max(2000, "Message must be at most 2000 characters"),
  phone: phoneZodSchema.optional(),
});

export const createInquiryReplyZodSchema = z.object({
  message: z
    .string()
    .trim()
    .min(2, "Reply cannot be empty")
    .max(2000, "Reply must be at most 2000 characters"),
});

export const updateInquiryStatusZodSchema = z.object({
  status: z.enum(["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"], "Invalid inquiry status"),
});

export const inquiryIdParamsZodSchema = z.object({
  id: z.uuid("Invalid inquiry ID"),
});

export const getInquiriesQueryZodSchema = z.object({
  searchTerm: z.string().max(100).optional(),
  status: z.enum(["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  propertyId: z.uuid("Invalid property ID").optional(),
  page: z.string().regex(/^\d+$/, "page must be a number").optional(),
  limit: z.string().regex(/^\d+$/, "limit must be a number").optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "status"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
