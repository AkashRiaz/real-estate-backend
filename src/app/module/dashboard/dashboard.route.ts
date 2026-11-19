import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { DashboardController } from "./dashboard.controller";

const router = Router();

router.get("/public-stats", DashboardController.getPublicStats);

router.get("/admin", auth(Role.ADMIN), DashboardController.getAdminOverview);

router.get("/agent", auth(Role.AGENT), DashboardController.getAgentOverview);

router.get("/user", auth(Role.USER), DashboardController.getUserOverview);

export const DashboardRoutes = router;
