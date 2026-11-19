import { Request, Response } from "express";
import httpStatus from "http-status";
import { IQuery } from "../../interfaces";
import { RequestUser } from "../../middleware/checkAuth";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { BookingService } from "./booking.service";

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as RequestUser;
  const result = await BookingService.createBooking(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Booking created. Please pay the booking fee within 1 hour to confirm it.",
    data: result,
  });
});

const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as RequestUser;
  const result = await BookingService.getMyBookings(userId, req.query as IQuery);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Your bookings retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getAgentBookings = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as RequestUser;
  const result = await BookingService.getAgentBookings(userId, req.query as IQuery);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Bookings retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingService.getAllBookings(req.query as IQuery);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Bookings retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getBookingById = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingService.getBookingById(
    req.params.id as string,
    req.user as RequestUser,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Booking retrieved successfully",
    data: result,
  });
});

const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingService.cancelBooking(
    req.params.id as string,
    req.user as RequestUser,
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Booking cancelled successfully",
    data: result,
  });
});

export const BookingController = {
  createBooking,
  getMyBookings,
  getAgentBookings,
  getAllBookings,
  getBookingById,
  cancelBooking,
};
