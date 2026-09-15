import { z } from "zod";

export const JOB_STATUSES = [
  "NEW",
  "QUOTED",
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "PAID",
] as const;

export const jobSchema = z.object({
  customerId: z.string().min(1, "Select a customer"),
  serviceType: z.string().trim().min(2, "Service type is required"),
  address: z.string().trim().min(3, "Address is required"),
  notes: z.string().trim().optional().default(""),
  assignedTechId: z.string().optional().default(""),
  scheduledAt: z.string().optional().default(""),
});

export const jobStatusSchema = z.object({
  status: z.enum(JOB_STATUSES),
});
