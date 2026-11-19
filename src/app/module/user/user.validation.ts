import z from "zod";
import { phoneZodSchema } from "../auth/auth.validation";

export const userIdParamsZodSchema = z.object({
  id: z.uuid("Invalid user ID"),
});

export const updateMyProfileZodSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60).optional(),
  phone: phoneZodSchema.nullable().optional(),
  removeImage: z.boolean().optional(),
});

export const updateUserStatusZodSchema = z.object({
  status: z.enum(["ACTIVE", "BLOCKED"], "Status must be ACTIVE or BLOCKED"),
});

export const getAllUsersQueryZodSchema = z.object({
  searchTerm: z.string().max(100).optional(),
  role: z.enum(["USER", "AGENT", "ADMIN"]).optional(),
  status: z.enum(["ACTIVE", "BLOCKED"]).optional(),
  page: z.string().regex(/^\d+$/, "page must be a number").optional(),
  limit: z.string().regex(/^\d+$/, "limit must be a number").optional(),
  sortBy: z.enum(["name", "email", "createdAt", "lastLoginAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
