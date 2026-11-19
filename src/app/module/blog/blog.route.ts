import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { upload } from "../../lib/multer";
import { auth } from "../../middleware/checkAuth";
import { parseFormData } from "../../middleware/parseFormData";
import { validateRequest } from "../../middleware/validateRequest";
import { BlogController } from "./blog.controller";
import {
  blogIdParamsZodSchema,
  blogSlugParamsZodSchema,
  createBlogPostZodSchema,
  getBlogPostsQueryZodSchema,
  updateBlogPostZodSchema,
} from "./blog.validation";

const router = Router();

router.get(
  "/",
  validateRequest(getBlogPostsQueryZodSchema, "query"),
  BlogController.getPublishedBlogPosts,
);

router.get("/categories", BlogController.getBlogCategories);

router.get(
  "/admin/all",
  auth(Role.ADMIN),
  validateRequest(getBlogPostsQueryZodSchema, "query"),
  BlogController.getAllBlogPostsForAdmin,
);

router.get(
  "/admin/:id",
  auth(Role.ADMIN),
  validateRequest(blogIdParamsZodSchema, "params"),
  BlogController.getBlogPostByIdForAdmin,
);

router.get(
  "/:slug",
  validateRequest(blogSlugParamsZodSchema, "params"),
  BlogController.getBlogPostBySlug,
);

// multipart/form-data: coverImage (file) + data (JSON string)
router.post(
  "/",
  auth(Role.ADMIN),
  upload.single("coverImage"),
  parseFormData,
  validateRequest(createBlogPostZodSchema),
  BlogController.createBlogPost,
);

router.patch(
  "/:id",
  auth(Role.ADMIN),
  upload.single("coverImage"),
  parseFormData,
  validateRequest(blogIdParamsZodSchema, "params"),
  validateRequest(updateBlogPostZodSchema),
  BlogController.updateBlogPost,
);

router.delete(
  "/:id",
  auth(Role.ADMIN),
  validateRequest(blogIdParamsZodSchema, "params"),
  BlogController.deleteBlogPost,
);

export const BlogRoutes = router;
