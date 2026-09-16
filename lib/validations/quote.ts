import { z } from "zod";

export const quoteLineItemSchema = z.object({
  description: z.string().trim().min(1),
  unit: z.string().trim().optional().default(""),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().nonnegative(),
});

export const saveQuoteDraftSchema = z.object({
  lineItems: z.array(quoteLineItemSchema),
});

export type QuoteLineItemInput = z.infer<typeof quoteLineItemSchema>;
