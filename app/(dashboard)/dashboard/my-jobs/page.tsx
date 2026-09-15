import type { Metadata } from "next";
import { ClipboardList, MapPin, Navigation, Phone, Wrench } from "lucide-react";
import { requireUser } from "@/lib/auth-guards";
import { forTenant } from "@/lib/tenant";
import { JobStatusBadge } from "@/components/dashboard/job-status-badge";

export const metadata: Metadata = { title: "My Jobs — Jobrig" };

const timeFormatter = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });
const dateFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" });

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function MyJobsPage() {
  const user = await requireUser();

  const jobs = await forTenant({ businessId: user.businessId }).job.findMany({
    where: { assignedTechId: user.id },
    include: { customer: { select: { name: true, phone: true } } },
    orderBy: { scheduledAt: "asc" },
  });

  const todayStart = startOfDay(new Date());
  const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const today = jobs.filter((j) => j.scheduledAt && j.scheduledAt >= todayStart && j.scheduledAt < tomorrowStart);
  const upcoming = jobs.filter((j) => j.scheduledAt && j.scheduledAt >= tomorrowStart);
  const unscheduled = jobs.filter((j) => !j.scheduledAt);

  const sections = [
    { label: "Today", jobs: today },
    { label: "Upcoming", jobs: upcoming },
    { label: "Unscheduled", jobs: unscheduled },
  ].filter((s) => s.jobs.length > 0);

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
        <ClipboardList className="size-8 text-muted-foreground" />
        <p className="font-medium">No jobs assigned yet</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          When a dispatcher assigns you a job, it&apos;ll show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      {sections.map((section) => (
        <div key={section.label} className="flex flex-col gap-3">
          <h2 className="px-1 text-sm font-semibold text-muted-foreground">{section.label}</h2>
          <div className="flex flex-col gap-3">
            {section.jobs.map((job) => (
              <div key={job.id} className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-base font-semibold text-foreground">{job.customer.name}</p>
                    <p className="text-sm text-muted-foreground">{job.serviceType}</p>
                  </div>
                  <JobStatusBadge status={job.status} />
                </div>

                {job.scheduledAt ? (
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {dateFormatter.format(job.scheduledAt)} · {timeFormatter.format(job.scheduledAt)}
                  </p>
                ) : null}

                <div className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0" />
                  <span>{job.address}</span>
                </div>

                {job.notes ? (
                  <div className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
                    <Wrench className="mt-0.5 size-4 shrink-0" />
                    <span className="whitespace-pre-wrap">{job.notes}</span>
                  </div>
                ) : null}

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(job.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 items-center justify-center gap-2 rounded-lg border text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <Navigation className="size-4" />
                    Directions
                  </a>
                  <a
                    href={`tel:${job.customer.phone}`}
                    className="flex h-11 items-center justify-center gap-2 rounded-lg border text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <Phone className="size-4" />
                    Call
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
