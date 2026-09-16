import "server-only";
import { Resend } from "resend";
import { env } from "./env";

export const resend = new Resend(env.RESEND_API_KEY);

// Resend's shared sender for accounts without a verified domain yet.
// Swap for a business address (e.g. "Jobrig <quotes@yourdomain.com>")
// once a domain is verified in the Resend dashboard.
export const EMAIL_FROM = "Jobrig <onboarding@resend.dev>";
