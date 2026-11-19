import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { ViewingController } from "./viewing.controller";
import {
  cancelViewingZodSchema,
  createViewingZodSchema,
  getViewingsQueryZodSchema,
  rescheduleViewingZodSchema,
  updateViewingStatusZodSchema,
  viewingIdParamsZodSchema,
} from "./viewing.validation";

const router = Router();

router.post(
  "/",
  auth(Role.USER),
  validateRequest(createViewingZodSchema),
  ViewingController.createViewing,
);

router.get(
  "/my",
  auth(Role.USER),
  validateRequest(getViewingsQueryZodSchema, "query"),
  ViewingController.getMyViewings,
);

router.get(
  "/agent",
  auth(Role.AGENT),
  validateRequest(getViewingsQueryZodSchema, "query"),
  ViewingController.getAgentViewings,
);

router.get(
  "/",
  auth(Role.ADMIN),
  validateRequest(getViewingsQueryZodSchema, "query"),
  ViewingController.getAllViewings,
);

router.patch(
  "/:id/status",
  auth(Role.AGENT, Role.ADMIN),
  validateRequest(viewingIdParamsZodSchema, "params"),
  validateRequest(updateViewingStatusZodSchema),
  ViewingController.updateViewingStatus,
);

router.patch(
  "/:id/reschedule",
  auth(Role.AGENT, Role.ADMIN),
  validateRequest(viewingIdParamsZodSchema, "params"),
  validateRequest(rescheduleViewingZodSchema),
  ViewingController.rescheduleViewing,
);

router.patch(
  "/:id/cancel",
  auth(Role.USER, Role.AGENT),
  validateRequest(viewingIdParamsZodSchema, "params"),
  validateRequest(cancelViewingZodSchema),
  ViewingController.cancelViewing,
);

export const ViewingRoutes = router;
