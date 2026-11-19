import crypto from "node:crypto";
import { CookieOptions, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { config, isProduction } from "../../config";
import { prisma } from "../../lib/prisma";
import { hashToken } from "../../utils/hashToken";
import { jwtUtils } from "../../utils/jwt";
import { IAuthTokenUser } from "./auth.interface";

const ONE_DAY = 1000 * 60 * 60 * 24;

const getTokenExpiry = (token: string, fallbackMs: number) => {
  const decoded = jwt.decode(token) as { exp?: number } | null;
  return decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + fallbackMs);
};

/**
 * Creates an access + refresh token pair and stores
 * the refresh token hash (same flow as the reference project).
 */
export const generateAuthTokens = async (user: IAuthTokenUser) => {
  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions["expiresIn"],
  );

  // A unique jti guarantees a unique token hash even for two logins in the same second.
  const refreshToken = jwtUtils.createToken(
    { ...jwtPayload, jti: crypto.randomUUID() },
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions["expiresIn"],
  );

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt: getTokenExpiry(refreshToken, 7 * ONE_DAY),
    },
  });

  return { accessToken, refreshToken };
};

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  // Frontend and backend live on different domains in production.
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};

export const setAuthCookies = (
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
) => {
  res.cookie("accessToken", tokens.accessToken, {
    ...baseCookieOptions,
    expires: getTokenExpiry(tokens.accessToken, ONE_DAY),
  });

  res.cookie("refreshToken", tokens.refreshToken, {
    ...baseCookieOptions,
    expires: getTokenExpiry(tokens.refreshToken, 7 * ONE_DAY),
  });
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken", baseCookieOptions);
  res.clearCookie("refreshToken", baseCookieOptions);
};

export const forgotPasswordOtpKey = (email: string) =>
  `real-estate:forgot-password-otp:${email}`;

export const forgotPasswordAttemptsKey = (email: string) =>
  `real-estate:forgot-password-attempts:${email}`;
