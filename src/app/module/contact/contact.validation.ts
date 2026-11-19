import z from "zod";
import { phoneZodSchema } from "../auth/auth.validation";

export const createContactMessageZodSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  email: z.email("Email must be a valid email address").toLowerCase(),
  phone: phoneZodSchema.optional(),
  subject: z.string().trim().min(5, "Subject must be at least 5 characters").max(120),
  message: z
    .string()
    .trim()
    .min(20, "Message must be at least 20 characters")
    .max(3000, "Message must be at most 3000 characters"),
});

export const updateContactStatusZodSchema = z.object({
  status: z.enum(["NEW", "READ", "RESOLVED"], "Status must be NEW, READ or RESOLVED"),
});

export const contactIdParamsZodSchema = z.object({
  id: z.uuid("Invalid message ID"),
});

export const getContactMessagesQueryZodSchema = z.object({
  status: z.enum(["NEW", "READ", "RESOLVED"]).optional(),
  searchTerm: z.string().max(100).optional(),
  page: z.string().regex(/^\d+$/, "page must be a number").optional(),
  limit: z.string().regex(/^\d+$/, "limit must be a number").optional(),
  sortBy: z.enum(["createdAt", "status"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
