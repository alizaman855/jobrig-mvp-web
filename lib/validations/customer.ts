import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  phone: z.string().trim().min(7, "Enter a valid phone number"),
  email: z.union([z.email("Enter a valid email address"), z.literal("")]),
  address: z.string().trim().min(3, "Address is required"),
});
