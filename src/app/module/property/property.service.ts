import httpStatus from "http-status";
import { PropertyWhereInput } from "../../../generated/prisma/models";
import {
  ApprovalStatus,
  BookingStatus,
  NotificationType,
  PropertyPurpose,
  PropertyStatus,
  Role,
} from "../../../generated/prisma/enums";
import { generateSlug } from "../../helper/generateSlug";
import { buildMeta, calculatePagination } from "../../helper/paginationHelper";
import { IQuery } from "../../interfaces";
import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import { deleteFromCloudinary, uploadToCloudinary } from "../../utils/uploadToCloudinary";
import { NotificationService } from "../notification/notification.service";
import {
  ICreatePropertyPayload,
  IUpdatePropertyApprovalPayload,
  IUpdatePropertyFeaturedPayload,
  IUpdatePropertyPayload,
  IUpdatePropertyStatusPayload,
} from "./property.interface";
import {
  APPROVAL_NEUTRAL_FIELDS,
  MAX_PROPERTY_IMAGES,
  PROPERTY_SORT_FIELDS,
  buildPropertyFilters,
  buildPropertySelect,
  isUuid,
  propertyCardSelect,
  publicPropertyWhere,
} from "./property.utils";

const uploadPropertyImages = (files: Express.Multer.File[]) =>
  Promise.all(files.map((file) => uploadToCloudinary(file, "real-estate/properties")));

const findManageableProperty = async (id: string, user: RequestUser) => {
  const property = await prisma.property.findFirst({
    where: { id, isDeleted: false },
    include: { images: true },
  });

  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, "Property not found");
  }

  if (user.role !== Role.ADMIN && property.agentId !== user.userId) {
    throw new AppError(httpStatus.FORBIDDEN, "You can only manage your own listings");
  }

  return property;
};

const assertStatusMatchesPurpose = (status: PropertyStatus, purpose: PropertyPurpose) => {
  if (status === PropertyStatus.SOLD && purpose !== PropertyPurpose.SALE) {
    throw new AppError(httpStatus.BAD_REQUEST, "Only properties for sale can be marked as sold");
  }
  if (status === PropertyStatus.RENTED && purpose !== PropertyPurpose.RENT) {
    throw new AppError(httpStatus.BAD_REQUEST, "Only properties for rent can be marked as rented");
  }
};

const createProperty = async (
  user: RequestUser,
  payload: ICreatePropertyPayload,
  files: Express.Multer.File[],
) => {
  if (!files.length) {
    throw new AppError(httpStatus.BAD_REQUEST, "Please upload at least one property image");
  }

  if (files.length > MAX_PROPERTY_IMAGES) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `You can upload up to ${MAX_PROPERTY_IMAGES} images`,
    );
  }

  const uploadedImages = await uploadPropertyImages(files);

  try {
    return await prisma.property.create({
      data: {
        ...payload,
        slug: generateSlug(payload.title),
        agentId: user.userId,
        // Listings created by an admin skip the review queue.
        approvalStatus:
          user.role === Role.ADMIN ? ApprovalStatus.APPROVED : ApprovalStatus.PENDING,
        images: {
          create: uploadedImages.map((image, index) => ({
            url: image.secure_url,
            publicId: image.public_id,
            isCover: index === 0,
            sortOrder: index,
          })),
        },
      },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });
  } catch (error) {
    // Do not leave orphaned files on Cloudinary when the DB write fails.
    await deleteFromCloudinary(uploadedImages.map((image) => image.public_id));
    throw error;
  }
};

const getAllProperties = async (query: IQuery) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(
    query,
    PROPERTY_SORT_FIELDS,
  );

  // Public search never exposes pending/rejected listings, whatever the query says.
  const { approvalStatus: _ignored, ...publicQuery } = query;

  const where: PropertyWhereInput = {
    AND: [publicPropertyWhere, ...buildPropertyFilters(publicQuery)],
  };

  const [properties, total] = await prisma.$transaction([
    prisma.property.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ [sortBy]: sortOrder }, { id: "asc" }],
      select: buildPropertySelect(query.fields),
    }),
    prisma.property.count({ where }),
  ]);

  return { data: properties, meta: buildMeta(page, limit, total) };
};

const getMyProperties = async (agentId: string, query: IQuery) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(
    query,
    PROPERTY_SORT_FIELDS,
  );

  const where: PropertyWhereInput = {
    AND: [{ agentId, isDeleted: false }, ...buildPropertyFilters(query)],
  };

  const [properties, total] = await prisma.$transaction([
    prisma.property.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ [sortBy]: sortOrder }, { id: "asc" }],
      select: {
        ...propertyCardSelect,
        rejectionReason: true,
        _count: { select: { inquiries: true, viewings: true, favorites: true, bookings: true } },
      },
    }),
    prisma.property.count({ where }),
  ]);

  return { data: properties, meta: buildMeta(page, limit, total) };
};

const getAllPropertiesForAdmin = async (query: IQuery) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(
    query,
    PROPERTY_SORT_FIELDS,
  );

  const where: PropertyWhereInput = {
    AND: [{ isDeleted: false }, ...buildPropertyFilters(query)],
  };

  const [properties, total] = await prisma.$transaction([
    prisma.property.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ [sortBy]: sortOrder }, { id: "asc" }],
      select: {
        ...propertyCardSelect,
        rejectionReason: true,
        agent: { select: { id: true, name: true, email: true, phone: true } },
      },
    }),
    prisma.property.count({ where }),
  ]);

  return { data: properties, meta: buildMeta(page, limit, total) };
};

const getPropertyByIdOrSlug = async (idOrSlug: string, viewer?: RequestUser) => {
  const property = await prisma.property.findFirst({
    where: {
      ...(isUuid(idOrSlug) ? { id: idOrSlug } : { slug: idOrSlug }),
      isDeleted: false,
    },
    include: {
      images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] },
      agent: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          imageUrl: true,
          agentProfile: true,
        },
      },
      _count: { select: { favorites: true, reviews: { where: { isHidden: false } } } },
    },
  });

  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, "Property not found");
  }

  const isOwner = viewer?.userId === property.agentId;
  const isAdmin = viewer?.role === Role.ADMIN;

  // Pending or rejected listings are visible only to their agent and admins.
  if (property.approvalStatus !== ApprovalStatus.APPROVED && !isOwner && !isAdmin) {
    throw new AppError(httpStatus.NOT_FOUND, "Property not found");
  }

  if (!isOwner && !isAdmin) {
    await prisma.property.update({
      where: { id: property.id },
      data: { views: { increment: 1 } },
    });
    property.views += 1;
  }

  const isFavorited = viewer
    ? Boolean(
        await prisma.favorite.findUnique({
          where: { userId_propertyId: { userId: viewer.userId, propertyId: property.id } },
        }),
      )
    : false;

  return { ...property, isFavorited };
};

const getRelatedProperties = async (id: string) => {
  const property = await prisma.property.findFirst({
    where: { id, ...publicPropertyWhere },
    select: { id: true, type: true, city: true, purpose: true },
  });

  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, "Property not found");
  }

  const RELATED_LIMIT = 4;

  const sameCity = await prisma.property.findMany({
    where: {
      ...publicPropertyWhere,
      id: { not: property.id },
      type: property.type,
      city: property.city,
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: RELATED_LIMIT,
    select: propertyCardSelect,
  });

  if (sameCity.length >= RELATED_LIMIT) return sameCity;

  // Top up with the same type and purpose from other cities.
  const others = await prisma.property.findMany({
    where: {
      ...publicPropertyWhere,
      id: { notIn: [property.id, ...sameCity.map((item) => item.id)] },
      type: property.type,
      purpose: property.purpose,
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: RELATED_LIMIT - sameCity.length,
    select: propertyCardSelect,
  });

  return [...sameCity, ...others];
};

const getPropertyFilterOptions = async () => {
  const [locations, types, priceRange] = await prisma.$transaction([
    prisma.property.groupBy({
      by: ["division", "city"],
      where: publicPropertyWhere,
      orderBy: [{ division: "asc" }, { city: "asc" }],
      _count: { _all: true },
    }),
    prisma.property.groupBy({
      by: ["type"],
      where: publicPropertyWhere,
      orderBy: { type: "asc" },
      _count: { _all: true },
    }),
    prisma.property.aggregate({
      where: publicPropertyWhere,
      _min: { price: true, areaSqft: true },
      _max: { price: true, areaSqft: true },
    }),
  ]);

  const countOf = (group: { _count?: unknown }) => (group._count as { _all: number })._all;

  return {
    locations: locations.map((group) => ({
      division: group.division,
      city: group.city,
      count: countOf(group),
    })),
    types: types.map((group) => ({ type: group.type, count: countOf(group) })),
    priceRange: { min: priceRange._min.price, max: priceRange._max.price },
    areaRange: { min: priceRange._min.areaSqft, max: priceRange._max.areaSqft },
  };
};

const updateProperty = async (
  id: string,
  user: RequestUser,
  payload: IUpdatePropertyPayload,
  files: Express.Multer.File[],
) => {
  const property = await findManageableProperty(id, user);
  const { removeImageIds = [], coverImageId, ...data } = payload;

  const ownImageIds = new Set(property.images.map((image) => image.id));
  const invalidIds = [...removeImageIds, ...(coverImageId ? [coverImageId] : [])].filter(
    (imageId) => !ownImageIds.has(imageId),
  );

  if (invalidIds.length) {
    throw new AppError(httpStatus.BAD_REQUEST, "One or more images do not belong to this listing");
  }

  const remainingCount = property.images.length - removeImageIds.length + files.length;

  if (remainingCount < 1) {
    throw new AppError(httpStatus.BAD_REQUEST, "A listing must keep at least one image");
  }
  if (remainingCount > MAX_PROPERTY_IMAGES) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `A listing can have up to ${MAX_PROPERTY_IMAGES} images`,
    );
  }

  const nextPrice = data.price ?? Number(property.price);
  const nextFee = data.bookingFee ?? Number(property.bookingFee);
  if (nextFee > nextPrice) {
    throw new AppError(httpStatus.BAD_REQUEST, "Booking fee cannot be higher than the price");
  }

  // Content edits by an agent send an approved listing back to review.
  const changesContent =
    files.length > 0 ||
    removeImageIds.length > 0 ||
    Object.keys(data).some((key) => !APPROVAL_NEUTRAL_FIELDS.includes(key));
  const needsReview = user.role !== Role.ADMIN && changesContent;

  const uploadedImages = await uploadPropertyImages(files);
  const removedImages = property.images.filter((image) => removeImageIds.includes(image.id));

  try {
    const updated = await prisma.$transaction(async (tx) => {
      if (removeImageIds.length) {
        await tx.propertyImage.deleteMany({ where: { id: { in: removeImageIds } } });
      }

      if (uploadedImages.length) {
        const maxOrder = Math.max(0, ...property.images.map((image) => image.sortOrder));
        await tx.propertyImage.createMany({
          data: uploadedImages.map((image, index) => ({
            propertyId: id,
            url: image.secure_url,
            publicId: image.public_id,
            sortOrder: maxOrder + index + 1,
          })),
        });
      }

      // Keep exactly one cover image.
      const remaining = await tx.propertyImage.findMany({
        where: { propertyId: id },
        orderBy: { sortOrder: "asc" },
      });
      const newCoverId =
        coverImageId ?? remaining.find((image) => image.isCover)?.id ?? remaining[0]?.id;

      await tx.propertyImage.updateMany({ where: { propertyId: id }, data: { isCover: false } });
      if (newCoverId) {
        await tx.propertyImage.update({ where: { id: newCoverId }, data: { isCover: true } });
      }

      return tx.property.update({
        where: { id },
        data: {
          ...data,
          ...(data.title && data.title !== property.title && { slug: generateSlug(data.title) }),
          ...(needsReview && {
            approvalStatus: ApprovalStatus.PENDING,
            rejectionReason: null,
            isFeatured: false,
          }),
        },
        include: { images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] } },
      });
    });

    await deleteFromCloudinary(removedImages.map((image) => image.publicId));

    return updated;
  } catch (error) {
    await deleteFromCloudinary(uploadedImages.map((image) => image.public_id));
    throw error;
  }
};

const updatePropertyStatus = async (
  id: string,
  user: RequestUser,
  payload: IUpdatePropertyStatusPayload,
) => {
  const property = await findManageableProperty(id, user);

  assertStatusMatchesPurpose(payload.status, property.purpose);

  return prisma.property.update({
    where: { id },
    data: { status: payload.status },
    select: propertyCardSelect,
  });
};

const updatePropertyApproval = async (id: string, payload: IUpdatePropertyApprovalPayload) => {
  const property = await prisma.property.findFirst({ where: { id, isDeleted: false } });

  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, "Property not found");
  }

  const isApproved = payload.approvalStatus === ApprovalStatus.APPROVED;

  const updated = await prisma.property.update({
    where: { id },
    data: {
      approvalStatus: payload.approvalStatus,
      rejectionReason: isApproved ? null : payload.rejectionReason,
      ...(!isApproved && { isFeatured: false }),
    },
    select: { ...propertyCardSelect, rejectionReason: true },
  });

  await NotificationService.createNotification({
    userId: property.agentId,
    type: NotificationType.PROPERTY_APPROVAL,
    title: isApproved ? "Your listing is live" : "Your listing needs changes",
    message: isApproved
      ? `"${property.title}" was approved and is now visible to buyers.`
      : `"${property.title}" was not approved. Reason: ${payload.rejectionReason}`,
    link: "/dashboard/agent/properties",
    email: {
      subject: isApproved ? "Your EstateHub listing was approved" : "Your EstateHub listing needs changes",
      actionText: "View my listings",
    },
  });

  return updated;
};

const updatePropertyFeatured = async (id: string, payload: IUpdatePropertyFeaturedPayload) => {
  const property = await prisma.property.findFirst({ where: { id, isDeleted: false } });

  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, "Property not found");
  }

  if (payload.isFeatured && property.approvalStatus !== ApprovalStatus.APPROVED) {
    throw new AppError(httpStatus.BAD_REQUEST, "Only approved listings can be featured");
  }

  return prisma.property.update({
    where: { id },
    data: { isFeatured: payload.isFeatured },
    select: propertyCardSelect,
  });
};

const deleteProperty = async (id: string, user: RequestUser) => {
  await findManageableProperty(id, user);

  if (user.role !== Role.ADMIN) {
    const confirmedBooking = await prisma.booking.count({
      where: { propertyId: id, status: BookingStatus.CONFIRMED },
    });

    if (confirmedBooking) {
      throw new AppError(
        httpStatus.CONFLICT,
        "This listing has a confirmed booking and cannot be deleted. Please contact support.",
      );
    }
  }

  return prisma.$transaction(async (tx) => {
    await tx.booking.updateMany({
      where: { propertyId: id, status: BookingStatus.PENDING_PAYMENT },
      data: { status: BookingStatus.CANCELLED, cancelledAt: new Date() },
    });

    return tx.property.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), isFeatured: false },
      select: { id: true, title: true, isDeleted: true },
    });
  });
};

export const PropertyService = {
  createProperty,
  getAllProperties,
  getMyProperties,
  getAllPropertiesForAdmin,
  getPropertyByIdOrSlug,
  getRelatedProperties,
  getPropertyFilterOptions,
  updateProperty,
  updatePropertyStatus,
  updatePropertyApproval,
  updatePropertyFeatured,
  deleteProperty,
};
