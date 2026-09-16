"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { forTenant } from "@/lib/tenant";
import { requireRole } from "@/lib/auth-guards";
import { jobSchema, jobStatusSchema } from "@/lib/validations/job";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { jobAssignedEmailHtml } from "@/emails/job-assigned-email";
import { generateInvoiceForCompletedJob, type GenerateInvoiceResult } from "@/lib/generate-invoice";

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

async function notifyAssignedTech(params: {
  jobId: string;
  businessId: string;
  techId: string;
  customerName: string;
  serviceType: string;
  address: string;
  scheduledAt: Date | null;
  reason: "assigned" | "rescheduled";
}) {
  try {
    const [business, tech] = await Promise.all([
      prisma.business.findUniqueOrThrow({ where: { id: params.businessId }, select: { name: true } }),
      prisma.user.findUniqueOrThrow({ where: { id: params.techId }, select: { name: true, email: true } }),
    ]);

    const host = (await headers()).get("host");
    const protocol = host?.startsWith("localhost") || host?.startsWith("127.0.0.1") ? "http" : "https";

    await resend.emails.send({
      from: EMAIL_FROM,
      to: tech.email,
      subject: `${params.reason === "assigned" ? "New job assigned" : "Job rescheduled"}: ${params.serviceType}`,
      html: jobAssignedEmailHtml({
        businessName: business.name,
        techName: tech.name,
        customerName: params.customerName,
        serviceType: params.serviceType,
        address: params.address,
        scheduledAt: params.scheduledAt,
        reason: params.reason,
        jobUrl: `${protocol}://${host}/dashboard/jobs/${params.jobId}`,
      }),
    });
  } catch (error) {
    // The job is already validly saved at this point — a notification
    // failure shouldn't undo that or block the dispatcher's save.
    console.error("Failed to send job assignment email:", error);
  }
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

  const resolvedTechId = assignedTechId && assignedTechId !== "unassigned" ? assignedTechId : null;
  const resolvedScheduledAt = scheduledAt ? new Date(scheduledAt) : null;

  const job = await db.job.create({
    customerId,
    serviceType,
    address,
    notes: notes || null,
    assignedTechId: resolvedTechId,
    scheduledAt: resolvedScheduledAt,
  });

  if (resolvedTechId) {
    await notifyAssignedTech({
      jobId: job.id,
      businessId: user.businessId,
      techId: resolvedTechId,
      customerName: customer.name,
      serviceType,
      address,
      scheduledAt: resolvedScheduledAt,
      reason: "assigned",
    });
  }

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

  const [customer, existingJob] = await Promise.all([
    db.customer.findById(customerId),
    db.job.findById(jobId),
  ]);
  if (!customer) return { fieldErrors: { customerId: "Select a valid customer." } };
  if (!existingJob) return { error: "Job not found." };

  const resolvedTechId = assignedTechId && assignedTechId !== "unassigned" ? assignedTechId : null;
  const resolvedScheduledAt = scheduledAt ? new Date(scheduledAt) : null;

  const result = await db.job.update(jobId, {
    customerId,
    serviceType,
    address,
    notes: notes || null,
    assignedTechId: resolvedTechId,
    scheduledAt: resolvedScheduledAt,
  });

  if (result.count === 0) return { error: "Job not found." };

  if (resolvedTechId) {
    const isNewAssignment = existingJob.assignedTechId !== resolvedTechId;
    const isReschedule =
      !isNewAssignment &&
      existingJob.scheduledAt?.getTime() !== resolvedScheduledAt?.getTime();

    if (isNewAssignment || isReschedule) {
      await notifyAssignedTech({
        jobId,
        businessId: user.businessId,
        techId: resolvedTechId,
        customerName: customer.name,
        serviceType,
        address,
        scheduledAt: resolvedScheduledAt,
        reason: isNewAssignment ? "assigned" : "rescheduled",
      });
    }
  }

  revalidatePath("/dashboard/jobs");
  revalidatePath(`/dashboard/jobs/${jobId}`);
  redirect(`/dashboard/jobs/${jobId}`);
}

export async function updateJobStatusAction(
  jobId: string,
  formData: FormData
): Promise<{ invoiceResult?: GenerateInvoiceResult }> {
  const user = await requireRole(["OWNER", "DISPATCHER"]);
  const parsed = jobStatusSchema.safeParse({ status: formData.get("status") });
  if (!parsed.success) return {};

  await forTenant({ businessId: user.businessId }).job.update(jobId, {
    status: parsed.data.status,
  });

  let invoiceResult: GenerateInvoiceResult | undefined;
  if (parsed.data.status === "COMPLETED") {
    invoiceResult = await generateInvoiceForCompletedJob(user.businessId, jobId);
  }

  revalidatePath("/dashboard/jobs");
  revalidatePath(`/dashboard/jobs/${jobId}`);
  revalidatePath("/dashboard/invoices");

  return { invoiceResult };
}
