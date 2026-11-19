import { Request, Response } from "express";
import httpStatus from "http-status";
import { IQuery } from "../../interfaces";
import { RequestUser } from "../../middleware/checkAuth";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { BlogService } from "./blog.service";

const createBlogPost = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as RequestUser;
  const result = await BlogService.createBlogPost(userId, req.body, req.file);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: result.isPublished ? "Article published successfully" : "Draft saved successfully",
    data: result,
  });
});

const getPublishedBlogPosts = catchAsync(async (req: Request, res: Response) => {
  const result = await BlogService.getPublishedBlogPosts(req.query as IQuery);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Articles retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getAllBlogPostsForAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await BlogService.getAllBlogPostsForAdmin(req.query as IQuery);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Blog posts retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getBlogCategories = catchAsync(async (_req: Request, res: Response) => {
  const result = await BlogService.getBlogCategories();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Blog categories retrieved successfully",
    data: result,
  });
});

const getBlogPostBySlug = catchAsync(async (req: Request, res: Response) => {
  const result = await BlogService.getBlogPostBySlug(req.params.slug as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Article retrieved successfully",
    data: result,
  });
});

const getBlogPostByIdForAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await BlogService.getBlogPostByIdForAdmin(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Blog post retrieved successfully",
    data: result,
  });
});

const updateBlogPost = catchAsync(async (req: Request, res: Response) => {
  const result = await BlogService.updateBlogPost(req.params.id as string, req.body, req.file);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Blog post updated successfully",
    data: result,
  });
});

const deleteBlogPost = catchAsync(async (req: Request, res: Response) => {
  const result = await BlogService.deleteBlogPost(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Blog post deleted successfully",
    data: result,
  });
});

export const BlogController = {
  createBlogPost,
  getPublishedBlogPosts,
  getAllBlogPostsForAdmin,
  getBlogCategories,
  getBlogPostBySlug,
  getBlogPostByIdForAdmin,
  updateBlogPost,
  deleteBlogPost,
};
