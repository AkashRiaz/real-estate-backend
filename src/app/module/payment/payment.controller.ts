import { Request, Response } from "express";
import httpStatus from "http-status";
import { IQuery } from "../../interfaces";
import { RequestUser } from "../../middleware/checkAuth";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PaymentService } from "./payment.service";

const createBkashPayment = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as RequestUser;
  const result = await PaymentService.createBkashPayment(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "bKash payment created. Redirect the user to paymentURL.",
    data: result,
  });
});

const bkashPaymentCallback = catchAsync(async (req: Request, res: Response) => {
  const { paymentID, status } = req.query as { paymentID: string; status?: string };

  const result = await PaymentService.bkashPaymentCallback(paymentID, status);

  return res.redirect(result.redirectURL);
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as RequestUser;
  const result = await PaymentService.getMyPayments(userId, req.query as IQuery);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My payments retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getAgentPayments = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as RequestUser;
  const result = await PaymentService.getAgentPayments(userId, req.query as IQuery);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payments for your listings retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getAllPayments(req.query as IQuery);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payments retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSinglePayment = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getSinglePayment(
    req.params.paymentId as string,
    req.user as RequestUser,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment retrieved successfully",
    data: result,
  });
});

export const PaymentController = {
  createBkashPayment,
  bkashPaymentCallback,
  getMyPayments,
  getAgentPayments,
  getAllPayments,
  getSinglePayment,
};
