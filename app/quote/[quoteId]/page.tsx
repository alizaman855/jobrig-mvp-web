import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { QuoteDocument } from "@/components/quote-document";
import { SignForm } from "./sign-form";

export const metadata: Metadata = { title: "Your quote — Jobrig" };

export default async function PublicQuotePage({
  params,
}: {
  params: Promise<{ quoteId: string }>;
}) {
  const { quoteId } = await params;

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: {
      lineItems: { orderBy: { sortOrder: "asc" } },
      business: { select: { name: true, logoUrl: true, contactEmail: true, contactPhone: true } },
      customer: { select: { name: true, address: true, phone: true, email: true } },
      job: { select: { serviceType: true, address: true } },
    },
  });

  if (!quote || quote.status === "DRAFT") notFound();

  return (
    <div className="flex min-h-svh flex-col items-center gap-6 bg-background px-4 py-10 sm:px-6">
      <QuoteDocument
        data={{
          business: quote.business,
          customer: quote.customer,
          job: quote.job,
          quote: {
            id: quote.id,
            status: quote.status,
            total: Number(quote.total),
            createdAt: quote.createdAt,
            signatureUrl: quote.signatureUrl,
            signedByName: quote.signedByName,
            signedAt: quote.signedAt,
          },
          lineItems: quote.lineItems.map((li) => ({
            id: li.id,
            description: li.description,
            unit: li.unit,
            quantity: Number(li.quantity),
            unitPrice: Number(li.unitPrice),
            total: Number(li.total),
          })),
        }}
      />

      {quote.status === "SENT" ? (
        <div className="w-full max-w-2xl">
          <SignForm quoteId={quote.id} />
        </div>
      ) : null}
    </div>
  );
}
