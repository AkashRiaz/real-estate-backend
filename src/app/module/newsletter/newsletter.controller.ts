import { Request, Response } from "express";
import httpStatus from "http-status";
import { IQuery } from "../../interfaces";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { NewsletterService } from "./newsletter.service";

const subscribeNewsletter = catchAsync(async (req: Request, res: Response) => {
  const { subscriber, isNew } = await NewsletterService.subscribeNewsletter(req.body);

  sendResponse(res, {
    success: true,
    statusCode: isNew ? httpStatus.CREATED : httpStatus.OK,
    message: isNew
      ? "You are subscribed! Expect new listings and market updates every week."
      : "You are already subscribed to our newsletter.",
    data: { email: subscriber.email },
  });
});

const getAllSubscribers = catchAsync(async (req: Request, res: Response) => {
  const result = await NewsletterService.getAllSubscribers(req.query as IQuery);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Subscribers retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const deleteSubscriber = catchAsync(async (req: Request, res: Response) => {
  const result = await NewsletterService.deleteSubscriber(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Subscriber removed successfully",
    data: result,
  });
});

export const NewsletterController = {
  subscribeNewsletter,
  getAllSubscribers,
  deleteSubscriber,
};
