import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Plus, User } from "lucide-react";
import { requireRole } from "@/lib/auth-guards";
import { forTenant } from "@/lib/tenant";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { JobStatusSelect } from "@/components/dashboard/job-status-select";
import { JOB_STATUSES } from "@/lib/validations/job";
import { jobStatusLabel } from "@/components/dashboard/job-status-badge";

export const metadata: Metadata = { title: "Jobs — Jobrig" };

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

export default async function JobsBoardPage() {
  const user = await requireRole(["OWNER", "DISPATCHER"]);

  const jobs = await forTenant({ businessId: user.businessId }).job.findMany({
    include: { customer: { select: { name: true } }, assignedTech: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const columns = JOB_STATUSES.map((status) => ({
    status,
    jobs: jobs.filter((job) => job.status === status),
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{jobs.length} total jobs</p>
        <Button render={<Link href="/dashboard/jobs/new" />} nativeButton={false} className="h-10">
          <Plus className="size-4" />
          New job
        </Button>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-4">
          {columns.map((column) => (
            <div key={column.status} className="flex w-72 shrink-0 flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold text-foreground">
                  {jobStatusLabel(column.status)}
                </h2>
                <span className="text-xs text-muted-foreground">{column.jobs.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {column.jobs.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                    No jobs
                  </div>
                ) : (
                  column.jobs.map((job) => (
                    <Card key={job.id} className="gap-2">
                      <CardHeader className="gap-1">
                        <Link
                          href={`/dashboard/jobs/${job.id}`}
                          className="text-sm font-medium text-foreground hover:underline"
                        >
                          {job.serviceType}
                        </Link>
                        <p className="text-xs text-muted-foreground">{job.customer.name}</p>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="size-3.5" />
                            {job.assignedTech?.name ?? "Unassigned"}
                          </span>
                          {job.scheduledAt ? (
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3.5" />
                              {dateFormatter.format(job.scheduledAt)}
                            </span>
                          ) : null}
                        </div>
                        <JobStatusSelect jobId={job.id} status={job.status} />
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
