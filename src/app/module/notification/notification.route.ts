import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { NotificationController } from "./notification.controller";
import {
  getNotificationsQueryZodSchema,
  notificationIdParamsZodSchema,
} from "./notification.validation";

const router = Router();

router.get(
  "/",
  auth(),
  validateRequest(getNotificationsQueryZodSchema, "query"),
  NotificationController.getMyNotifications,
);

router.patch("/read-all", auth(), NotificationController.markAllNotificationsAsRead);

router.patch(
  "/:id/read",
  auth(),
  validateRequest(notificationIdParamsZodSchema, "params"),
  NotificationController.markNotificationAsRead,
);

router.delete(
  "/:id",
  auth(),
  validateRequest(notificationIdParamsZodSchema, "params"),
  NotificationController.deleteNotification,
);

export const NotificationRoutes = router;
