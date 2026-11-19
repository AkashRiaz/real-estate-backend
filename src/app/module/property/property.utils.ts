import {
  PropertySelect,
  PropertyWhereInput,
} from "../../../generated/prisma/models";
import {
  ApprovalStatus,
  FurnishingStatus,
  PropertyPurpose,
  PropertyStatus,
  PropertyType,
} from "../../../generated/prisma/enums";
import { IQuery } from "../../interfaces";

export const BANGLADESH_DIVISIONS = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
] as const;

export const PROPERTY_AMENITIES = [
  "Lift",
  "Generator Backup",
  "24/7 Security",
  "CCTV",
  "Car Parking",
  "Gas Connection",
  "Water Reservoir",
  "Fire Safety",
  "Intercom",
  "Swimming Pool",
  "Gym",
  "Rooftop Garden",
  "Community Hall",
  "Kids Play Area",
  "Servant Room",
  "Balcony",
  "Air Conditioning",
  "Fiber Internet",
  "Prayer Room",
  "Lake View",
] as const;

export const MAX_PROPERTY_IMAGES = 10;

export const PROPERTY_SORT_FIELDS = [
  "price",
  "createdAt",
  "areaSqft",
  "avgRating",
  "views",
  "bedrooms",
];

// Public listings: approved, not deleted.
export const publicPropertyWhere: PropertyWhereInput = {
  approvalStatus: ApprovalStatus.APPROVED,
  isDeleted: false,
};

// Shape used by every listing card (search page, featured, favorites, related...).
export const propertyCardSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  type: true,
  purpose: true,
  price: true,
  bookingFee: true,
  areaSqft: true,
  bedrooms: true,
  bathrooms: true,
  division: true,
  city: true,
  area: true,
  status: true,
  approvalStatus: true,
  isFeatured: true,
  avgRating: true,
  totalReviews: true,
  views: true,
  createdAt: true,
  images: {
    orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
    take: 1,
    select: { id: true, url: true },
  },
  agent: {
    select: {
      id: true,
      name: true,
      imageUrl: true,
      agentProfile: { select: { agencyName: true, isVerified: true } },
    },
  },
} satisfies PropertySelect;

// Fields the client may request through ?fields=title,price,...
const SELECTABLE_FIELDS = [
  "title",
  "slug",
  "description",
  "type",
  "purpose",
  "price",
  "bookingFee",
  "areaSqft",
  "bedrooms",
  "bathrooms",
  "division",
  "city",
  "area",
  "address",
  "amenities",
  "furnishing",
  "status",
  "isFeatured",
  "avgRating",
  "totalReviews",
  "views",
  "createdAt",
  "images",
  "agent",
];

/**
 * Field limiting: ?fields=title,price,images -> a Prisma select.
 * Falls back to the full card shape when no valid field is requested.
 */
export const buildPropertySelect = (fields?: string): PropertySelect => {
  if (!fields) return propertyCardSelect;

  const requested = fields
    .split(",")
    .map((field) => field.trim())
    .filter((field) => SELECTABLE_FIELDS.includes(field));

  if (!requested.length) return propertyCardSelect;

  const select: PropertySelect = { id: true };
  for (const field of requested) {
    if (field === "images") select.images = propertyCardSelect.images;
    else if (field === "agent") select.agent = propertyCardSelect.agent;
    else (select as Record<string, boolean>)[field] = true;
  }

  return select;
};

const toNumber = (value?: string) => {
  if (value === undefined || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

/**
 * Builds the where-conditions shared by public, agent and admin listing endpoints.
 */
export const buildPropertyFilters = (query: IQuery): PropertyWhereInput[] => {
  const andConditions: PropertyWhereInput[] = [];

  if (query.searchTerm) {
    const term = query.searchTerm;
    andConditions.push({
      OR: [
        { title: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
        { city: { contains: term, mode: "insensitive" } },
        { area: { contains: term, mode: "insensitive" } },
        { address: { contains: term, mode: "insensitive" } },
      ],
    });
  }

  if (query.type) andConditions.push({ type: query.type as PropertyType });
  if (query.purpose) andConditions.push({ purpose: query.purpose as PropertyPurpose });
  if (query.status) andConditions.push({ status: query.status as PropertyStatus });
  if (query.furnishing) {
    andConditions.push({ furnishing: query.furnishing as FurnishingStatus });
  }
  if (query.approvalStatus) {
    andConditions.push({ approvalStatus: query.approvalStatus as ApprovalStatus });
  }

  if (query.division) {
    andConditions.push({ division: { equals: query.division, mode: "insensitive" } });
  }
  if (query.city) {
    andConditions.push({ city: { equals: query.city, mode: "insensitive" } });
  }
  if (query.area) {
    andConditions.push({ area: { contains: query.area, mode: "insensitive" } });
  }

  const minPrice = toNumber(query.minPrice);
  const maxPrice = toNumber(query.maxPrice);
  if (minPrice !== undefined || maxPrice !== undefined) {
    andConditions.push({ price: { gte: minPrice, lte: maxPrice } });
  }

  const minArea = toNumber(query.minArea);
  const maxArea = toNumber(query.maxArea);
  if (minArea !== undefined || maxArea !== undefined) {
    andConditions.push({ areaSqft: { gte: minArea, lte: maxArea } });
  }

  // "3" means 3 or more bedrooms.
  const bedrooms = toNumber(query.bedrooms);
  if (bedrooms !== undefined) andConditions.push({ bedrooms: { gte: bedrooms } });

  const bathrooms = toNumber(query.bathrooms);
  if (bathrooms !== undefined) andConditions.push({ bathrooms: { gte: bathrooms } });

  if (query.amenities) {
    const amenities = query.amenities
      .split(",")
      .map((amenity) => amenity.trim())
      .filter(Boolean);
    if (amenities.length) andConditions.push({ amenities: { hasEvery: amenities } });
  }

  if (query.isFeatured) andConditions.push({ isFeatured: query.isFeatured === "true" });
  if (query.agentId) andConditions.push({ agentId: query.agentId });

  return andConditions;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value: string) => UUID_PATTERN.test(value);

// Fields an agent can change without the listing going back to review.
export const APPROVAL_NEUTRAL_FIELDS = ["status", "coverImageId", "removeImageIds"];
