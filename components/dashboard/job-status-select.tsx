"use client";

import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JOB_STATUSES } from "@/lib/validations/job";
import { jobStatusLabel } from "@/components/dashboard/job-status-badge";
import { updateJobStatusAction } from "@/app/(dashboard)/dashboard/jobs/actions";
import type { JobStatus } from "@/lib/generated/prisma/client.ts";

export function JobStatusSelect({ jobId, status }: { jobId: string; status: JobStatus }) {
  const [pending, startTransition] = useTransition();

  function onValueChange(next: JobStatus | null) {
    if (!next) return;
    const formData = new FormData();
    formData.set("status", next);
    startTransition(() => {
      updateJobStatusAction(jobId, formData);
    });
  }

  return (
    <Select value={status} onValueChange={onValueChange} disabled={pending}>
      <SelectTrigger className="h-8 w-40 text-sm" aria-label="Job status">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {JOB_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {jobStatusLabel(s)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
