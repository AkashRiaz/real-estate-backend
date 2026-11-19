import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { FavoriteController } from "./favorite.controller";
import {
  addFavoriteZodSchema,
  favoritePropertyParamsZodSchema,
  getFavoritesQueryZodSchema,
} from "./favorite.validation";

const router = Router();

router.get(
  "/",
  auth(Role.USER),
  validateRequest(getFavoritesQueryZodSchema, "query"),
  FavoriteController.getMyFavorites,
);

router.get("/ids", auth(Role.USER), FavoriteController.getMyFavoriteIds);

router.post(
  "/",
  auth(Role.USER),
  validateRequest(addFavoriteZodSchema),
  FavoriteController.addFavorite,
);

router.delete(
  "/:propertyId",
  auth(Role.USER),
  validateRequest(favoritePropertyParamsZodSchema, "params"),
  FavoriteController.removeFavorite,
);

export const FavoriteRoutes = router;
