import z from "zod";
import { BANGLADESH_DIVISIONS, PROPERTY_AMENITIES } from "./property.utils";

const numericString = (label: string) =>
  z.string().regex(/^\d+(\.\d+)?$/, `${label} must be a number`);

const currentYear = new Date().getFullYear();

const propertyBaseShape = {
  title: z
    .string()
    .trim()
    .min(10, "Title must be at least 10 characters")
    .max(120, "Title must be at most 120 characters"),
  description: z
    .string()
    .trim()
    .min(80, "Description must be at least 80 characters")
    .max(5000, "Description must be at most 5000 characters"),
  type: z.enum(["APARTMENT", "HOUSE", "LAND", "COMMERCIAL"], "Invalid property type"),
  purpose: z.enum(["SALE", "RENT"], "Purpose must be SALE or RENT"),
  price: z.number("Price must be a number").positive("Price must be greater than 0").max(1e12),
  bookingFee: z
    .number("Booking fee must be a number")
    .min(500, "Booking fee must be at least 500 BDT")
    .max(5_000_000, "Booking fee must be at most 5,000,000 BDT"),
  areaSqft: z.number().int().min(100, "Area must be at least 100 sq ft").max(1_000_000),
  bedrooms: z.number().int().min(0).max(30).default(0),
  bathrooms: z.number().int().min(0).max(30).default(0),
  division: z.enum(BANGLADESH_DIVISIONS, "Select a valid division"),
  city: z.string().trim().min(2, "City is required").max(60),
  area: z.string().trim().min(2, "Area is required").max(80),
  address: z.string().trim().min(5, "Address is required").max(200),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  amenities: z.array(z.enum(PROPERTY_AMENITIES, "Invalid amenity")).max(20).default([]),
  furnishing: z.enum(["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"]).default("UNFURNISHED"),
  yearBuilt: z.number().int().min(1900).max(currentYear + 5).nullable().optional(),
  floor: z.number().int().min(0).max(200).nullable().optional(),
  parkingSpaces: z.number().int().min(0).max(100).default(0),
};

const bookingFeeWithinPrice = (data: { price?: number; bookingFee?: number }) =>
  data.price === undefined || data.bookingFee === undefined || data.bookingFee <= data.price;

export const createPropertyZodSchema = z
  .object(propertyBaseShape)
  .refine(bookingFeeWithinPrice, {
    message: "Booking fee cannot be higher than the price",
    path: ["bookingFee"],
  });

export const updatePropertyZodSchema = z
  .object({
    title: propertyBaseShape.title.optional(),
    description: propertyBaseShape.description.optional(),
    type: propertyBaseShape.type.optional(),
    purpose: propertyBaseShape.purpose.optional(),
    price: propertyBaseShape.price.optional(),
    bookingFee: propertyBaseShape.bookingFee.optional(),
    areaSqft: propertyBaseShape.areaSqft.optional(),
    bedrooms: z.number().int().min(0).max(30).optional(),
    bathrooms: z.number().int().min(0).max(30).optional(),
    division: propertyBaseShape.division.optional(),
    city: propertyBaseShape.city.optional(),
    area: propertyBaseShape.area.optional(),
    address: propertyBaseShape.address.optional(),
    latitude: propertyBaseShape.latitude,
    longitude: propertyBaseShape.longitude,
    amenities: z.array(z.enum(PROPERTY_AMENITIES, "Invalid amenity")).max(20).optional(),
    furnishing: z.enum(["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"]).optional(),
    yearBuilt: propertyBaseShape.yearBuilt,
    floor: propertyBaseShape.floor,
    parkingSpaces: z.number().int().min(0).max(100).optional(),
    removeImageIds: z.array(z.uuid("Invalid image ID")).max(10).optional(),
    coverImageId: z.uuid("Invalid image ID").optional(),
  })
  .refine(bookingFeeWithinPrice, {
    message: "Booking fee cannot be higher than the price",
    path: ["bookingFee"],
  });

export const updatePropertyStatusZodSchema = z.object({
  status: z.enum(["AVAILABLE", "PENDING", "SOLD", "RENTED"], "Invalid property status"),
});

export const updatePropertyApprovalZodSchema = z
  .object({
    approvalStatus: z.enum(["APPROVED", "REJECTED"], "approvalStatus must be APPROVED or REJECTED"),
    rejectionReason: z.string().trim().min(10).max(500).optional(),
  })
  .refine((data) => data.approvalStatus !== "REJECTED" || Boolean(data.rejectionReason), {
    message: "Please give a rejection reason (at least 10 characters)",
    path: ["rejectionReason"],
  });

export const updatePropertyFeaturedZodSchema = z.object({
  isFeatured: z.boolean("isFeatured must be true or false"),
});

export const propertyIdParamsZodSchema = z.object({
  id: z.uuid("Invalid property ID"),
});

export const propertyIdOrSlugParamsZodSchema = z.object({
  idOrSlug: z.string().trim().min(1).max(150),
});

export const getPropertiesQueryZodSchema = z.object({
  searchTerm: z.string().max(100).optional(),
  type: z.enum(["APARTMENT", "HOUSE", "LAND", "COMMERCIAL"]).optional(),
  purpose: z.enum(["SALE", "RENT"]).optional(),
  status: z.enum(["AVAILABLE", "PENDING", "SOLD", "RENTED"]).optional(),
  approvalStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  furnishing: z.enum(["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"]).optional(),
  division: z.string().max(40).optional(),
  city: z.string().max(60).optional(),
  area: z.string().max(80).optional(),
  minPrice: numericString("minPrice").optional(),
  maxPrice: numericString("maxPrice").optional(),
  minArea: numericString("minArea").optional(),
  maxArea: numericString("maxArea").optional(),
  bedrooms: numericString("bedrooms").optional(),
  bathrooms: numericString("bathrooms").optional(),
  amenities: z.string().max(500).optional(),
  isFeatured: z.enum(["true", "false"]).optional(),
  agentId: z.uuid("Invalid agent ID").optional(),
  fields: z.string().max(300).optional(),
  page: z.string().regex(/^\d+$/, "page must be a number").optional(),
  limit: z.string().regex(/^\d+$/, "limit must be a number").optional(),
  sortBy: z.enum(["price", "createdAt", "areaSqft", "avgRating", "views", "bedrooms"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
