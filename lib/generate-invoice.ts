import "server-only";
import { Prisma } from "./generated/prisma/client.ts";
import { prisma } from "./db";
import { forTenant } from "./tenant";

/**
 * Called after a Job's status is set to COMPLETED. No-ops if there's no
 * signed Quote to invoice from (see Phase 6.1 plan: this is a deliberate
 * silent no-op, not an error, and the job still completes either way).
 *
 * Duplicate-invoice prevention is a DB constraint (@@unique([jobId]) on
 * Invoice), not a check-then-create — this always attempts the create and
 * treats a unique-constraint violation (P2002) as "already invoiced,
 * nothing to do." That's what actually makes it race-safe: two concurrent
 * calls (or the same job cycling through COMPLETED twice) can't both
 * succeed, the same way the quote-signing race was closed.
 */
export async function generateInvoiceForCompletedJob(businessId: string, jobId: string) {
  const job = await prisma.job.findFirst({ where: { id: jobId, businessId } });
  if (!job) return;

  const quote = await prisma.quote.findFirst({
    where: { jobId, businessId, status: "SIGNED" },
    orderBy: { signedAt: "desc" },
  });
  if (!quote) return;

  try {
    await forTenant({ businessId }).invoice.create({
      jobId,
      customerId: job.customerId,
      quoteId: quote.id,
      total: quote.total,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return; // already invoiced — expected on a repeat COMPLETED transition
    }
    throw error;
  }
}
