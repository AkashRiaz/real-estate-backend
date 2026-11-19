import { Request, Response } from "express";
import httpStatus from "http-status";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AuthService } from "./auth.service";
import { clearAuthCookies, setAuthCookies } from "./auth.utils";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await AuthService.registerUser(req.body);

  setAuthCookies(res, { accessToken, refreshToken });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Account created successfully",
    data: { accessToken, refreshToken, user },
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await AuthService.loginUser(req.body);

  setAuthCookies(res, { accessToken, refreshToken });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged in successfully",
    data: { accessToken, refreshToken, user },
  });
});

const googleLogin = catchAsync(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await AuthService.googleLogin(req.body);

  setAuthCookies(res, { accessToken, refreshToken });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged in with Google successfully",
    data: { accessToken, refreshToken, user },
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken ?? req.body?.refreshToken;

  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Refresh token is missing");
  }

  const tokens = await AuthService.refreshToken(token);

  setAuthCookies(res, tokens);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "New tokens generated successfully",
    data: tokens,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.getMe(req.user as RequestUser);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User data retrieved successfully",
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const tokens = await AuthService.changePassword(req.user as RequestUser, req.body);

  setAuthCookies(res, tokens);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password changed successfully",
    data: tokens,
  });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  await AuthService.forgotPassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "If an account exists for this email, a reset code has been sent",
    data: null,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  await AuthService.resetPassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset successfully. Please log in with your new password.",
    data: null,
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  await AuthService.logout(req.cookies?.refreshToken ?? req.body?.refreshToken);

  clearAuthCookies(res);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logout successful",
    data: null,
  });
});

export const AuthController = {
  registerUser,
  loginUser,
  googleLogin,
  refreshToken,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
  logout,
};
