import { InquiryStatus } from "../../../generated/prisma/enums";

export interface ICreateInquiryPayload {
  propertyId: string;
  subject: string;
  message: string;
  phone?: string;
}

export interface ICreateInquiryReplyPayload {
  message: string;
}

export interface IUpdateInquiryStatusPayload {
  status: InquiryStatus;
}
