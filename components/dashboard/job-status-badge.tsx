import { Badge } from "@/components/ui/badge";
import type { JobStatus } from "@/lib/generated/prisma/client.ts";

const STATUS_LABEL: Record<JobStatus, string> = {
  NEW: "New",
  QUOTED: "Quoted",
  SCHEDULED: "Scheduled",
  EN_ROUTE: "En route",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  PAID: "Paid",
};

const STATUS_CLASS: Record<JobStatus, string> = {
  NEW: "bg-muted text-muted-foreground",
  QUOTED: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  SCHEDULED: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200",
  EN_ROUTE: "bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200",
  IN_PROGRESS: "bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200",
  COMPLETED: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  PAID: "bg-primary/10 text-primary",
};

export function jobStatusLabel(status: JobStatus) {
  return STATUS_LABEL[status];
}

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return (
    <Badge variant="outline" className={`border-transparent ${STATUS_CLASS[status]}`}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}
