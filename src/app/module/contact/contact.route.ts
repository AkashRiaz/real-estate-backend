import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { publicFormLimiter } from "../../middleware/rateLimiter";
import { validateRequest } from "../../middleware/validateRequest";
import { ContactController } from "./contact.controller";
import {
  contactIdParamsZodSchema,
  createContactMessageZodSchema,
  getContactMessagesQueryZodSchema,
  updateContactStatusZodSchema,
} from "./contact.validation";

const router = Router();

router.post(
  "/",
  publicFormLimiter,
  validateRequest(createContactMessageZodSchema),
  ContactController.createContactMessage,
);

router.get(
  "/",
  auth(Role.ADMIN),
  validateRequest(getContactMessagesQueryZodSchema, "query"),
  ContactController.getAllContactMessages,
);

router.patch(
  "/:id/status",
  auth(Role.ADMIN),
  validateRequest(contactIdParamsZodSchema, "params"),
  validateRequest(updateContactStatusZodSchema),
  ContactController.updateContactStatus,
);

router.delete(
  "/:id",
  auth(Role.ADMIN),
  validateRequest(contactIdParamsZodSchema, "params"),
  ContactController.deleteContactMessage,
);

export const ContactRoutes = router;
