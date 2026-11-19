import httpStatus from "http-status";
import { config } from "../../config";
import { buildMeta, calculatePagination } from "../../helper/paginationHelper";
import { IQuery } from "../../interfaces";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { sendEmailSafely } from "../../utils/sendEmail";
import { ICreateNotificationPayload } from "./notification.interface";

/**
 * Used by other modules (inquiry, viewing, payment, property).
 * Stores an in-app notification and optionally emails the user.
 */
const createNotification = async (payload: ICreateNotificationPayload) => {
  const { email, ...data } = payload;

  const notification = await prisma.notification.create({ data });

  if (email) {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { name: true, email: true },
    });

    if (user) {
      sendEmailSafely({
        to: user.email,
        subject: email.subject,
        template: "notification",
        data: {
          name: user.name,
          title: payload.title,
          message: payload.message,
          details: email.details ?? [],
          actionUrl: payload.link ? `${config.frontend_url}${payload.link}` : null,
          actionText: email.actionText ?? "Open EstateHub",
        },
      });
    }
  }

  return notification;
};

const getMyNotifications = async (userId: string, query: IQuery) => {
  const { page, limit, skip } = calculatePagination(query, ["createdAt"]);

  const where = {
    userId,
    ...(query.isRead ? { isRead: query.isRead === "true" } : {}),
  };

  const [notifications, total, unreadCount] = await prisma.$transaction([
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    data: notifications,
    meta: { ...buildMeta(page, limit, total), unreadCount },
  };
};

const markNotificationAsRead = async (userId: string, id: string) => {
  const notification = await prisma.notification.findFirst({
    where: { id, userId },
  });

  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, "Notification not found");
  }

  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
};

const markAllNotificationsAsRead = async (userId: string) => {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  return { updated: result.count };
};

const deleteNotification = async (userId: string, id: string) => {
  const notification = await prisma.notification.findFirst({
    where: { id, userId },
  });

  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, "Notification not found");
  }

  return prisma.notification.delete({ where: { id } });
};

export const NotificationService = {
  createNotification,
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};
