import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, MapPin, Phone, Plus, SquarePen } from "lucide-react";
import { requireRole } from "@/lib/auth-guards";
import { forTenant } from "@/lib/tenant";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JobStatusBadge } from "@/components/dashboard/job-status-badge";

export const metadata: Metadata = { title: "Customer — Jobrig" };

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireRole(["OWNER", "DISPATCHER"]);
  const db = forTenant({ businessId: user.businessId });

  const customer = await db.customer.findById(id);
  if (!customer) notFound();

  const jobs = await db.job.findMany({
    where: { customerId: id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle className="text-xl">{customer.name}</CardTitle>
          </div>
          <Button
            render={<Link href={`/dashboard/customers/${customer.id}/edit`} />}
            nativeButton={false}
            variant="outline"
            size="sm"
            className="h-9"
          >
            <SquarePen className="size-4" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="size-4" />
            {customer.phone}
          </div>
          {customer.email ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="size-4" />
              {customer.email}
            </div>
          ) : null}
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-4" />
            {customer.address}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Jobs</CardTitle>
          <Button
            render={<Link href={`/dashboard/jobs/new?customerId=${customer.id}`} />}
            nativeButton={false}
            size="sm"
            className="h-9"
          >
            <Plus className="size-4" />
            New job
          </Button>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No jobs for this customer yet.</p>
          ) : (
            <ul className="flex flex-col divide-y">
              {jobs.map((job) => (
                <li key={job.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">{job.serviceType}</p>
                    <p className="text-sm text-muted-foreground">{job.address}</p>
                  </div>
                  <JobStatusBadge status={job.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
