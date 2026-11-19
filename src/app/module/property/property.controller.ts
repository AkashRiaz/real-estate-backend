import { Request, Response } from "express";
import httpStatus from "http-status";
import { IQuery } from "../../interfaces";
import { RequestUser } from "../../middleware/checkAuth";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PropertyService } from "./property.service";

const getUploadedImages = (req: Request) => (req.files as Express.Multer.File[] | undefined) ?? [];

const createProperty = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyService.createProperty(
    req.user as RequestUser,
    req.body,
    getUploadedImages(req),
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message:
      result.approvalStatus === "APPROVED"
        ? "Property published successfully"
        : "Property submitted for review. It goes live once an admin approves it.",
    data: result,
  });
});

const getAllProperties = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyService.getAllProperties(req.query as IQuery);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Properties retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getMyProperties = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as RequestUser;
  const result = await PropertyService.getMyProperties(userId, req.query as IQuery);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Your properties retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getAllPropertiesForAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyService.getAllPropertiesForAdmin(req.query as IQuery);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Properties retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getPropertyFilterOptions = catchAsync(async (_req: Request, res: Response) => {
  const result = await PropertyService.getPropertyFilterOptions();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Filter options retrieved successfully",
    data: result,
  });
});

const getPropertyByIdOrSlug = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyService.getPropertyByIdOrSlug(
    req.params.idOrSlug as string,
    req.user,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Property retrieved successfully",
    data: result,
  });
});

const getRelatedProperties = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyService.getRelatedProperties(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Related properties retrieved successfully",
    data: result,
  });
});

const updateProperty = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyService.updateProperty(
    req.params.id as string,
    req.user as RequestUser,
    req.body,
    getUploadedImages(req),
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message:
      result.approvalStatus === "PENDING"
        ? "Property updated and sent for review"
        : "Property updated successfully",
    data: result,
  });
});

const updatePropertyStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyService.updatePropertyStatus(
    req.params.id as string,
    req.user as RequestUser,
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Property status updated successfully",
    data: result,
  });
});

const updatePropertyApproval = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyService.updatePropertyApproval(req.params.id as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `Property ${result.approvalStatus === "APPROVED" ? "approved" : "rejected"} successfully`,
    data: result,
  });
});

const updatePropertyFeatured = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyService.updatePropertyFeatured(req.params.id as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.isFeatured ? "Property marked as featured" : "Property removed from featured",
    data: result,
  });
});

const deleteProperty = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyService.deleteProperty(
    req.params.id as string,
    req.user as RequestUser,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Property deleted successfully",
    data: result,
  });
});

export const PropertyController = {
  createProperty,
  getAllProperties,
  getMyProperties,
  getAllPropertiesForAdmin,
  getPropertyFilterOptions,
  getPropertyByIdOrSlug,
  getRelatedProperties,
  updateProperty,
  updatePropertyStatus,
  updatePropertyApproval,
  updatePropertyFeatured,
  deleteProperty,
};
