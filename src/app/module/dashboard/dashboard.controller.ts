import { Request, Response } from "express";
import httpStatus from "http-status";
import { RequestUser } from "../../middleware/checkAuth";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { DashboardService } from "./dashboard.service";

const getPublicStats = catchAsync(async (_req: Request, res: Response) => {
  const result = await DashboardService.getPublicStats();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Platform statistics retrieved successfully",
    data: result,
  });
});

const getAdminOverview = catchAsync(async (_req: Request, res: Response) => {
  const result = await DashboardService.getAdminOverview();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Admin dashboard data retrieved successfully",
    data: result,
  });
});

const getAgentOverview = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as RequestUser;
  const result = await DashboardService.getAgentOverview(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Agent dashboard data retrieved successfully",
    data: result,
  });
});

const getUserOverview = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as RequestUser;
  const result = await DashboardService.getUserOverview(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Dashboard data retrieved successfully",
    data: result,
  });
});

export const DashboardController = {
  getPublicStats,
  getAdminOverview,
  getAgentOverview,
  getUserOverview,
};
