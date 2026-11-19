import httpStatus from "http-status";
import { UserOrderByWithRelationInput, UserWhereInput } from "../../../generated/prisma/models";
import {
  ApprovalStatus,
  PropertyStatus,
  Role,
  UserStatus,
} from "../../../generated/prisma/enums";
import { buildMeta, calculatePagination } from "../../helper/paginationHelper";
import { IQuery } from "../../interfaces";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { propertyCardSelect, publicPropertyWhere } from "../property/property.utils";
import { IUpdateMyAgentProfilePayload, IVerifyAgentPayload } from "./agent.interface";

const activeAgentWhere: UserWhereInput = {
  role: Role.AGENT,
  isDeleted: false,
  status: UserStatus.ACTIVE,
  agentProfile: { isNot: null },
};

const publicAgentSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  imageUrl: true,
  createdAt: true,
  agentProfile: true,
  _count: {
    select: { properties: { where: publicPropertyWhere } },
  },
} as const;

const getAllAgents = async (query: IQuery) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(
    query,
    ["rating", "experience", "listings", "createdAt", "name"],
    "rating",
  );

  const andConditions: UserWhereInput[] = [activeAgentWhere];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: query.searchTerm, mode: "insensitive" } },
        { agentProfile: { agencyName: { contains: query.searchTerm, mode: "insensitive" } } },
      ],
    });
  }

  if (query.area) {
    andConditions.push({ agentProfile: { serviceAreas: { has: query.area } } });
  }

  if (query.isVerified) {
    andConditions.push({ agentProfile: { isVerified: query.isVerified === "true" } });
  }

  const orderByMap: Record<string, UserOrderByWithRelationInput> = {
    rating: { agentProfile: { avgRating: sortOrder } },
    experience: { agentProfile: { experienceYears: sortOrder } },
    listings: { properties: { _count: sortOrder } },
    createdAt: { createdAt: sortOrder },
    name: { name: sortOrder },
  };

  const where: UserWhereInput = { AND: andConditions };

  const [agents, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: [orderByMap[sortBy], { createdAt: "desc" }],
      select: publicAgentSelect,
    }),
    prisma.user.count({ where }),
  ]);

  return { data: agents, meta: buildMeta(page, limit, total) };
};

const getAgentById = async (id: string) => {
  const agent = await prisma.user.findFirst({
    where: { id, ...activeAgentWhere },
    select: {
      ...publicAgentSelect,
      properties: {
        where: publicPropertyWhere,
        orderBy: { createdAt: "desc" },
        take: 8,
        select: propertyCardSelect,
      },
    },
  });

  if (!agent) {
    throw new AppError(httpStatus.NOT_FOUND, "Agent not found");
  }

  const [closedDeals, ratingBreakdown] = await prisma.$transaction([
    prisma.property.count({
      where: {
        agentId: id,
        approvalStatus: ApprovalStatus.APPROVED,
        status: { in: [PropertyStatus.SOLD, PropertyStatus.RENTED] },
      },
    }),
    prisma.review.groupBy({
      by: ["rating"],
      where: { agentId: id, isHidden: false },
      orderBy: { rating: "desc" },
      _count: { _all: true },
    }),
  ]);

  return {
    ...agent,
    stats: {
      activeListings: agent._count.properties,
      closedDeals,
      ratingBreakdown: ratingBreakdown.map((group) => ({
        rating: group.rating,
        count: (group._count as { _all: number })._all,
      })),
    },
  };
};

const updateMyAgentProfile = async (userId: string, payload: IUpdateMyAgentProfilePayload) => {
  const profile = await prisma.agentProfile.findUnique({ where: { userId } });

  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "Agent profile not found");
  }

  return prisma.agentProfile.update({
    where: { userId },
    data: payload,
  });
};

const verifyAgent = async (id: string, payload: IVerifyAgentPayload) => {
  const profile = await prisma.agentProfile.findUnique({ where: { userId: id } });

  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "Agent not found");
  }

  return prisma.agentProfile.update({
    where: { userId: id },
    data: { isVerified: payload.isVerified },
  });
};

export const AgentService = {
  getAllAgents,
  getAgentById,
  updateMyAgentProfile,
  verifyAgent,
};
