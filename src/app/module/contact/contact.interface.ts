import { ContactStatus } from "../../../generated/prisma/enums";

export interface ICreateContactMessagePayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface IUpdateContactStatusPayload {
  status: ContactStatus;
}
