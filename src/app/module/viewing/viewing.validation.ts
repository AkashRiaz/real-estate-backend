import z from "zod";

const MAX_DAYS_AHEAD = 60;

const futureDateZodSchema = z.coerce
  .date("scheduledAt must be a valid date")
  .refine((date) => date.getTime() > Date.now() + 60 * 60 * 1000, {
    message: "Viewing time must be at least 1 hour from now",
  })
  .refine((date) => date.getTime() < Date.now() + MAX_DAYS_AHEAD * 24 * 60 * 60 * 1000, {
    message: `Viewing time must be within the next ${MAX_DAYS_AHEAD} days`,
  });

export const createViewingZodSchema = z.object({
  propertyId: z.uuid("Invalid property ID"),
  scheduledAt: futureDateZodSchema,
  message: z.string().trim().max(500, "Message must be at most 500 characters").optional(),
});

export const updateViewingStatusZodSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "COMPLETED"], "Status must be APPROVED, REJECTED or COMPLETED"),
  agentNote: z.string().trim().max(500).optional(),
});

export const rescheduleViewingZodSchema = z.object({
  scheduledAt: futureDateZodSchema,
  agentNote: z.string().trim().max(500).optional(),
});

export const cancelViewingZodSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export const viewingIdParamsZodSchema = z.object({
  id: z.uuid("Invalid viewing ID"),
});

export const getViewingsQueryZodSchema = z.object({
  status: z
    .enum(["PENDING", "APPROVED", "RESCHEDULED", "REJECTED", "CANCELLED", "COMPLETED"])
    .optional(),
  upcoming: z.enum(["true", "false"]).optional(),
  searchTerm: z.string().max(100).optional(),
  page: z.string().regex(/^\d+$/, "page must be a number").optional(),
  limit: z.string().regex(/^\d+$/, "limit must be a number").optional(),
  sortBy: z.enum(["scheduledAt", "createdAt", "status"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
