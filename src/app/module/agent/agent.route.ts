import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { AgentController } from "./agent.controller";
import {
  agentIdParamsZodSchema,
  getAllAgentsQueryZodSchema,
  updateMyAgentProfileZodSchema,
  verifyAgentZodSchema,
} from "./agent.validation";

const router = Router();

router.get(
  "/",
  validateRequest(getAllAgentsQueryZodSchema, "query"),
  AgentController.getAllAgents,
);

router.patch(
  "/me",
  auth(Role.AGENT),
  validateRequest(updateMyAgentProfileZodSchema),
  AgentController.updateMyAgentProfile,
);

router.get(
  "/:id",
  validateRequest(agentIdParamsZodSchema, "params"),
  AgentController.getAgentById,
);

router.patch(
  "/:id/verify",
  auth(Role.ADMIN),
  validateRequest(agentIdParamsZodSchema, "params"),
  validateRequest(verifyAgentZodSchema),
  AgentController.verifyAgent,
);

export const AgentRoutes = router;
