import httpStatus from "http-status";
import { InquiryWhereInput } from "../../../generated/prisma/models";
import { InquiryStatus, NotificationType, Role } from "../../../generated/prisma/enums";
import { buildMeta, calculatePagination } from "../../helper/paginationHelper";
import { IQuery } from "../../interfaces";
import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import { NotificationService } from "../notification/notification.service";
import { publicPropertyWhere } from "../property/property.utils";
import {
  ICreateInquiryPayload,
  ICreateInquiryReplyPayload,
  IUpdateInquiryStatusPayload,
} from "./inquiry.interface";

const OPEN_STATUSES: InquiryStatus[] = [InquiryStatus.NEW, InquiryStatus.IN_PROGRESS];

const inquiryListInclude = {
  property: {
    select: {
      id: true,
      title: true,
      slug: true,
      city: true,
      area: true,
      images: { where: { isCover: true }, take: 1, select: { url: true } },
    },
  },
  user: { select: { id: true, name: true, email: true, phone: true, imageUrl: true } },
  agent: { select: { id: true, name: true, email: true, phone: true, imageUrl: true } },
  _count: { select: { replies: true } },
} as const;

const createInquiry = async (userId: string, payload: ICreateInquiryPayload) => {
  const property = await prisma.property.findFirst({
    where: { id: payload.propertyId, ...publicPropertyWhere },
    select: { id: true, title: true, agentId: true },
  });

  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, "Property not found");
  }

  const openInquiry = await prisma.inquiry.findFirst({
    where: { userId, propertyId: property.id, status: { in: OPEN_STATUSES } },
    select: { id: true },
  });

  if (openInquiry) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You already have an open inquiry for this property. Please continue the conversation there.",
    );
  }

  const inquiry = await prisma.inquiry.create({
    data: { ...payload, userId, agentId: property.agentId },
    include: inquiryListInclude,
  });

  await NotificationService.createNotification({
    userId: property.agentId,
    type: NotificationType.INQUIRY_RECEIVED,
    title: "New inquiry received",
    message: `${inquiry.user.name} asked about "${property.title}": ${payload.subject}`,
    link: `/dashboard/agent/inquiries/${inquiry.id}`,
    email: {
      subject: `New inquiry: ${property.title}`,
      actionText: "Reply to inquiry",
      details: [
        { label: "From", value: inquiry.user.name },
        { label: "Subject", value: payload.subject },
        ...(payload.phone ? [{ label: "Phone", value: payload.phone }] : []),
      ],
    },
  });

  return inquiry;
};

const getInquiries = async (scope: InquiryWhereInput, query: IQuery) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(query, [
    "createdAt",
    "updatedAt",
    "status",
  ]);

  const andConditions: InquiryWhereInput[] = [scope];

  if (query.status) andConditions.push({ status: query.status as InquiryStatus });
  if (query.propertyId) andConditions.push({ propertyId: query.propertyId });

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        { subject: { contains: query.searchTerm, mode: "insensitive" } },
        { property: { title: { contains: query.searchTerm, mode: "insensitive" } } },
        { user: { name: { contains: query.searchTerm, mode: "insensitive" } } },
      ],
    });
  }

  const where: InquiryWhereInput = { AND: andConditions };

  const [inquiries, total] = await prisma.$transaction([
    prisma.inquiry.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: inquiryListInclude,
    }),
    prisma.inquiry.count({ where }),
  ]);

  return { data: inquiries, meta: buildMeta(page, limit, total) };
};

const getMyInquiries = (userId: string, query: IQuery) => getInquiries({ userId }, query);

const getAgentInquiries = (agentId: string, query: IQuery) => getInquiries({ agentId }, query);

const getAllInquiries = (query: IQuery) => getInquiries({}, query);

const findAccessibleInquiry = async (id: string, user: RequestUser) => {
  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    include: {
      ...inquiryListInclude,
      replies: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, name: true, imageUrl: true, role: true } } },
      },
    },
  });

  if (!inquiry) {
    throw new AppError(httpStatus.NOT_FOUND, "Inquiry not found");
  }

  const isParticipant = inquiry.userId === user.userId || inquiry.agentId === user.userId;

  if (!isParticipant && user.role !== Role.ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "You do not have access to this inquiry");
  }

  return inquiry;
};

const getInquiryById = (id: string, user: RequestUser) => findAccessibleInquiry(id, user);

const createInquiryReply = async (
  id: string,
  user: RequestUser,
  payload: ICreateInquiryReplyPayload,
) => {
  const inquiry = await findAccessibleInquiry(id, user);
  const isAgent = inquiry.agentId === user.userId;
  const isBuyer = inquiry.userId === user.userId;

  if (!isAgent && !isBuyer) {
    throw new AppError(httpStatus.FORBIDDEN, "Only the buyer and the agent can reply");
  }

  if (inquiry.status === InquiryStatus.CLOSED) {
    throw new AppError(httpStatus.BAD_REQUEST, "This inquiry is closed");
  }

  const reply = await prisma.$transaction(async (tx) => {
    const created = await tx.inquiryReply.create({
      data: { inquiryId: id, senderId: user.userId, message: payload.message },
      include: { sender: { select: { id: true, name: true, imageUrl: true, role: true } } },
    });

    // First agent reply moves the inquiry forward; a buyer reply reopens a resolved one.
    const nextStatus =
      isAgent && inquiry.status === InquiryStatus.NEW
        ? InquiryStatus.IN_PROGRESS
        : isBuyer && inquiry.status === InquiryStatus.RESOLVED
          ? InquiryStatus.IN_PROGRESS
          : inquiry.status;

    await tx.inquiry.update({ where: { id }, data: { status: nextStatus } });

    return created;
  });

  await NotificationService.createNotification({
    userId: isAgent ? inquiry.userId : inquiry.agentId,
    type: NotificationType.INQUIRY_REPLIED,
    title: `New reply from ${user.name}`,
    message: `${user.name} replied about "${inquiry.property.title}".`,
    link: isAgent
      ? `/dashboard/user/inquiries/${inquiry.id}`
      : `/dashboard/agent/inquiries/${inquiry.id}`,
    // Buyers get an email when the agent answers.
    ...(isAgent && {
      email: {
        subject: `${user.name} replied to your inquiry`,
        actionText: "Read the reply",
        details: [{ label: "Property", value: inquiry.property.title }],
      },
    }),
  });

  return reply;
};

const updateInquiryStatus = async (
  id: string,
  user: RequestUser,
  payload: IUpdateInquiryStatusPayload,
) => {
  const inquiry = await findAccessibleInquiry(id, user);

  if (user.role !== Role.ADMIN && inquiry.agentId !== user.userId) {
    throw new AppError(httpStatus.FORBIDDEN, "Only the listing agent can change the status");
  }

  return prisma.inquiry.update({
    where: { id },
    data: { status: payload.status },
    include: inquiryListInclude,
  });
};

export const InquiryService = {
  createInquiry,
  getMyInquiries,
  getAgentInquiries,
  getAllInquiries,
  getInquiryById,
  createInquiryReply,
  updateInquiryStatus,
};
