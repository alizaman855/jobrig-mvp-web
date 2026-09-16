import "server-only";
import { Prisma } from "./generated/prisma/client.ts";
import { prisma } from "./db";
import { forTenant } from "./tenant";

export type GenerateInvoiceResult = "created" | "already_invoiced" | "no_signed_quote" | "job_not_found";

/**
 * Called after a Job's status is set to COMPLETED. No-ops (returns
 * "no_signed_quote") if there's no signed Quote to invoice from — see
 * Phase 6.1 plan: the job still completes either way. Callers surface this
 * to the user (a completed job with no invoice would otherwise look like
 * a bug, not a deliberate "nothing to invoice yet" state).
 *
 * Duplicate-invoice prevention is a DB constraint (@@unique([jobId]) on
 * Invoice), not a check-then-create — this always attempts the create and
 * treats a unique-constraint violation (P2002) as "already invoiced,
 * nothing to do." That's what actually makes it race-safe: two concurrent
 * calls (or the same job cycling through COMPLETED twice) can't both
 * succeed, the same way the quote-signing race was closed.
 */
export async function generateInvoiceForCompletedJob(
  businessId: string,
  jobId: string
): Promise<GenerateInvoiceResult> {
  const job = await prisma.job.findFirst({ where: { id: jobId, businessId } });
  if (!job) return "job_not_found";

  const quote = await prisma.quote.findFirst({
    where: { jobId, businessId, status: "SIGNED" },
    orderBy: { signedAt: "desc" },
  });
  if (!quote) return "no_signed_quote";

  try {
    await forTenant({ businessId }).invoice.create({
      jobId,
      customerId: job.customerId,
      quoteId: quote.id,
      total: quote.total,
    });
    return "created";
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return "already_invoiced"; // expected on a repeat COMPLETED transition
    }
    throw error;
  }
}
