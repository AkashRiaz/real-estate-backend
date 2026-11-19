import z from "zod";

export const createBookingZodSchema = z.object({
  propertyId: z.uuid("Invalid property ID"),
  note: z.string().trim().max(500, "Note must be at most 500 characters").optional(),
});

export const cancelBookingZodSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export const bookingIdParamsZodSchema = z.object({
  id: z.uuid("Invalid booking ID"),
});

export const getBookingsQueryZodSchema = z.object({
  status: z.enum(["PENDING_PAYMENT", "CONFIRMED", "CANCELLED"]).optional(),
  searchTerm: z.string().max(100).optional(),
  page: z.string().regex(/^\d+$/, "page must be a number").optional(),
  limit: z.string().regex(/^\d+$/, "limit must be a number").optional(),
  sortBy: z.enum(["createdAt", "amount", "status"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
