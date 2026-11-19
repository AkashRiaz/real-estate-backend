import httpStatus from "http-status";
import { BlogPostWhereInput } from "../../../generated/prisma/models";
import { generateSlug } from "../../helper/generateSlug";
import { buildMeta, calculatePagination } from "../../helper/paginationHelper";
import { IQuery } from "../../interfaces";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { deleteFromCloudinary, uploadToCloudinary } from "../../utils/uploadToCloudinary";
import { ICreateBlogPostPayload, IUpdateBlogPostPayload } from "./blog.interface";

const WORDS_PER_MINUTE = 200;

const estimateReadingMinutes = (content: string) =>
  Math.max(1, Math.round(content.trim().split(/\s+/).length / WORDS_PER_MINUTE));

const authorSelect = { select: { id: true, name: true, imageUrl: true } } as const;

const blogListOmit = { content: true } as const;

const createBlogPost = async (
  authorId: string,
  payload: ICreateBlogPostPayload,
  coverImage?: Express.Multer.File,
) => {
  const uploaded = coverImage
    ? await uploadToCloudinary(coverImage, "real-estate/blog")
    : undefined;

  try {
    return await prisma.blogPost.create({
      data: {
        ...payload,
        slug: generateSlug(payload.title),
        readingMinutes: estimateReadingMinutes(payload.content),
        publishedAt: payload.isPublished ? new Date() : null,
        coverImageUrl: uploaded?.secure_url,
        coverImagePublicId: uploaded?.public_id,
        authorId,
      },
      include: { author: authorSelect },
    });
  } catch (error) {
    await deleteFromCloudinary([uploaded?.public_id]);
    throw error;
  }
};

const getBlogPosts = async (scope: BlogPostWhereInput, query: IQuery) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(
    query,
    ["publishedAt", "createdAt", "title"],
    "publishedAt",
  );

  const andConditions: BlogPostWhereInput[] = [scope];

  if (query.category) andConditions.push({ category: query.category });
  if (query.isPublished) andConditions.push({ isPublished: query.isPublished === "true" });
  if (query.searchTerm) {
    andConditions.push({
      OR: [
        { title: { contains: query.searchTerm, mode: "insensitive" } },
        { excerpt: { contains: query.searchTerm, mode: "insensitive" } },
      ],
    });
  }

  const where: BlogPostWhereInput = { AND: andConditions };

  const [posts, total] = await prisma.$transaction([
    prisma.blogPost.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ [sortBy]: { sort: sortOrder, nulls: "last" } }, { createdAt: "desc" }],
      omit: blogListOmit,
      include: { author: authorSelect },
    }),
    prisma.blogPost.count({ where }),
  ]);

  return { data: posts, meta: buildMeta(page, limit, total) };
};

const getPublishedBlogPosts = (query: IQuery) => {
  const { isPublished: _ignored, ...publicQuery } = query;
  return getBlogPosts({ isPublished: true }, publicQuery);
};

const getAllBlogPostsForAdmin = (query: IQuery) => getBlogPosts({}, query);

const getBlogCategories = async () => {
  const groups = await prisma.blogPost.groupBy({
    by: ["category"],
    where: { isPublished: true },
    orderBy: { category: "asc" },
    _count: { _all: true },
  });

  return groups.map((group) => ({ category: group.category, count: group._count._all }));
};

const getBlogPostBySlug = async (slug: string) => {
  const post = await prisma.blogPost.findFirst({
    where: { slug, isPublished: true },
    include: { author: authorSelect },
  });

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, "Article not found");
  }

  const relatedPosts = await prisma.blogPost.findMany({
    where: { isPublished: true, category: post.category, id: { not: post.id } },
    orderBy: { publishedAt: "desc" },
    take: 3,
    omit: blogListOmit,
  });

  return { ...post, relatedPosts };
};

/** Admin view of any post (drafts included) with full content, for the edit form. */
const getBlogPostByIdForAdmin = async (id: string) => {
  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: { author: authorSelect },
  });

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, "Blog post not found");
  }

  return post;
};

const updateBlogPost = async (
  id: string,
  payload: IUpdateBlogPostPayload,
  coverImage?: Express.Multer.File,
) => {
  const post = await prisma.blogPost.findUnique({ where: { id } });

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, "Blog post not found");
  }

  const uploaded = coverImage
    ? await uploadToCloudinary(coverImage, "real-estate/blog")
    : undefined;

  try {
    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        ...payload,
        ...(payload.title && payload.title !== post.title && { slug: generateSlug(payload.title) }),
        ...(payload.content && { readingMinutes: estimateReadingMinutes(payload.content) }),
        // First publish sets the date; un-publishing keeps it for history.
        ...(payload.isPublished && !post.publishedAt && { publishedAt: new Date() }),
        ...(uploaded && {
          coverImageUrl: uploaded.secure_url,
          coverImagePublicId: uploaded.public_id,
        }),
      },
      include: { author: authorSelect },
    });

    if (uploaded) await deleteFromCloudinary([post.coverImagePublicId]);

    return updated;
  } catch (error) {
    await deleteFromCloudinary([uploaded?.public_id]);
    throw error;
  }
};

const deleteBlogPost = async (id: string) => {
  const post = await prisma.blogPost.findUnique({ where: { id } });

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, "Blog post not found");
  }

  const deleted = await prisma.blogPost.delete({ where: { id } });
  await deleteFromCloudinary([post.coverImagePublicId]);

  return deleted;
};

export const BlogService = {
  createBlogPost,
  getPublishedBlogPosts,
  getAllBlogPostsForAdmin,
  getBlogCategories,
  getBlogPostBySlug,
  getBlogPostByIdForAdmin,
  updateBlogPost,
  deleteBlogPost,
};
