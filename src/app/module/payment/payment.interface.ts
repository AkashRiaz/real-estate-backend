export interface ICreateBkashPaymentPayload {
  bookingId: string;
}

export interface IPaymentCallbackResult {
  success: boolean;
  status: "completed" | "failed" | "cancelled";
  redirectURL: string;
}
