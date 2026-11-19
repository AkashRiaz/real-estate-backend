import httpStatus from "http-status";
import { ViewingWhereInput } from "../../../generated/prisma/models";
import {
  NotificationType,
  PropertyStatus,
  Role,
  ViewingStatus,
} from "../../../generated/prisma/enums";
import { buildMeta, calculatePagination } from "../../helper/paginationHelper";
import { IQuery } from "../../interfaces";
import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import { NotificationService } from "../notification/notification.service";
import { publicPropertyWhere } from "../property/property.utils";
import {
  ICancelViewingPayload,
  ICreateViewingPayload,
  IRescheduleViewingPayload,
  IUpdateViewingStatusPayload,
} from "./viewing.interface";

const ACTIVE_STATUSES: ViewingStatus[] = [
  ViewingStatus.PENDING,
  ViewingStatus.APPROVED,
  ViewingStatus.RESCHEDULED,
];

// Which current statuses each action may move from.
const ALLOWED_TRANSITIONS: Record<string, ViewingStatus[]> = {
  APPROVED: [ViewingStatus.PENDING, ViewingStatus.RESCHEDULED],
  REJECTED: [ViewingStatus.PENDING, ViewingStatus.RESCHEDULED],
  COMPLETED: [ViewingStatus.APPROVED, ViewingStatus.RESCHEDULED],
  RESCHEDULED: ACTIVE_STATUSES,
  CANCELLED: ACTIVE_STATUSES,
};

const STATUS_LABELS: Record<ViewingStatus, string> = {
  PENDING: "pending",
  APPROVED: "confirmed",
  RESCHEDULED: "rescheduled",
  REJECTED: "declined",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

const viewingInclude = {
  property: {
    select: {
      id: true,
      title: true,
      slug: true,
      address: true,
      area: true,
      city: true,
      images: { where: { isCover: true }, take: 1, select: { url: true } },
    },
  },
  user: { select: { id: true, name: true, email: true, phone: true, imageUrl: true } },
  agent: { select: { id: true, name: true, email: true, phone: true, imageUrl: true } },
} as const;

const formatDateTime = (date: Date) =>
  date.toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short",
  });

const assertTransition = (current: ViewingStatus, next: ViewingStatus) => {
  if (!ALLOWED_TRANSITIONS[next]?.includes(current)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `A ${STATUS_LABELS[current]} viewing cannot be marked as ${STATUS_LABELS[next]}`,
    );
  }
};

const notifyViewingChange = async (
  viewing: { id: string; userId: string; scheduledAt: Date; property: { title: string } },
  status: ViewingStatus,
  note?: string | null,
) => {
  await NotificationService.createNotification({
    userId: viewing.userId,
    type: NotificationType.VIEWING_STATUS_CHANGED,
    title: `Viewing ${STATUS_LABELS[status]}`,
    message: `Your viewing for "${viewing.property.title}" on ${formatDateTime(
      viewing.scheduledAt,
    )} is ${STATUS_LABELS[status]}.${note ? ` Note from agent: ${note}` : ""}`,
    link: "/dashboard/user/viewings",
    email: {
      subject: `Your viewing was ${STATUS_LABELS[status]}`,
      actionText: "See my viewings",
      details: [
        { label: "Property", value: viewing.property.title },
        { label: "Date & time", value: formatDateTime(viewing.scheduledAt) },
        { label: "Status", value: STATUS_LABELS[status] },
      ],
    },
  });
};

const findViewingForAgent = async (id: string, user: RequestUser) => {
  const viewing = await prisma.viewing.findUnique({ where: { id }, include: viewingInclude });

  if (!viewing) {
    throw new AppError(httpStatus.NOT_FOUND, "Viewing not found");
  }

  if (user.role !== Role.ADMIN && viewing.agentId !== user.userId) {
    throw new AppError(httpStatus.FORBIDDEN, "Only the listing agent can manage this viewing");
  }

  return viewing;
};

const createViewing = async (userId: string, payload: ICreateViewingPayload) => {
  const property = await prisma.property.findFirst({
    where: { id: payload.propertyId, ...publicPropertyWhere },
    select: { id: true, title: true, agentId: true, status: true },
  });

  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, "Property not found");
  }

  if (property.status !== PropertyStatus.AVAILABLE) {
    throw new AppError(httpStatus.BAD_REQUEST, "This property is no longer available for viewings");
  }

  const activeViewing = await prisma.viewing.findFirst({
    where: { userId, propertyId: property.id, status: { in: ACTIVE_STATUSES } },
    select: { id: true },
  });

  if (activeViewing) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You already have an active viewing request for this property",
    );
  }

  const viewing = await prisma.viewing.create({
    data: { ...payload, userId, agentId: property.agentId },
    include: viewingInclude,
  });

  await NotificationService.createNotification({
    userId: property.agentId,
    type: NotificationType.VIEWING_REQUESTED,
    title: "New viewing request",
    message: `${viewing.user.name} wants to visit "${property.title}" on ${formatDateTime(
      viewing.scheduledAt,
    )}.`,
    link: "/dashboard/agent/viewings",
    email: {
      subject: `Viewing request: ${property.title}`,
      actionText: "Review request",
      details: [
        { label: "Requested by", value: viewing.user.name },
        { label: "Date & time", value: formatDateTime(viewing.scheduledAt) },
      ],
    },
  });

  return viewing;
};

const getViewings = async (scope: ViewingWhereInput, query: IQuery) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(
    query,
    ["scheduledAt", "createdAt", "status"],
    "scheduledAt",
  );

  const andConditions: ViewingWhereInput[] = [scope];

  if (query.status) andConditions.push({ status: query.status as ViewingStatus });
  if (query.upcoming === "true") {
    andConditions.push({ scheduledAt: { gte: new Date() }, status: { in: ACTIVE_STATUSES } });
  }
  if (query.searchTerm) {
    andConditions.push({
      OR: [
        { property: { title: { contains: query.searchTerm, mode: "insensitive" } } },
        { user: { name: { contains: query.searchTerm, mode: "insensitive" } } },
      ],
    });
  }

  const where: ViewingWhereInput = { AND: andConditions };

  const [viewings, total] = await prisma.$transaction([
    prisma.viewing.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: viewingInclude,
    }),
    prisma.viewing.count({ where }),
  ]);

  return { data: viewings, meta: buildMeta(page, limit, total) };
};

const getMyViewings = (userId: string, query: IQuery) => getViewings({ userId }, query);

const getAgentViewings = (agentId: string, query: IQuery) => getViewings({ agentId }, query);

const getAllViewings = (query: IQuery) => getViewings({}, query);

const updateViewingStatus = async (
  id: string,
  user: RequestUser,
  payload: IUpdateViewingStatusPayload,
) => {
  const viewing = await findViewingForAgent(id, user);
  const nextStatus = payload.status as ViewingStatus;

  assertTransition(viewing.status, nextStatus);

  if (nextStatus === ViewingStatus.COMPLETED && viewing.scheduledAt > new Date()) {
    throw new AppError(httpStatus.BAD_REQUEST, "A viewing can only be completed after it takes place");
  }

  const updated = await prisma.viewing.update({
    where: { id },
    data: { status: nextStatus, agentNote: payload.agentNote ?? viewing.agentNote },
    include: viewingInclude,
  });

  await notifyViewingChange(updated, nextStatus, payload.agentNote);

  return updated;
};

const rescheduleViewing = async (
  id: string,
  user: RequestUser,
  payload: IRescheduleViewingPayload,
) => {
  const viewing = await findViewingForAgent(id, user);

  assertTransition(viewing.status, ViewingStatus.RESCHEDULED);

  const updated = await prisma.viewing.update({
    where: { id },
    data: {
      status: ViewingStatus.RESCHEDULED,
      scheduledAt: payload.scheduledAt,
      agentNote: payload.agentNote ?? viewing.agentNote,
    },
    include: viewingInclude,
  });

  await notifyViewingChange(updated, ViewingStatus.RESCHEDULED, payload.agentNote);

  return updated;
};

const cancelViewing = async (id: string, user: RequestUser, payload: ICancelViewingPayload) => {
  const viewing = await prisma.viewing.findUnique({ where: { id }, include: viewingInclude });

  if (!viewing) {
    throw new AppError(httpStatus.NOT_FOUND, "Viewing not found");
  }

  const isBuyer = viewing.userId === user.userId;
  const isAgent = viewing.agentId === user.userId;

  if (!isBuyer && !isAgent) {
    throw new AppError(httpStatus.FORBIDDEN, "You cannot cancel this viewing");
  }

  assertTransition(viewing.status, ViewingStatus.CANCELLED);

  const updated = await prisma.viewing.update({
    where: { id },
    data: {
      status: ViewingStatus.CANCELLED,
      cancelReason: payload.reason,
      cancelledById: user.userId,
    },
    include: viewingInclude,
  });

  if (isAgent) {
    await notifyViewingChange(updated, ViewingStatus.CANCELLED, payload.reason);
  } else {
    await NotificationService.createNotification({
      userId: viewing.agentId,
      type: NotificationType.VIEWING_STATUS_CHANGED,
      title: "Viewing cancelled by buyer",
      message: `${viewing.user.name} cancelled the viewing for "${viewing.property.title}" on ${formatDateTime(
        viewing.scheduledAt,
      )}.${payload.reason ? ` Reason: ${payload.reason}` : ""}`,
      link: "/dashboard/agent/viewings",
    });
  }

  return updated;
};

export const ViewingService = {
  createViewing,
  getMyViewings,
  getAgentViewings,
  getAllViewings,
  updateViewingStatus,
  rescheduleViewing,
  cancelViewing,
};
