import { NextFunction, Request, Response } from "express";

/**
 * Light input sanitization:
 * - drops prototype-pollution keys (__proto__, constructor, prototype)
 * - trims strings and strips HTML tags / null bytes
 * Rich text is never accepted by this API, so stripping tags is safe.
 */
const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);
const TAG_PATTERN = /<\/?[a-z][^>]*>/gi;

const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === "string") {
    return value.replace(/\0/g, "").replace(TAG_PATTERN, "").trim();
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === "object" && !(value instanceof Date)) {
    const clean: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      if (!FORBIDDEN_KEYS.has(key)) {
        clean[key] = sanitizeValue(nested);
      }
    }
    return clean;
  }

  return value;
};

export const sanitizeInput = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body);
  }

  if (req.query && Object.keys(req.query).length) {
    Object.defineProperty(req, "query", {
      value: sanitizeValue(req.query),
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }

  next();
};
