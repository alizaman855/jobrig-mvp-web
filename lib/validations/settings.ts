import { z } from "zod";

export const businessSettingsSchema = z.object({
  name: z.string().trim().min(2, "Business name is required"),
  contactEmail: z.union([z.email("Enter a valid email address"), z.literal("")]),
  contactPhone: z.string().trim().max(30).optional().default(""),
  googleReviewUrl: z.union([z.url("Enter a valid URL"), z.literal("")]),
});

export const MAX_LOGO_BYTES = 4 * 1024 * 1024; // 4MB
export const ACCEPTED_LOGO_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
