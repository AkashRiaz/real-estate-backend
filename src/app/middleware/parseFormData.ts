import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { AppError } from "../utils/AppError";

/**
 * multipart/form-data requests send their JSON payload in a "data" field.
 * This turns req.body.data (string) into req.body so validateRequest can run.
 * Must run after multer and before validateRequest.
 */
export const parseFormData = (req: Request, _res: Response, next: NextFunction) => {
  if (typeof req.body?.data === "string") {
    try {
      req.body = JSON.parse(req.body.data);
    } catch {
      next(new AppError(httpStatus.BAD_REQUEST, "The 'data' field must be valid JSON"));
      return;
    }
  }

  req.body = req.body ?? {};
  next();
};
