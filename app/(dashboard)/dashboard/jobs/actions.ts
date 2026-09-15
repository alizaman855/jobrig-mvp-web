"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { forTenant } from "@/lib/tenant";
import { requireRole } from "@/lib/auth-guards";
import { jobSchema, jobStatusSchema } from "@/lib/validations/job";

export type JobFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

function parseJobForm(formData: FormData) {
  return jobSchema.safeParse({
    customerId: formData.get("customerId"),
    serviceType: formData.get("serviceType"),
    address: formData.get("address"),
    notes: formData.get("notes"),
    assignedTechId: formData.get("assignedTechId"),
    scheduledAt: formData.get("scheduledAt"),
  });
}

function fieldErrorsFrom(issues: { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function createJobAction(
  _prevState: JobFormState,
  formData: FormData
): Promise<JobFormState> {
  const user = await requireRole(["OWNER", "DISPATCHER"]);
  const parsed = parseJobForm(formData);
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };

  const { customerId, serviceType, address, notes, assignedTechId, scheduledAt } = parsed.data;

  const db = forTenant({ businessId: user.businessId });

  const customer = await db.customer.findById(customerId);
  if (!customer) return { fieldErrors: { customerId: "Select a valid customer." } };

  const job = await db.job.create({
    customerId,
    serviceType,
    address,
    notes: notes || null,
    assignedTechId: assignedTechId && assignedTechId !== "unassigned" ? assignedTechId : null,
    scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
  });

  revalidatePath("/dashboard/jobs");
  revalidatePath(`/dashboard/customers/${customerId}`);
  redirect(`/dashboard/jobs/${job.id}`);
}

export async function updateJobAction(
  jobId: string,
  _prevState: JobFormState,
  formData: FormData
): Promise<JobFormState> {
  const user = await requireRole(["OWNER", "DISPATCHER"]);
  const parsed = parseJobForm(formData);
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };

  const { customerId, serviceType, address, notes, assignedTechId, scheduledAt } = parsed.data;
  const db = forTenant({ businessId: user.businessId });

  const customer = await db.customer.findById(customerId);
  if (!customer) return { fieldErrors: { customerId: "Select a valid customer." } };

  const result = await db.job.update(jobId, {
    customerId,
    serviceType,
    address,
    notes: notes || null,
    assignedTechId: assignedTechId && assignedTechId !== "unassigned" ? assignedTechId : null,
    scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
  });

  if (result.count === 0) return { error: "Job not found." };

  revalidatePath("/dashboard/jobs");
  revalidatePath(`/dashboard/jobs/${jobId}`);
  redirect(`/dashboard/jobs/${jobId}`);
}

export async function updateJobStatusAction(jobId: string, formData: FormData) {
  const user = await requireRole(["OWNER", "DISPATCHER"]);
  const parsed = jobStatusSchema.safeParse({ status: formData.get("status") });
  if (!parsed.success) return;

  await forTenant({ businessId: user.businessId }).job.update(jobId, {
    status: parsed.data.status,
  });

  revalidatePath("/dashboard/jobs");
  revalidatePath(`/dashboard/jobs/${jobId}`);
}
