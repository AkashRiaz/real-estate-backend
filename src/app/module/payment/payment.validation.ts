import { z } from "zod";

export const CreateBkashPaymentZodSchema = z.object({
  bookingId: z.uuid("Invalid booking ID"),
});

export const bkashCallbackQueryZodSchema = z.object({
  paymentID: z.string().trim().min(1, "paymentID is required").max(100),
  status: z.enum(["success", "failure", "cancel"]).optional(),
  signature: z.string().optional(),
  apiVersion: z.string().optional(),
});

export const paymentIdParamsZodSchema = z.object({
  paymentId: z.uuid("Invalid payment ID"),
});

export const getPaymentsQueryZodSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "SUCCESS", "FAILED", "CANCELLED"]).optional(),
  searchTerm: z.string().max(100).optional(),
  page: z.string().regex(/^\d+$/, "page must be a number").optional(),
  limit: z.string().regex(/^\d+$/, "limit must be a number").optional(),
  sortBy: z.enum(["createdAt", "amount", "paidAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
