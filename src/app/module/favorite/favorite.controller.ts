import { Request, Response } from "express";
import httpStatus from "http-status";
import { IQuery } from "../../interfaces";
import { RequestUser } from "../../middleware/checkAuth";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { FavoriteService } from "./favorite.service";

const getMyFavorites = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as RequestUser;
  const result = await FavoriteService.getMyFavorites(userId, req.query as IQuery);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Favorites retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getMyFavoriteIds = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as RequestUser;
  const result = await FavoriteService.getMyFavoriteIds(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Favorite property IDs retrieved successfully",
    data: result,
  });
});

const addFavorite = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as RequestUser;
  const result = await FavoriteService.addFavorite(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Property saved to favorites",
    data: result,
  });
});

const removeFavorite = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as RequestUser;
  const result = await FavoriteService.removeFavorite(userId, req.params.propertyId as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Property removed from favorites",
    data: result,
  });
});

export const FavoriteController = {
  getMyFavorites,
  getMyFavoriteIds,
  addFavorite,
  removeFavorite,
};
