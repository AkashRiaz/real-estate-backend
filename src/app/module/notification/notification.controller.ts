import { Request, Response } from "express";
import httpStatus from "http-status";
import { IQuery } from "../../interfaces";
import { RequestUser } from "../../middleware/checkAuth";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { NotificationService } from "./notification.service";

const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as RequestUser;
  const result = await NotificationService.getMyNotifications(userId, req.query as IQuery);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Notifications retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const markNotificationAsRead = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as RequestUser;
  const result = await NotificationService.markNotificationAsRead(
    userId,
    req.params.id as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Notification marked as read",
    data: result,
  });
});

const markAllNotificationsAsRead = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as RequestUser;
  const result = await NotificationService.markAllNotificationsAsRead(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All notifications marked as read",
    data: result,
  });
});

const deleteNotification = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as RequestUser;
  const result = await NotificationService.deleteNotification(
    userId,
    req.params.id as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Notification deleted successfully",
    data: result,
  });
});

export const NotificationController = {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};
