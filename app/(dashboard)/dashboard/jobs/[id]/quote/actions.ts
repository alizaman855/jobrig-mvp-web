"use server";

import { prisma } from "@/lib/db";
import { requireJobAccess } from "@/lib/auth-guards";
import { saveQuoteDraftSchema, type QuoteLineItemInput } from "@/lib/validations/quote";

export type SaveQuoteDraftResult =
  | { ok: true; quoteId: string; total: number }
  | { ok: false; error: string };

function computeTotal(lineItems: QuoteLineItemInput[]) {
  return lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

/**
 * Full-replace autosave: deletes and recreates all of a quote's line items
 * on every call rather than diffing, since a quote has at most a handful of
 * rows and the builder always sends its complete current state — diffing
 * would add real complexity for no benefit at this scale.
 */
export async function saveQuoteDraftAction(
  jobId: string,
  quoteId: string | null,
  lineItems: unknown
): Promise<SaveQuoteDraftResult> {
  const { user, job } = await requireJobAccess(jobId);

  const parsed = saveQuoteDraftSchema.safeParse({ lineItems });
  if (!parsed.success) return { ok: false, error: "Invalid line items." };

  // A quote in this business, for this job, owned by this save — never
  // trust a client-supplied quoteId beyond that it resolves to one.
  if (quoteId) {
    const existing = await prisma.quote.findFirst({
      where: { id: quoteId, businessId: user.businessId, jobId },
    });
    if (!existing) return { ok: false, error: "Quote not found." };
    if (existing.status === "SIGNED") return { ok: false, error: "This quote is already signed." };
  }

  const total = computeTotal(parsed.data.lineItems);

  const saved = await prisma.$transaction(async (tx) => {
    const quote = quoteId
      ? await tx.quote.update({ where: { id: quoteId }, data: { total } })
      : await tx.quote.create({
          data: {
            businessId: user.businessId,
            jobId,
            customerId: job.customerId,
            total,
          },
        });

    await tx.quoteLineItem.deleteMany({ where: { quoteId: quote.id } });
    if (parsed.data.lineItems.length > 0) {
      await tx.quoteLineItem.createMany({
        data: parsed.data.lineItems.map((item, index) => ({
          businessId: user.businessId,
          quoteId: quote.id,
          description: item.description,
          unit: item.unit || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
          sortOrder: index,
        })),
      });
    }

    return quote;
  });

  return { ok: true, quoteId: saved.id, total };
}

export async function shareQuoteAction(jobId: string, quoteId: string): Promise<{ ok: boolean }> {
  const { user } = await requireJobAccess(jobId);

  const quote = await prisma.quote.findFirst({
    where: { id: quoteId, businessId: user.businessId, jobId },
  });
  if (!quote) return { ok: false };

  if (quote.status === "DRAFT") {
    await prisma.quote.update({ where: { id: quote.id }, data: { status: "SENT" } });
  }

  return { ok: true };
}
