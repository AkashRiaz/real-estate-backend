import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { authLimiter } from "../../middleware/rateLimiter";
import { validateRequest } from "../../middleware/validateRequest";
import { AuthController } from "./auth.controller";
import {
  ChangePasswordZodSchema,
  ForgotPasswordZodSchema,
  GoogleLoginZodSchema,
  LoginZodSchema,
  RegisterZodSchema,
  ResetPasswordZodSchema,
} from "./auth.validation";

const router = Router();

router.post(
  "/register",
  authLimiter,
  validateRequest(RegisterZodSchema),
  AuthController.registerUser,
);

router.post("/login", authLimiter, validateRequest(LoginZodSchema), AuthController.loginUser);

router.post(
  "/google",
  authLimiter,
  validateRequest(GoogleLoginZodSchema),
  AuthController.googleLogin,
);

router.post("/refresh-token", AuthController.refreshToken);

router.post("/logout", AuthController.logout);

router.get("/me", auth(), AuthController.getMe);

router.post(
  "/change-password",
  auth(),
  validateRequest(ChangePasswordZodSchema),
  AuthController.changePassword,
);

router.post(
  "/forgot-password",
  authLimiter,
  validateRequest(ForgotPasswordZodSchema),
  AuthController.forgotPassword,
);

router.post(
  "/reset-password",
  authLimiter,
  validateRequest(ResetPasswordZodSchema),
  AuthController.resetPassword,
);

export const AuthRoutes = router;
