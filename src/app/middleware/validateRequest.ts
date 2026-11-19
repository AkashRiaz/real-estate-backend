import z from "zod";
import httpStatus from "http-status";
import { catchAsync } from "../utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";

type RequestSource = "body" | "query" | "params";

const formatIssues = (error: z.ZodError) =>
  error.issues
    .map((issue) =>
      issue.path.length ? `${issue.path.join(".")}: ${issue.message}` : issue.message,
    )
    .join(", ");

/**
 * validateRequest(schema)           -> validates req.body (reference behaviour)
 * validateRequest(schema, "query")  -> validates req.query
 * validateRequest(schema, "params") -> validates req.params
 */
export const validateRequest = (
  zodSchema: z.ZodType,
  source: RequestSource = "body",
) => {
  return catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
    const payload = req[source] ?? {};
    const result = zodSchema.safeParse(payload);

    if (!result.success) {
      throw new AppError(httpStatus.BAD_REQUEST, formatIssues(result.error));
    }

    if (source === "body") {
      req.body = result.data;
    } else {
      // Express 5 exposes req.query / req.params through getters.
      Object.defineProperty(req, source, {
        value: result.data,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }

    next();
  });
};
