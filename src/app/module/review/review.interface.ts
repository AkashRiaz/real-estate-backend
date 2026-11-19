import { ReviewTarget } from "../../../generated/prisma/enums";

export interface ICreateReviewPayload {
  target: ReviewTarget;
  propertyId?: string;
  agentId?: string;
  rating: number;
  comment: string;
}

export interface IUpdateReviewPayload {
  rating?: number;
  comment?: string;
}

export interface IUpdateReviewVisibilityPayload {
  isHidden: boolean;
}
