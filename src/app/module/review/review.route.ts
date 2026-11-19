import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { ReviewController } from "./review.controller";
import {
  createReviewZodSchema,
  getReviewsQueryZodSchema,
  getTargetReviewsQueryZodSchema,
  reviewIdParamsZodSchema,
  updateReviewVisibilityZodSchema,
  updateReviewZodSchema,
} from "./review.validation";

const router = Router();

router.get(
  "/",
  validateRequest(getTargetReviewsQueryZodSchema, "query"),
  ReviewController.getTargetReviews,
);

router.get("/testimonials", ReviewController.getTestimonials);

router.get(
  "/my",
  auth(Role.USER),
  validateRequest(getReviewsQueryZodSchema, "query"),
  ReviewController.getMyReviews,
);

router.get(
  "/all",
  auth(Role.ADMIN),
  validateRequest(getReviewsQueryZodSchema, "query"),
  ReviewController.getAllReviews,
);

router.post(
  "/",
  auth(Role.USER),
  validateRequest(createReviewZodSchema),
  ReviewController.createReview,
);

router.patch(
  "/:id",
  auth(Role.USER),
  validateRequest(reviewIdParamsZodSchema, "params"),
  validateRequest(updateReviewZodSchema),
  ReviewController.updateReview,
);

router.patch(
  "/:id/visibility",
  auth(Role.ADMIN),
  validateRequest(reviewIdParamsZodSchema, "params"),
  validateRequest(updateReviewVisibilityZodSchema),
  ReviewController.updateReviewVisibility,
);

router.delete(
  "/:id",
  auth(Role.USER, Role.ADMIN),
  validateRequest(reviewIdParamsZodSchema, "params"),
  ReviewController.deleteReview,
);

export const ReviewRoutes = router;
