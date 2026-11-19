import { Request, Response } from "express";
import httpStatus from "http-status";
import { IQuery } from "../../interfaces";
import { RequestUser } from "../../middleware/checkAuth";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserService } from "./user.service";

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as RequestUser;
  const result = await UserService.updateMyProfile(userId, req.body, req.file);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Profile updated successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers(req.query as IQuery);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Users retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getUserById(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User retrieved successfully",
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as RequestUser;
  const result = await UserService.updateUserStatus(userId, req.params.id as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `User ${result.status === "BLOCKED" ? "blocked" : "unblocked"} successfully`,
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as RequestUser;
  const result = await UserService.deleteUser(userId, req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User deleted successfully",
    data: result,
  });
});

export const UserController = {
  updateMyProfile,
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
};
