import crypto from "node:crypto";

export const generatePaymentTransactionId = (): string => {
  const timestamp = Date.now();
  const random = crypto.randomInt(1000, 9999);
  return `PAY-${timestamp}-${random}`;
};
