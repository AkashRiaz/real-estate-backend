import multer from "multer";
import httpStatus from "http-status";
import { AppError } from "../utils/AppError";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(
        new AppError(
          httpStatus.BAD_REQUEST,
          "Only JPG, PNG, WEBP or AVIF images are allowed",
        ),
      );
      return;
    }
    cb(null, true);
  },
});
