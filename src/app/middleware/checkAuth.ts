import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";
import { config } from "../config";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";

export interface RequestUser {
  email: string;
  name: string;
  userId: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

const extractToken = (req: Request) => {
  const authorization = req.headers.authorization?.trim();
  const bearerToken = authorization?.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : undefined;
  const cookieToken =
    typeof req.cookies?.accessToken === "string"
      ? req.cookies.accessToken.trim()
      : undefined;

  return bearerToken || cookieToken;
};

// auth(Role.ADMIN, Role.AGENT) => only those roles
// auth() => any logged-in user
export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
    const token = extractToken(req);

    if (!token) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "You are not logged in. Please log in to access this resource.",
      );
    }

    const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);

    if (!verifiedToken.success) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Invalid or expired access token. Please log in again.",
      );
    }

    const { userId, role } = verifiedToken.data;

    if (requiredRoles.length && !requiredRoles.includes(role)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Forbidden. You don't have permission to access this resource.",
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, status: true, isDeleted: true },
    });

    if (!user || user.isDeleted) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User not found. Please log in again.");
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Your account has been blocked. Please contact support.",
      );
    }

    if (user.role !== role) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Your role has changed. Please log in again.");
    }

    req.user = {
      email: user.email,
      name: user.name,
      userId: user.id,
      role: user.role,
    };

    next();
  });
};

/**
 * Attaches req.user when a valid token is present, but never blocks the request.
 * Used on public routes that show extra data to logged-in users.
 */
export const optionalAuth = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = extractToken(req);

    if (token) {
      const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);
      if (verifiedToken.success) {
        const { userId, name, email, role } = verifiedToken.data;
        req.user = { userId, name, email, role };
      }
    }

    next();
  },
);
