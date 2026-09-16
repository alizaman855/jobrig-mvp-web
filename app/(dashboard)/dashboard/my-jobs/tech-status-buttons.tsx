"use client";

import { useTransition } from "react";
import { Car, CheckCircle2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TECH_STATUS_STEPS } from "@/lib/validations/job";
import type { JobStatus } from "@/lib/generated/prisma/client.ts";
import { updateOwnJobStatusAction } from "./actions";

const STEP_META: Record<(typeof TECH_STATUS_STEPS)[number], { label: string; icon: typeof Car }> = {
  EN_ROUTE: { label: "En route", icon: Car },
  IN_PROGRESS: { label: "In progress", icon: Wrench },
  COMPLETED: { label: "Completed", icon: CheckCircle2 },
};

export function TechStatusButtons({ jobId, status }: { jobId: string; status: JobStatus }) {
  const [pending, startTransition] = useTransition();

  function setStatus(next: (typeof TECH_STATUS_STEPS)[number]) {
    const formData = new FormData();
    formData.set("status", next);
    startTransition(() => {
      updateOwnJobStatusAction(jobId, formData);
    });
  }

  // Once a job is past this tech's own steps (e.g. marked PAID by the
  // office), stop offering these controls.
  if (status === "PAID") return null;

  return (
    <div className="mt-3 grid grid-cols-3 gap-2">
      {TECH_STATUS_STEPS.map((step) => {
        const { label, icon: Icon } = STEP_META[step];
        const active = status === step;
        return (
          <Button
            key={step}
            type="button"
            variant={active ? "default" : "outline"}
            disabled={pending}
            onClick={() => setStatus(step)}
            className="h-11 flex-col gap-0.5 text-xs"
          >
            <Icon className="size-4" />
            {label}
          </Button>
        );
      })}
    </div>
  );
}
