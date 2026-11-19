import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import httpStatus from "http-status";
import { config } from "./app/config";
import { notFound } from "./app/middleware/notFound";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { apiLimiter } from "./app/middleware/rateLimiter";
import { sanitizeInput } from "./app/middleware/sanitizeInput";
import router from "./app/routes";

const app: Application = express();

// Needed for correct client IPs (rate limiting, secure cookies) behind Render / Vercel proxies.
app.set("trust proxy", 1);

// FRONTEND_URL may contain a comma-separated whitelist.
const allowedOrigins = config.frontend_url.split(",").map((origin) => origin.trim());

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server tools (no Origin header) and whitelisted frontends.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(sanitizeInput);

app.get("/health", (_req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: "Health check successful",
  });
});

app.get("/", (_req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: "Welcome to the EstateHub Real Estate API",
  });
});

app.use("/api/v1", apiLimiter, router);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
