import z from "zod";

export const notificationIdParamsZodSchema = z.object({
  id: z.uuid("Invalid notification ID"),
});

export const getNotificationsQueryZodSchema = z.object({
  page: z.string().regex(/^\d+$/, "page must be a number").optional(),
  limit: z.string().regex(/^\d+$/, "limit must be a number").optional(),
  isRead: z.enum(["true", "false"]).optional(),
});
