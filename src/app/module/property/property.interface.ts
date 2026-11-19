import {
  ApprovalStatus,
  FurnishingStatus,
  PropertyPurpose,
  PropertyStatus,
  PropertyType,
} from "../../../generated/prisma/enums";

export interface ICreatePropertyPayload {
  title: string;
  description: string;
  type: PropertyType;
  purpose: PropertyPurpose;
  price: number;
  bookingFee: number;
  areaSqft: number;
  bedrooms: number;
  bathrooms: number;
  division: string;
  city: string;
  area: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  amenities: string[];
  furnishing: FurnishingStatus;
  yearBuilt?: number | null;
  floor?: number | null;
  parkingSpaces: number;
}

export interface IUpdatePropertyPayload extends Partial<ICreatePropertyPayload> {
  removeImageIds?: string[];
  coverImageId?: string;
}

export interface IUpdatePropertyStatusPayload {
  status: PropertyStatus;
}

export interface IUpdatePropertyApprovalPayload {
  approvalStatus: Exclude<ApprovalStatus, "PENDING">;
  rejectionReason?: string;
}

export interface IUpdatePropertyFeaturedPayload {
  isFeatured: boolean;
}
