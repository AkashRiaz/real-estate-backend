import { UserStatus } from "../../../generated/prisma/enums";

export interface IUpdateMyProfilePayload {
  name?: string;
  phone?: string | null;
  removeImage?: boolean;
}

export interface IUpdateUserStatusPayload {
  status: UserStatus;
}
