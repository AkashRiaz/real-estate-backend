import httpStatus from "http-status";
import { UserWhereInput } from "../../../generated/prisma/models";
import { Role, UserStatus } from "../../../generated/prisma/enums";
import { buildMeta, calculatePagination } from "../../helper/paginationHelper";
import { IQuery } from "../../interfaces";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { deleteFromCloudinary, uploadToCloudinary } from "../../utils/uploadToCloudinary";
import { IUpdateMyProfilePayload, IUpdateUserStatusPayload } from "./user.interface";

const updateMyProfile = async (
  userId: string,
  payload: IUpdateMyProfilePayload,
  profileImage?: Express.Multer.File,
) => {
  const existingUser = await prisma.user.findUnique({ where: { id: userId } });

  if (!existingUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const { removeImage, ...data } = payload;
  let imageData: { imageUrl: string | null; imagePublicId: string | null } | undefined;

  if (profileImage) {
    const uploaded = await uploadToCloudinary(profileImage, "real-estate/avatars");
    imageData = { imageUrl: uploaded.secure_url, imagePublicId: uploaded.public_id };
  } else if (removeImage) {
    imageData = { imageUrl: null, imagePublicId: null };
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { ...data, ...imageData },
    omit: { password: true },
    include: { agentProfile: true },
  });

  // Remove the old image only after the DB update succeeded.
  if (imageData && existingUser.imagePublicId) {
    await deleteFromCloudinary([existingUser.imagePublicId]);
  }

  return updatedUser;
};

const getAllUsers = async (query: IQuery) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(query, [
    "name",
    "email",
    "createdAt",
    "lastLoginAt",
  ]);

  const andConditions: UserWhereInput[] = [{ isDeleted: false }];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: query.searchTerm, mode: "insensitive" } },
        { email: { contains: query.searchTerm, mode: "insensitive" } },
        { phone: { contains: query.searchTerm, mode: "insensitive" } },
      ],
    });
  }

  if (query.role) andConditions.push({ role: query.role as Role });
  if (query.status) andConditions.push({ status: query.status as UserStatus });

  const where: UserWhereInput = { AND: andConditions };

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      omit: { password: true },
      include: {
        agentProfile: true,
        _count: { select: { properties: true, bookings: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { data: users, meta: buildMeta(page, limit, total) };
};

const getUserById = async (id: string) => {
  const user = await prisma.user.findFirst({
    where: { id, isDeleted: false },
    omit: { password: true },
    include: {
      agentProfile: true,
      _count: {
        select: {
          properties: true,
          favorites: true,
          sentInquiries: true,
          viewings: true,
          bookings: true,
          writtenReviews: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};

const assertManageableUser = async (adminId: string, id: string) => {
  if (adminId === id) {
    throw new AppError(httpStatus.BAD_REQUEST, "You cannot change your own account here");
  }

  const user = await prisma.user.findFirst({ where: { id, isDeleted: false } });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.role === Role.ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "Admin accounts cannot be modified");
  }

  return user;
};

const updateUserStatus = async (
  adminId: string,
  id: string,
  payload: IUpdateUserStatusPayload,
) => {
  await assertManageableUser(adminId, id);

  const user = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id },
      data: { status: payload.status },
      omit: { password: true },
    });

    // A blocked user is signed out everywhere.
    if (payload.status === UserStatus.BLOCKED) {
      await tx.refreshToken.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    return updatedUser;
  });

  return user;
};

const deleteUser = async (adminId: string, id: string) => {
  await assertManageableUser(adminId, id);

  const [user] = await prisma.$transaction([
    prisma.user.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), status: UserStatus.BLOCKED },
      omit: { password: true },
    }),
    prisma.refreshToken.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
    // Hide an agent's listings together with the account.
    prisma.property.updateMany({
      where: { agentId: id, isDeleted: false },
      data: { isDeleted: true, deletedAt: new Date() },
    }),
  ]);

  return user;
};

export const UserService = {
  updateMyProfile,
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
};
