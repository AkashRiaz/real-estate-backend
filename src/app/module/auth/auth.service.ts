import bcrypt from "bcrypt";
import crypto from "node:crypto";
import httpStatus from "http-status";
import { TokenPayload } from "google-auth-library";
import { AuthProvider, Role, UserStatus } from "../../../generated/prisma/enums";
import { config } from "../../config";
import { googleClient } from "../../lib/googleAuth";
import { prisma } from "../../lib/prisma";
import { redisClient } from "../../lib/redis";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import { hashToken } from "../../utils/hashToken";
import { jwtUtils } from "../../utils/jwt";
import { sendEmail, sendEmailSafely } from "../../utils/sendEmail";
import {
  IChangePasswordPayload,
  IForgotPasswordPayload,
  IGoogleLoginPayload,
  ILoginUserPayload,
  IRegisterUserPayload,
  IResetPasswordPayload,
} from "./auth.interface";
import {
  forgotPasswordAttemptsKey,
  forgotPasswordOtpKey,
  generateAuthTokens,
} from "./auth.utils";

const OTP_EXPIRATION_SECONDS = 5 * 60;
const MAX_OTP_ATTEMPTS = 5;

const hashPassword = (password: string) =>
  bcrypt.hash(password, Number(config.bcrypt_salt_rounds));

const assertAccountUsable = (user: { status: UserStatus; isDeleted: boolean }) => {
  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "This account has been deleted");
  }

  if (user.status === UserStatus.BLOCKED) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account has been blocked. Please contact support.",
    );
  }
};

const registerUser = async (payload: IRegisterUserPayload) => {
  const { agencyName, licenseNumber, password, ...userData } = payload;

  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email },
  });

  if (existingUser) {
    throw new AppError(httpStatus.CONFLICT, "An account with this email already exists");
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
      authProvider: AuthProvider.CREDENTIALS,
      ...(userData.role === Role.AGENT && {
        agentProfile: {
          create: {
            agencyName: agencyName as string,
            licenseNumber,
          },
        },
      }),
    },
    omit: { password: true },
    include: { agentProfile: true },
  });

  const tokens = await generateAuthTokens(user);

  return { user, ...tokens };
};

const loginUser = async (payload: ILoginUserPayload) => {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Same message for "no user" and "wrong password" to avoid account enumeration.
  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  assertAccountUsable(user);

  if (!user.password) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This account uses Google sign-in. Please continue with Google.",
    );
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
    omit: { password: true },
    include: { agentProfile: true },
  });

  const tokens = await generateAuthTokens(updatedUser);

  return { user: updatedUser, ...tokens };
};

const googleLogin = async (payload: IGoogleLoginPayload) => {
  if (!config.google_client_id) {
    throw new AppError(httpStatus.SERVICE_UNAVAILABLE, "Google login is not configured");
  }

  let googlePayload: TokenPayload | undefined;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: payload.idToken,
      audience: config.google_client_id,
    });
    googlePayload = ticket.getPayload();
  } catch {
    throw new AppError(httpStatus.UNAUTHORIZED, "Google login failed");
  }

  if (!googlePayload?.email || !googlePayload.email_verified) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unable to verify your Google email");
  }

  const email = googlePayload.email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    assertAccountUsable(existingUser);

    if (existingUser.googleId && existingUser.googleId !== googlePayload.sub) {
      throw new AppError(
        httpStatus.CONFLICT,
        "This account is linked to a different Google account",
      );
    }
  }

  const user = existingUser
    ? await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          googleId: googlePayload.sub,
          lastLoginAt: new Date(),
          imageUrl: existingUser.imageUrl ?? googlePayload.picture,
        },
        omit: { password: true },
        include: { agentProfile: true },
      })
    : await prisma.user.create({
        data: {
          name: googlePayload.name ?? email.split("@")[0],
          email,
          googleId: googlePayload.sub,
          authProvider: AuthProvider.GOOGLE,
          imageUrl: googlePayload.picture,
          lastLoginAt: new Date(),
        },
        omit: { password: true },
        include: { agentProfile: true },
      });

  const tokens = await generateAuthTokens(user);

  return { user, ...tokens };
};

const refreshToken = async (token: string) => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Refresh token is required");
  }

  // 1. Verify JWT
  const verifiedToken = jwtUtils.verifyToken(token, config.jwt_refresh_secret);

  if (!verifiedToken.success) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid or expired refresh token");
  }

  // 2. Find hashed token in database
  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!storedToken) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Refresh token not found");
  }

  // 3. Reuse of a revoked token means it may have been stolen: revoke every session.
  if (storedToken.revokedAt) {
    await prisma.refreshToken.updateMany({
      where: { userId: storedToken.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw new AppError(httpStatus.UNAUTHORIZED, "Refresh token has been revoked");
  }

  if (storedToken.expiresAt <= new Date()) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Refresh token has expired");
  }

  assertAccountUsable(storedToken.user);

  // 4. Rotate: revoke old token, issue new pair
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revokedAt: new Date() },
  });

  return generateAuthTokens(storedToken.user);
};

const getMe = async (user: RequestUser) => {
  const isUserExist = await prisma.user.findUnique({
    where: { id: user.userId },
    include: { agentProfile: true },
    omit: { password: true },
  });

  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return isUserExist;
};

const changePassword = async (user: RequestUser, payload: IChangePasswordPayload) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: user.userId },
  });

  if (!existingUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (!existingUser.password) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This account uses Google sign-in and has no password to change",
    );
  }

  const isPasswordMatched = await bcrypt.compare(payload.oldPassword, existingUser.password);

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Current password is incorrect");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: existingUser.id },
      data: { password: await hashPassword(payload.newPassword) },
    }),
    // Sign out every other session.
    prisma.refreshToken.updateMany({
      where: { userId: existingUser.id, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  sendEmailSafely({
    to: existingUser.email,
    subject: "Your EstateHub password was changed",
    template: "password-changed",
    data: { name: existingUser.name },
  });

  return generateAuthTokens(existingUser);
};

const forgotPassword = async (payload: IForgotPasswordPayload) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  // Respond the same way whether or not the email exists (no account enumeration).
  if (!user || user.isDeleted || user.status === UserStatus.BLOCKED || !user.password) {
    return;
  }

  const otp = crypto.randomInt(100000, 999999).toString();

  await redisClient.set(forgotPasswordOtpKey(user.email), otp, {
    expiration: { type: "EX", value: OTP_EXPIRATION_SECONDS },
  });
  await redisClient.del(forgotPasswordAttemptsKey(user.email));

  await sendEmail({
    to: user.email,
    subject: "Your EstateHub password reset code",
    template: "forgot-password",
    data: {
      name: user.name,
      otp,
      expirationMinutes: OTP_EXPIRATION_SECONDS / 60,
    },
  });
};

const resetPassword = async (payload: IResetPasswordPayload) => {
  const { email, otp, newPassword } = payload;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, "OTP has expired or is invalid");
  }

  assertAccountUsable(user);

  const otpKey = forgotPasswordOtpKey(email);
  const attemptsKey = forgotPasswordAttemptsKey(email);
  const redisOtp = await redisClient.get(otpKey);

  if (!redisOtp) {
    throw new AppError(httpStatus.BAD_REQUEST, "OTP has expired or is invalid");
  }

  if (redisOtp !== otp) {
    const attempts = await redisClient.incr(attemptsKey);
    await redisClient.expire(attemptsKey, OTP_EXPIRATION_SECONDS);

    if (attempts >= MAX_OTP_ATTEMPTS) {
      await redisClient.del([otpKey, attemptsKey]);
      throw new AppError(
        httpStatus.TOO_MANY_REQUESTS,
        "Too many wrong attempts. Please request a new code.",
      );
    }

    throw new AppError(httpStatus.BAD_REQUEST, "Invalid OTP");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { password: await hashPassword(newPassword) },
    }),
    prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  await redisClient.del([otpKey, attemptsKey]);

  sendEmailSafely({
    to: user.email,
    subject: "Your EstateHub password was changed",
    template: "password-changed",
    data: { name: user.name },
  });
};

const logout = async (token?: string) => {
  if (!token) return;

  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });

  if (storedToken && !storedToken.revokedAt) {
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });
  }
};

export const AuthService = {
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
