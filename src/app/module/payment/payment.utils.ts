import axios from "axios";
import { config } from "../../config";
import { getBkashIdToken } from "../../lib/bkash";

export interface IBkashCreateResponse {
  paymentID?: string;
  bkashURL?: string;
  statusCode?: string;
  statusMessage?: string;
}

export interface IBkashExecuteResponse {
  paymentID?: string;
  trxID?: string;
  amount?: string;
  transactionStatus?: string;
  statusCode?: string;
  statusMessage?: string;
  paymentExecuteTime?: string;
}

const bkashHeaders = async () => ({
  Authorization: await getBkashIdToken(),
  "X-App-Key": config.bkash_app_key,
  "Content-Type": "application/json",
  Accept: "application/json",
});

export const createBkashCheckout = async (payload: {
  amount: string;
  payerReference: string;
  invoiceNumber: string;
}) => {
  const response = await axios.post<IBkashCreateResponse>(
    `${config.bkash_base_url}/tokenized/checkout/create`,
    {
      mode: "0011",
      payerReference: payload.payerReference,
      callbackURL: `${config.bkash_callback_url}/payments/bkash/callback`,
      amount: payload.amount,
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber: payload.invoiceNumber,
    },
    { headers: await bkashHeaders(), timeout: 30_000 },
  );

  return response.data;
};

export const executeBkashPayment = async (paymentID: string) => {
  const response = await axios.post<IBkashExecuteResponse>(
    `${config.bkash_base_url}/tokenized/checkout/execute`,
    { paymentID },
    { headers: await bkashHeaders(), timeout: 30_000 },
  );

  return response.data;
};

// Used when execute fails or times out, to learn the real outcome.
export const queryBkashPayment = async (paymentID: string) => {
  const response = await axios.post<IBkashExecuteResponse>(
    `${config.bkash_base_url}/tokenized/checkout/payment/status`,
    { paymentID },
    { headers: await bkashHeaders(), timeout: 30_000 },
  );

  return response.data;
};

export const isBkashPaymentCompleted = (result: IBkashExecuteResponse) =>
  result.transactionStatus === "Completed" && (!result.statusCode || result.statusCode === "0000");

export const parseBkashPaymentDate = (dateString?: string): Date => {
  if (!dateString) {
    return new Date();
  }

  // bKash returns "2026-09-05T17:49:14:517 GMT+0600"
  // JavaScript needs "2026-09-05T17:49:14.517+06:00"
  const normalizedDate = dateString
    .trim()
    .replace(/(\d{2}:\d{2}:\d{2})[:.](\d{3})/, "$1.$2")
    .replace(/\s*GMT([+-]\d{2}):?(\d{2})$/, "$1:$2");
  const parsedDate = new Date(normalizedDate);

  return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
};
