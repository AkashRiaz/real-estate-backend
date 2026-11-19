import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { publicFormLimiter } from "../../middleware/rateLimiter";
import { validateRequest } from "../../middleware/validateRequest";
import { NewsletterController } from "./newsletter.controller";
import {
  getSubscribersQueryZodSchema,
  newsletterIdParamsZodSchema,
  subscribeNewsletterZodSchema,
} from "./newsletter.validation";

const router = Router();

router.post(
  "/subscribe",
  publicFormLimiter,
  validateRequest(subscribeNewsletterZodSchema),
  NewsletterController.subscribeNewsletter,
);

router.get(
  "/",
  auth(Role.ADMIN),
  validateRequest(getSubscribersQueryZodSchema, "query"),
  NewsletterController.getAllSubscribers,
);

router.delete(
  "/:id",
  auth(Role.ADMIN),
  validateRequest(newsletterIdParamsZodSchema, "params"),
  NewsletterController.deleteSubscriber,
);

export const NewsletterRoutes = router;
