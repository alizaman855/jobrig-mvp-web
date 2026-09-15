import { z } from "zod";

export const inviteSchema = z.object({
  email: z.email("Enter a valid email address"),
  role: z.enum(["TECH", "DISPATCHER"]),
});

export const acceptInviteSchema = z.object({
  name: z.string().trim().min(2, "Your name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
