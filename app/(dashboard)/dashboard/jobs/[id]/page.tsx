import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, FileText, MapPin, SquarePen, User, Wrench } from "lucide-react";
import { requireRole } from "@/lib/auth-guards";
import { forTenant } from "@/lib/tenant";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JobStatusSelect } from "@/components/dashboard/job-status-select";

export const metadata: Metadata = { title: "Job — Jobrig" };

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireRole(["OWNER", "DISPATCHER"]);
  const db = forTenant({ businessId: user.businessId });

  const job = await db.job.findMany({
    where: { id },
    include: {
      customer: true,
      assignedTech: { select: { name: true } },
      quotes: { orderBy: { createdAt: "desc" } },
    },
  });
  const jobRecord = job[0];
  if (!jobRecord) notFound();

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle className="text-xl">{jobRecord.serviceType}</CardTitle>
            <Link
              href={`/dashboard/customers/${jobRecord.customerId}`}
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              {jobRecord.customer.name}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <JobStatusSelect jobId={jobRecord.id} status={jobRecord.status} />
            <Button
              render={<Link href={`/dashboard/jobs/${jobRecord.id}/edit`} />}
              nativeButton={false}
              variant="outline"
              size="sm"
              className="h-9"
            >
              <SquarePen className="size-4" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-4" />
            {jobRecord.address}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="size-4" />
            {jobRecord.assignedTech ? jobRecord.assignedTech.name : "Unassigned"}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="size-4" />
            {jobRecord.scheduledAt ? dateFormatter.format(jobRecord.scheduledAt) : "Not scheduled"}
          </div>
          {jobRecord.notes ? (
            <div className="flex items-start gap-2 text-muted-foreground">
              <Wrench className="size-4 shrink-0 translate-y-0.5" />
              <p className="whitespace-pre-wrap">{jobRecord.notes}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Quotes</CardTitle>
          <Button render={<Link href={`/dashboard/jobs/${jobRecord.id}/quote`} />} nativeButton={false} size="sm" className="h-9">
            <FileText className="size-4" />
            {jobRecord.quotes.some((q) => q.status !== "SIGNED") ? "Continue quote" : "New quote"}
          </Button>
        </CardHeader>
        <CardContent>
          {jobRecord.quotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No quotes yet.</p>
          ) : (
            <ul className="flex flex-col divide-y">
              {jobRecord.quotes.map((quote) => (
                <li key={quote.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-muted-foreground">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
                      Number(quote.total)
                    )}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">{quote.status}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
