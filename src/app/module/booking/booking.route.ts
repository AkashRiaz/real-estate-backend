import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { BookingController } from "./booking.controller";
import {
  bookingIdParamsZodSchema,
  cancelBookingZodSchema,
  createBookingZodSchema,
  getBookingsQueryZodSchema,
} from "./booking.validation";

const router = Router();

router.post(
  "/",
  auth(Role.USER),
  validateRequest(createBookingZodSchema),
  BookingController.createBooking,
);

router.get(
  "/my",
  auth(Role.USER),
  validateRequest(getBookingsQueryZodSchema, "query"),
  BookingController.getMyBookings,
);

router.get(
  "/agent",
  auth(Role.AGENT),
  validateRequest(getBookingsQueryZodSchema, "query"),
  BookingController.getAgentBookings,
);

router.get(
  "/",
  auth(Role.ADMIN),
  validateRequest(getBookingsQueryZodSchema, "query"),
  BookingController.getAllBookings,
);

router.get(
  "/:id",
  auth(),
  validateRequest(bookingIdParamsZodSchema, "params"),
  BookingController.getBookingById,
);

router.patch(
  "/:id/cancel",
  auth(Role.USER, Role.ADMIN),
  validateRequest(bookingIdParamsZodSchema, "params"),
  validateRequest(cancelBookingZodSchema),
  BookingController.cancelBooking,
);

export const BookingRoutes = router;
