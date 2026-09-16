import { z } from "zod";

export const pricingTemplateSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  unit: z.string().trim().min(1, "Unit is required"),
  unitPrice: z.coerce.number().positive("Enter a price greater than 0"),
});
