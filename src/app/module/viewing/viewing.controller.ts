import { Request, Response } from "express";
import httpStatus from "http-status";
import { IQuery } from "../../interfaces";
import { RequestUser } from "../../middleware/checkAuth";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ViewingService } from "./viewing.service";

const createViewing = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as RequestUser;
  const result = await ViewingService.createViewing(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Viewing requested. The agent will confirm your time soon.",
    data: result,
  });
});

const getMyViewings = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as RequestUser;
  const result = await ViewingService.getMyViewings(userId, req.query as IQuery);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Your viewings retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getAgentViewings = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as RequestUser;
  const result = await ViewingService.getAgentViewings(userId, req.query as IQuery);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Viewing requests retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getAllViewings = catchAsync(async (req: Request, res: Response) => {
  const result = await ViewingService.getAllViewings(req.query as IQuery);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Viewings retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const updateViewingStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await ViewingService.updateViewingStatus(
    req.params.id as string,
    req.user as RequestUser,
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Viewing status updated successfully",
    data: result,
  });
});

const rescheduleViewing = catchAsync(async (req: Request, res: Response) => {
  const result = await ViewingService.rescheduleViewing(
    req.params.id as string,
    req.user as RequestUser,
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Viewing rescheduled successfully",
    data: result,
  });
});

const cancelViewing = catchAsync(async (req: Request, res: Response) => {
  const result = await ViewingService.cancelViewing(
    req.params.id as string,
    req.user as RequestUser,
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Viewing cancelled successfully",
    data: result,
  });
});

export const ViewingController = {
  createViewing,
  getMyViewings,
  getAgentViewings,
  getAllViewings,
  updateViewingStatus,
  rescheduleViewing,
  cancelViewing,
};
