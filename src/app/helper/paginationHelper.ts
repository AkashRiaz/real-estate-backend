import { IQuery } from "../interfaces";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

export const calculatePagination = (
  query: IQuery,
  allowedSortFields: string[],
  defaultSortBy = "createdAt",
) => {
  const page = Math.max(Number.parseInt(query.page || "1", 10) || 1, 1);
  const limit = Math.min(
    Math.max(Number.parseInt(query.limit || `${DEFAULT_LIMIT}`, 10) || DEFAULT_LIMIT, 1),
    MAX_LIMIT,
  );
  const skip = (page - 1) * limit;

  const sortBy = allowedSortFields.includes(query.sortBy || "")
    ? (query.sortBy as string)
    : defaultSortBy;

  const sortOrder: "asc" | "desc" = query.sortOrder === "asc" ? "asc" : "desc";

  return { page, limit, skip, sortBy, sortOrder };
};

export const buildMeta = (page: number, limit: number, total: number) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});
