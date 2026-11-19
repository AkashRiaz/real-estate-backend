import { Request, Response } from "express";
import httpStatus from "http-status";
import { IQuery } from "../../interfaces";
import { RequestUser } from "../../middleware/checkAuth";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { InquiryService } from "./inquiry.service";

const createInquiry = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as RequestUser;
  const result = await InquiryService.createInquiry(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Inquiry sent to the agent successfully",
    data: result,
  });
});

const getMyInquiries = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as RequestUser;
  const result = await InquiryService.getMyInquiries(userId, req.query as IQuery);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Your inquiries retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getAgentInquiries = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as RequestUser;
  const result = await InquiryService.getAgentInquiries(userId, req.query as IQuery);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Inquiries retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getAllInquiries = catchAsync(async (req: Request, res: Response) => {
  const result = await InquiryService.getAllInquiries(req.query as IQuery);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Inquiries retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getInquiryById = catchAsync(async (req: Request, res: Response) => {
  const result = await InquiryService.getInquiryById(
    req.params.id as string,
    req.user as RequestUser,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Inquiry retrieved successfully",
    data: result,
  });
});

const createInquiryReply = catchAsync(async (req: Request, res: Response) => {
  const result = await InquiryService.createInquiryReply(
    req.params.id as string,
    req.user as RequestUser,
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Reply sent successfully",
    data: result,
  });
});

const updateInquiryStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await InquiryService.updateInquiryStatus(
    req.params.id as string,
    req.user as RequestUser,
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Inquiry status updated successfully",
    data: result,
  });
});

export const InquiryController = {
  createInquiry,
  getMyInquiries,
  getAgentInquiries,
  getAllInquiries,
  getInquiryById,
  createInquiryReply,
  updateInquiryStatus,
};
