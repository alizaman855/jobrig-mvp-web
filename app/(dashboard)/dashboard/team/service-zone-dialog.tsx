"use client";

import { useActionState, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateServiceZoneAction, type ServiceZoneState } from "./actions";

const initialState: ServiceZoneState = {};

export function ServiceZoneDialog({
  techId,
  techName,
  serviceZone,
  trigger,
}: {
  techId: string;
  techName: string;
  serviceZone: string | null;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const boundAction = updateServiceZoneAction.bind(null, techId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  useEffect(() => {
    if (state.success) setOpen(false);
  }, [state.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Service zone — {techName}</DialogTitle>
          <DialogDescription>
            A zip code, neighborhood, or city — whatever matches how you think about coverage
            areas. Used to suggest the closest tech when assigning a job.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="serviceZone">Service zone</Label>
            <Input
              id="serviceZone"
              name="serviceZone"
              placeholder="e.g. Springfield, or 62704"
              defaultValue={serviceZone ?? ""}
              className="h-10"
            />
          </div>
          {state.error ? (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="submit" disabled={pending} className="h-10">
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
