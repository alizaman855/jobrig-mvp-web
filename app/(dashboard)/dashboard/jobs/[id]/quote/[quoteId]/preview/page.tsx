import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, SquarePen } from "lucide-react";
import { requireJobAccess } from "@/lib/auth-guards";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { QuoteDocument } from "@/components/quote-document";
import { ShareQuoteButton } from "./share-quote-button";

export const metadata: Metadata = { title: "Quote preview — Jobrig" };

export default async function QuotePreviewPage({
  params,
}: {
  params: Promise<{ id: string; quoteId: string }>;
}) {
  const { id: jobId, quoteId } = await params;
  const { user, job } = await requireJobAccess(jobId);

  const [business, quote, customer] = await Promise.all([
    prisma.business.findUniqueOrThrow({
      where: { id: user.businessId },
      select: { name: true, logoUrl: true, contactEmail: true, contactPhone: true },
    }),
    prisma.quote.findFirst({
      where: { id: quoteId, businessId: user.businessId, jobId },
      include: { lineItems: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.customer.findUniqueOrThrow({
      where: { id: job.customerId },
      select: { name: true, address: true, phone: true, email: true },
    }),
  ]);

  if (!quote) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between print:hidden">
        <Link
          href={`/dashboard/jobs/${jobId}`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Back to job
        </Link>
        <div className="flex items-center gap-2">
          {quote.status === "DRAFT" ? (
            <Button
              render={<Link href={`/dashboard/jobs/${jobId}/quote`} />}
              nativeButton={false}
              variant="outline"
              size="sm"
              className="h-9"
            >
              <SquarePen className="size-4" />
              Edit
            </Button>
          ) : null}
          {quote.status !== "SIGNED" ? (
            <ShareQuoteButton jobId={jobId} quoteId={quote.id} alreadySent={quote.status === "SENT"} />
          ) : null}
        </div>
      </div>

      <QuoteDocument
        data={{
          business,
          customer,
          job: { serviceType: job.serviceType, address: job.address },
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
    </div>
  );
}
