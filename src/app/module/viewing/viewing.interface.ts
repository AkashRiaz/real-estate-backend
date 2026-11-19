export interface ICreateViewingPayload {
  propertyId: string;
  scheduledAt: Date;
  message?: string;
}

export interface IUpdateViewingStatusPayload {
  status: "APPROVED" | "REJECTED" | "COMPLETED";
  agentNote?: string;
}

export interface IRescheduleViewingPayload {
  scheduledAt: Date;
  agentNote?: string;
}

export interface ICancelViewingPayload {
  reason?: string;
}
