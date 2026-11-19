import httpStatus from "http-status";
import { ContactMessageWhereInput } from "../../../generated/prisma/models";
import { ContactStatus } from "../../../generated/prisma/enums";
import { buildMeta, calculatePagination } from "../../helper/paginationHelper";
import { IQuery } from "../../interfaces";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import {
  ICreateContactMessagePayload,
  IUpdateContactStatusPayload,
} from "./contact.interface";

const createContactMessage = (payload: ICreateContactMessagePayload) =>
  prisma.contactMessage.create({
    data: payload,
    select: { id: true, name: true, subject: true, createdAt: true },
  });

const getAllContactMessages = async (query: IQuery) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(query, [
    "createdAt",
    "status",
  ]);

  const andConditions: ContactMessageWhereInput[] = [];

  if (query.status) andConditions.push({ status: query.status as ContactStatus });
  if (query.searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: query.searchTerm, mode: "insensitive" } },
        { email: { contains: query.searchTerm, mode: "insensitive" } },
        { subject: { contains: query.searchTerm, mode: "insensitive" } },
      ],
    });
  }

  const where: ContactMessageWhereInput = { AND: andConditions };

  const [messages, total, unread] = await prisma.$transaction([
    prisma.contactMessage.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.contactMessage.count({ where }),
    prisma.contactMessage.count({ where: { status: ContactStatus.NEW } }),
  ]);

  return { data: messages, meta: { ...buildMeta(page, limit, total), unreadCount: unread } };
};

const findContactMessage = async (id: string) => {
  const message = await prisma.contactMessage.findUnique({ where: { id } });

  if (!message) {
    throw new AppError(httpStatus.NOT_FOUND, "Message not found");
  }

  return message;
};

const updateContactStatus = async (id: string, payload: IUpdateContactStatusPayload) => {
  await findContactMessage(id);

  return prisma.contactMessage.update({ where: { id }, data: { status: payload.status } });
};

const deleteContactMessage = async (id: string) => {
  await findContactMessage(id);

  return prisma.contactMessage.delete({ where: { id } });
};

export const ContactService = {
  createContactMessage,
  getAllContactMessages,
  updateContactStatus,
  deleteContactMessage,
};
