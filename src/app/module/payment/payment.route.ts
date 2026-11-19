import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { PaymentController } from "./payment.controller";
import {
  CreateBkashPaymentZodSchema,
  bkashCallbackQueryZodSchema,
  getPaymentsQueryZodSchema,
  paymentIdParamsZodSchema,
} from "./payment.validation";

const router = Router();

router.post(
  "/bkash/create",
  auth(Role.USER),
  validateRequest(CreateBkashPaymentZodSchema),
  PaymentController.createBkashPayment,
);

// bKash redirects the browser here after checkout.
router.get(
  "/bkash/callback",
  validateRequest(bkashCallbackQueryZodSchema, "query"),
  PaymentController.bkashPaymentCallback,
);

router.get(
  "/my-payments",
  auth(Role.USER),
  validateRequest(getPaymentsQueryZodSchema, "query"),
  PaymentController.getMyPayments,
);

router.get(
  "/agent-payments",
  auth(Role.AGENT),
  validateRequest(getPaymentsQueryZodSchema, "query"),
  PaymentController.getAgentPayments,
);

router.get(
  "/all-payments",
  auth(Role.ADMIN),
  validateRequest(getPaymentsQueryZodSchema, "query"),
  PaymentController.getAllPayments,
);

router.get(
  "/:paymentId",
  auth(),
  validateRequest(paymentIdParamsZodSchema, "params"),
  PaymentController.getSinglePayment,
);

export const PaymentRoutes = router;
