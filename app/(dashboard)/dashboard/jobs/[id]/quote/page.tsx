import type { Metadata } from "next";
import { requireJobAccess } from "@/lib/auth-guards";
import { prisma } from "@/lib/db";
import { QuoteBuilder } from "./quote-builder";

export const metadata: Metadata = { title: "Build quote — Jobrig" };

export default async function QuoteBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: jobId } = await params;
  const { job } = await requireJobAccess(jobId);

  const customer = await prisma.customer.findUniqueOrThrow({
    where: { id: job.customerId },
    select: { name: true },
  });

  const [templates, existingQuote] = await Promise.all([
    prisma.pricingTemplate.findMany({
      where: { businessId: job.businessId },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.quote.findFirst({
      where: { jobId, status: { not: "SIGNED" } },
      orderBy: { createdAt: "desc" },
      include: { lineItems: { orderBy: { sortOrder: "asc" } } },
    }),
  ]);

  return (
    <QuoteBuilder
      jobId={job.id}
      customerName={customer.name}
      jobAddress={job.address}
      templates={templates.map((t) => ({
        id: t.id,
        name: t.name,
        unit: t.unit,
        unitPrice: Number(t.unitPrice),
      }))}
      initialQuoteId={existingQuote?.id ?? null}
      initialLineItems={
        existingQuote?.lineItems.map((li) => ({
          key: li.id,
          description: li.description,
          unit: li.unit ?? "",
          quantity: li.quantity.toString(),
          unitPrice: li.unitPrice.toString(),
        })) ?? []
      }
    />
  );
}
