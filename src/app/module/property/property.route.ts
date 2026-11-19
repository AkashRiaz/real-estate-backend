import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { upload } from "../../lib/multer";
import { auth, optionalAuth } from "../../middleware/checkAuth";
import { parseFormData } from "../../middleware/parseFormData";
import { validateRequest } from "../../middleware/validateRequest";
import { PropertyController } from "./property.controller";
import { MAX_PROPERTY_IMAGES } from "./property.utils";
import {
  createPropertyZodSchema,
  getPropertiesQueryZodSchema,
  propertyIdOrSlugParamsZodSchema,
  propertyIdParamsZodSchema,
  updatePropertyApprovalZodSchema,
  updatePropertyFeaturedZodSchema,
  updatePropertyStatusZodSchema,
  updatePropertyZodSchema,
} from "./property.validation";

const router = Router();

// ---------- Public ----------

router.get(
  "/",
  validateRequest(getPropertiesQueryZodSchema, "query"),
  PropertyController.getAllProperties,
);

router.get("/filter-options", PropertyController.getPropertyFilterOptions);

// ---------- Agent / Admin lists (before "/:idOrSlug") ----------

router.get(
  "/my-properties",
  auth(Role.AGENT, Role.ADMIN),
  validateRequest(getPropertiesQueryZodSchema, "query"),
  PropertyController.getMyProperties,
);

router.get(
  "/admin/all",
  auth(Role.ADMIN),
  validateRequest(getPropertiesQueryZodSchema, "query"),
  PropertyController.getAllPropertiesForAdmin,
);

router.get(
  "/:id/related",
  validateRequest(propertyIdParamsZodSchema, "params"),
  PropertyController.getRelatedProperties,
);

router.get(
  "/:idOrSlug",
  optionalAuth,
  validateRequest(propertyIdOrSlugParamsZodSchema, "params"),
  PropertyController.getPropertyByIdOrSlug,
);

// ---------- Write ----------

// multipart/form-data: images (files, up to 10) + data (JSON string)
router.post(
  "/",
  auth(Role.AGENT, Role.ADMIN),
  upload.array("images", MAX_PROPERTY_IMAGES),
  parseFormData,
  validateRequest(createPropertyZodSchema),
  PropertyController.createProperty,
);

router.patch(
  "/:id",
  auth(Role.AGENT, Role.ADMIN),
  upload.array("images", MAX_PROPERTY_IMAGES),
  parseFormData,
  validateRequest(propertyIdParamsZodSchema, "params"),
  validateRequest(updatePropertyZodSchema),
  PropertyController.updateProperty,
);

router.patch(
  "/:id/status",
  auth(Role.AGENT, Role.ADMIN),
  validateRequest(propertyIdParamsZodSchema, "params"),
  validateRequest(updatePropertyStatusZodSchema),
  PropertyController.updatePropertyStatus,
);

router.patch(
  "/:id/approval",
  auth(Role.ADMIN),
  validateRequest(propertyIdParamsZodSchema, "params"),
  validateRequest(updatePropertyApprovalZodSchema),
  PropertyController.updatePropertyApproval,
);

router.patch(
  "/:id/featured",
  auth(Role.ADMIN),
  validateRequest(propertyIdParamsZodSchema, "params"),
  validateRequest(updatePropertyFeaturedZodSchema),
  PropertyController.updatePropertyFeatured,
);

router.delete(
  "/:id",
  auth(Role.AGENT, Role.ADMIN),
  validateRequest(propertyIdParamsZodSchema, "params"),
  PropertyController.deleteProperty,
);

export const PropertyRoutes = router;
