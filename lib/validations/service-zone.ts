import { z } from "zod";

export const serviceZoneSchema = z.object({
  serviceZone: z.string().trim().max(120).optional().default(""),
});
