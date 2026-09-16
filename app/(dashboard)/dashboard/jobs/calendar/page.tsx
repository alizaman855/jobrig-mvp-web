import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { requireRole } from "@/lib/auth-guards";
import { forTenant } from "@/lib/tenant";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JobStatusBadge } from "@/components/dashboard/job-status-badge";

export const metadata: Metadata = { title: "Schedule — Jobrig" };

const timeFormatter = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

function toDateParam(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseDateParam(value: string | undefined) {
  if (!value) return new Date();
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const user = await requireRole(["OWNER", "DISPATCHER"]);

  const day = parseDateParam(dateParam);
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const prevDate = toDateParam(new Date(dayStart.getTime() - 24 * 60 * 60 * 1000));
  const nextDate = toDateParam(new Date(dayStart.getTime() + 24 * 60 * 60 * 1000));
  const todayDate = toDateParam(new Date());

  const db = forTenant({ businessId: user.businessId });

  const [techs, jobs] = await Promise.all([
    db.user.findMany({ where: { role: "TECH" }, orderBy: { name: "asc" } }),
    db.job.findMany({
      where: { scheduledAt: { gte: dayStart, lt: dayEnd } },
      include: { customer: { select: { name: true } } },
      orderBy: { scheduledAt: "asc" },
    }),
  ]);

  const unassignedJobs = jobs.filter((j) => !j.assignedTechId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Button
            render={<Link href={`/dashboard/jobs/calendar?date=${prevDate}`} />}
            nativeButton={false}
            variant="outline"
            size="icon-sm"
            aria-label="Previous day"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            render={<Link href={`/dashboard/jobs/calendar?date=${nextDate}`} />}
            nativeButton={false}
            variant="outline"
            size="icon-sm"
            aria-label="Next day"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            render={<Link href={`/dashboard/jobs/calendar?date=${todayDate}`} />}
            nativeButton={false}
            variant="outline"
            size="sm"
            className="h-8"
          >
            Today
          </Button>
        </div>
        <p className="text-sm font-medium text-foreground">{dateFormatter.format(dayStart)}</p>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-4">
          {techs.map((tech) => {
            const techJobs = jobs.filter((j) => j.assignedTechId === tech.id);
            return (
              <Card key={tech.id} className="w-72 shrink-0">
                <CardHeader className="flex-row items-center gap-2">
                  <User className="size-4 text-muted-foreground" />
                  <CardTitle className="text-sm">{tech.name}</CardTitle>
                  <span className="ml-auto text-xs text-muted-foreground">{techJobs.length}</span>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {techJobs.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">
                      Nothing scheduled
                    </p>
                  ) : (
                    techJobs.map((job) => (
                      <Link
                        key={job.id}
                        href={`/dashboard/jobs/${job.id}`}
                        className="flex flex-col gap-1 rounded-lg border p-2.5 transition-colors hover:bg-muted"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium">
                            {job.scheduledAt ? timeFormatter.format(job.scheduledAt) : ""}
                          </span>
                          <JobStatusBadge status={job.status} />
                        </div>
                        <span className="text-sm text-foreground">{job.serviceType}</span>
                        <span className="text-xs text-muted-foreground">{job.customer.name}</span>
                      </Link>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}

          <Card className="w-72 shrink-0">
            <CardHeader className="flex-row items-center gap-2">
              <CardTitle className="text-sm">Unassigned</CardTitle>
              <span className="ml-auto text-xs text-muted-foreground">{unassignedJobs.length}</span>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {unassignedJobs.length === 0 ? (
                <p className="rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">
                  Nothing unassigned
                </p>
              ) : (
                unassignedJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/dashboard/jobs/${job.id}/edit`}
                    className="flex flex-col gap-1 rounded-lg border p-2.5 transition-colors hover:bg-muted"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">
                        {job.scheduledAt ? timeFormatter.format(job.scheduledAt) : ""}
                      </span>
                      <JobStatusBadge status={job.status} />
                    </div>
                    <span className="text-sm text-foreground">{job.serviceType}</span>
                    <span className="text-xs text-muted-foreground">{job.customer.name}</span>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
