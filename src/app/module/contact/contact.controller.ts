import { Request, Response } from "express";
import httpStatus from "http-status";
import { IQuery } from "../../interfaces";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ContactService } from "./contact.service";

const createContactMessage = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactService.createContactMessage(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Thanks for reaching out! Our team will reply within one business day.",
    data: result,
  });
});

const getAllContactMessages = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactService.getAllContactMessages(req.query as IQuery);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Contact messages retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const updateContactStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactService.updateContactStatus(req.params.id as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Message status updated successfully",
    data: result,
  });
});

const deleteContactMessage = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactService.deleteContactMessage(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Message deleted successfully",
    data: result,
  });
});

export const ContactController = {
  createContactMessage,
  getAllContactMessages,
  updateContactStatus,
  deleteContactMessage,
};
