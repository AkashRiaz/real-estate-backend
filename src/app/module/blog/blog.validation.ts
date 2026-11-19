import z from "zod";

export const BLOG_CATEGORIES = [
  "Buying Guide",
  "Renting Tips",
  "Market Insights",
  "Legal & Documentation",
  "Home Finance",
  "Neighbourhood Guide",
] as const;

const blogShape = {
  title: z.string().trim().min(10, "Title must be at least 10 characters").max(150),
  excerpt: z
    .string()
    .trim()
    .min(40, "Excerpt must be at least 40 characters")
    .max(300, "Excerpt must be at most 300 characters"),
  content: z
    .string()
    .trim()
    .min(300, "Content must be at least 300 characters")
    .max(30000, "Content must be at most 30000 characters"),
  category: z.enum(BLOG_CATEGORIES, "Select a valid category"),
  isPublished: z.boolean().default(false),
};

export const createBlogPostZodSchema = z.object(blogShape);

export const updateBlogPostZodSchema = z.object({
  title: blogShape.title.optional(),
  excerpt: blogShape.excerpt.optional(),
  content: blogShape.content.optional(),
  category: blogShape.category.optional(),
  isPublished: z.boolean().optional(),
});

export const blogIdParamsZodSchema = z.object({
  id: z.uuid("Invalid blog post ID"),
});

export const blogSlugParamsZodSchema = z.object({
  slug: z.string().trim().min(1).max(200),
});

export const getBlogPostsQueryZodSchema = z.object({
  searchTerm: z.string().max(100).optional(),
  category: z.enum(BLOG_CATEGORIES).optional(),
  isPublished: z.enum(["true", "false"]).optional(),
  page: z.string().regex(/^\d+$/, "page must be a number").optional(),
  limit: z.string().regex(/^\d+$/, "limit must be a number").optional(),
  sortBy: z.enum(["publishedAt", "createdAt", "title"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
