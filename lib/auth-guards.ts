import "server-only";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { forTenant } from "./tenant";
import type { Role } from "./generated/prisma/client.ts";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session.user;
}

export async function requireRole(roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    redirect("/dashboard?error=forbidden");
  }
  return user;
}

/**
 * OWNER/DISPATCHER can act on any job in their business. TECH can only act
 * on a job assigned to them — used by routes like the quote builder that
 * proxy.ts opens to TECH at the path level but can't narrow to "their own
 * jobs only", since that requires a DB lookup proxy.ts doesn't do.
 */
export async function requireJobAccess(jobId: string) {
  const user = await requireUser();
  const job = await forTenant({ businessId: user.businessId }).job.findById(jobId);
  if (!job) notFound();

  if (user.role === "TECH" && job.assignedTechId !== user.id) {
    redirect("/dashboard?error=forbidden");
  }

  return { user, job };
}
