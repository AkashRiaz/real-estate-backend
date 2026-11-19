import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { InquiryController } from "./inquiry.controller";
import {
  createInquiryReplyZodSchema,
  createInquiryZodSchema,
  getInquiriesQueryZodSchema,
  inquiryIdParamsZodSchema,
  updateInquiryStatusZodSchema,
} from "./inquiry.validation";

const router = Router();

router.post(
  "/",
  auth(Role.USER),
  validateRequest(createInquiryZodSchema),
  InquiryController.createInquiry,
);

router.get(
  "/my",
  auth(Role.USER),
  validateRequest(getInquiriesQueryZodSchema, "query"),
  InquiryController.getMyInquiries,
);

router.get(
  "/agent",
  auth(Role.AGENT),
  validateRequest(getInquiriesQueryZodSchema, "query"),
  InquiryController.getAgentInquiries,
);

router.get(
  "/",
  auth(Role.ADMIN),
  validateRequest(getInquiriesQueryZodSchema, "query"),
  InquiryController.getAllInquiries,
);

router.get(
  "/:id",
  auth(),
  validateRequest(inquiryIdParamsZodSchema, "params"),
  InquiryController.getInquiryById,
);

router.post(
  "/:id/replies",
  auth(Role.USER, Role.AGENT),
  validateRequest(inquiryIdParamsZodSchema, "params"),
  validateRequest(createInquiryReplyZodSchema),
  InquiryController.createInquiryReply,
);

router.patch(
  "/:id/status",
  auth(Role.AGENT, Role.ADMIN),
  validateRequest(inquiryIdParamsZodSchema, "params"),
  validateRequest(updateInquiryStatusZodSchema),
  InquiryController.updateInquiryStatus,
);

export const InquiryRoutes = router;
