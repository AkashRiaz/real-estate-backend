import z from "zod";

export const agentIdParamsZodSchema = z.object({
  id: z.uuid("Invalid agent ID"),
});

export const getAllAgentsQueryZodSchema = z.object({
  searchTerm: z.string().max(100).optional(),
  area: z.string().max(60).optional(),
  isVerified: z.enum(["true", "false"]).optional(),
  page: z.string().regex(/^\d+$/, "page must be a number").optional(),
  limit: z.string().regex(/^\d+$/, "limit must be a number").optional(),
  sortBy: z.enum(["rating", "experience", "listings", "createdAt", "name"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const updateMyAgentProfileZodSchema = z.object({
  agencyName: z.string().trim().min(2, "Agency name is required").max(80).optional(),
  licenseNumber: z.string().trim().max(40).nullable().optional(),
  bio: z.string().trim().max(1000, "Bio must be at most 1000 characters").nullable().optional(),
  experienceYears: z.number().int().min(0).max(60).optional(),
  serviceAreas: z
    .array(z.string().trim().min(2).max(60))
    .max(15, "You can list up to 15 service areas")
    .optional(),
});

export const verifyAgentZodSchema = z.object({
  isVerified: z.boolean("isVerified must be true or false"),
});
