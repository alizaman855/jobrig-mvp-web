"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth-guards";
import { TECH_STATUS_STEPS } from "@/lib/validations/job";
import { generateInvoiceForCompletedJob } from "@/lib/generate-invoice";
import { z } from "zod";

const techStatusSchema = z.object({
  status: z.enum(TECH_STATUS_STEPS),
});

export async function updateOwnJobStatusAction(jobId: string, formData: FormData) {
  const user = await requireUser();
  if (user.role !== "TECH") return;

  const parsed = techStatusSchema.safeParse({ status: formData.get("status") });
  if (!parsed.success) return;

  // Scoped by assignedTechId, not just businessId — a tech may only move
  // the status of a job actually assigned to them, enforced in the write
  // itself rather than a separate read-then-check.
  const result = await prisma.job.updateMany({
    where: { id: jobId, businessId: user.businessId, assignedTechId: user.id },
    data: { status: parsed.data.status },
  });

  if (result.count > 0 && parsed.data.status === "COMPLETED") {
    await generateInvoiceForCompletedJob(user.businessId, jobId);
  }

  revalidatePath("/dashboard/my-jobs");
  revalidatePath("/dashboard/jobs");
  revalidatePath("/dashboard/jobs/calendar");
  revalidatePath(`/dashboard/jobs/${jobId}`);
  revalidatePath("/dashboard/invoices");
}
