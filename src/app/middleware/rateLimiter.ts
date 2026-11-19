import rateLimit from "express-rate-limit";
import httpStatus from "http-status";
import { isProduction } from "../config";

const limitHandlerMessage = (message: string) => ({
  success: false,
  statusCode: httpStatus.TOO_MANY_REQUESTS,
  message,
});

// Login, register, forgot/reset password
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isProduction ? 20 : 500,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: limitHandlerMessage(
    "Too many authentication attempts. Please try again in 15 minutes.",
  ),
});

// Public write endpoints (contact form, newsletter)
export const publicFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: limitHandlerMessage("Too many submissions. Please try again later."),
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: limitHandlerMessage("Too many requests. Please slow down."),
});
