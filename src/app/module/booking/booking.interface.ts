export interface ICreateBookingPayload {
  propertyId: string;
  note?: string;
}

export interface ICancelBookingPayload {
  reason?: string;
}
