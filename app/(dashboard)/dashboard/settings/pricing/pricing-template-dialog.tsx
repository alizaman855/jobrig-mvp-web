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
import {
  createPricingTemplateAction,
  updatePricingTemplateAction,
  type PricingTemplateState,
} from "./actions";

const initialState: PricingTemplateState = {};

export function PricingTemplateDialog({
  trigger,
  template,
}: {
  trigger: React.ReactNode;
  template?: { id: string; name: string; unit: string; unitPrice: string };
}) {
  const [open, setOpen] = useState(false);
  const action = template
    ? updatePricingTemplateAction.bind(null, template.id)
    : createPricingTemplateAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) setOpen(false);
  }, [state.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{template ? "Edit pricing template" : "Add pricing template"}</DialogTitle>
          <DialogDescription>
            Shows up as a one-tap option in the Quote Builder.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. AC unit install"
              defaultValue={template?.name}
              required
              className="h-10"
            />
            {state.fieldErrors?.name ? (
              <p role="alert" className="text-sm text-destructive">
                {state.fieldErrors.name}
              </p>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                name="unit"
                placeholder="e.g. ton, linear ft, flat"
                defaultValue={template?.unit}
                required
                className="h-10"
              />
              {state.fieldErrors?.unit ? (
                <p role="alert" className="text-sm text-destructive">
                  {state.fieldErrors.unit}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="unitPrice">Price per unit</Label>
              <Input
                id="unitPrice"
                name="unitPrice"
                type="number"
                step="0.01"
                min="0"
                defaultValue={template?.unitPrice}
                required
                className="h-10"
              />
              {state.fieldErrors?.unitPrice ? (
                <p role="alert" className="text-sm text-destructive">
                  {state.fieldErrors.unitPrice}
                </p>
              ) : null}
            </div>
          </div>
          {state.error ? (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="submit" disabled={pending} className="h-10">
              {pending ? "Saving…" : template ? "Save changes" : "Add template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
