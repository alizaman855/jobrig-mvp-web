import { z } from "zod";

export const PAYMENT_METHODS = ["cash", "check", "card"] as const;

export const markInvoicePaidSchema = z.object({
  paymentMethod: z.enum(PAYMENT_METHODS),
});
