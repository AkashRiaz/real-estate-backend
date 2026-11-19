import { Request, Response } from "express";
import httpStatus from "http-status";
import { IQuery } from "../../interfaces";
import { RequestUser } from "../../middleware/checkAuth";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ReviewService } from "./review.service";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as RequestUser;
  const result = await ReviewService.createReview(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Thank you! Your review was published.",
    data: result,
  });
});

const getTargetReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getTargetReviews(req.query as IQuery);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Reviews retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getTestimonials = catchAsync(async (_req: Request, res: Response) => {
  const result = await ReviewService.getTestimonials();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Testimonials retrieved successfully",
    data: result,
  });
});

const getMyReviews = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as RequestUser;
  const result = await ReviewService.getMyReviews(userId, req.query as IQuery);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Your reviews retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getAllReviews(req.query as IQuery);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Reviews retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as RequestUser;
  const result = await ReviewService.updateReview(req.params.id as string, userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review updated successfully",
    data: result,
  });
});

const updateReviewVisibility = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.updateReviewVisibility(req.params.id as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.isHidden ? "Review hidden" : "Review is visible again",
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.deleteReview(
    req.params.id as string,
    req.user as RequestUser,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review deleted successfully",
    data: result,
  });
});

export const ReviewController = {
  createReview,
  getTargetReviews,
  getTestimonials,
  getMyReviews,
  getAllReviews,
  updateReview,
  updateReviewVisibility,
  deleteReview,
};
