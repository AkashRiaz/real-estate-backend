import { NotificationType } from "../../../generated/prisma/enums";

export interface IEmailDetail {
  label: string;
  value: string;
}

export interface ICreateNotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  // When set, the same notification is also emailed to the user.
  email?: {
    subject: string;
    actionText?: string;
    details?: IEmailDetail[];
  };
}
