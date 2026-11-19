import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { upload } from "../../lib/multer";
import { auth } from "../../middleware/checkAuth";
import { parseFormData } from "../../middleware/parseFormData";
import { validateRequest } from "../../middleware/validateRequest";
import { UserController } from "./user.controller";
import {
  getAllUsersQueryZodSchema,
  updateMyProfileZodSchema,
  updateUserStatusZodSchema,
  userIdParamsZodSchema,
} from "./user.validation";

const router = Router();

// multipart/form-data: profileImage (file) + data (JSON string)
router.patch(
  "/me",
  auth(),
  upload.single("profileImage"),
  parseFormData,
  validateRequest(updateMyProfileZodSchema),
  UserController.updateMyProfile,
);

router.get(
  "/",
  auth(Role.ADMIN),
  validateRequest(getAllUsersQueryZodSchema, "query"),
  UserController.getAllUsers,
);

router.get(
  "/:id",
  auth(Role.ADMIN),
  validateRequest(userIdParamsZodSchema, "params"),
  UserController.getUserById,
);

router.patch(
  "/:id/status",
  auth(Role.ADMIN),
  validateRequest(userIdParamsZodSchema, "params"),
  validateRequest(updateUserStatusZodSchema),
  UserController.updateUserStatus,
);

router.delete(
  "/:id",
  auth(Role.ADMIN),
  validateRequest(userIdParamsZodSchema, "params"),
  UserController.deleteUser,
);

export const UserRoutes = router;
