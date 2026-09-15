"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CustomerFormState } from "./actions";

const initialState: CustomerFormState = {};

export function CustomerForm({
  action,
  customer,
  submitLabel,
}: {
  action: (prevState: CustomerFormState, formData: FormData) => Promise<CustomerFormState>;
  customer?: { name: string; phone: string; email: string | null; address: string };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={customer?.name}
          required
          className="h-11 text-base"
        />
        {state.fieldErrors?.name ? (
          <p role="alert" className="text-sm text-destructive">
            {state.fieldErrors.name}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={customer?.phone}
          required
          className="h-11 text-base"
        />
        {state.fieldErrors?.phone ? (
          <p role="alert" className="text-sm text-destructive">
            {state.fieldErrors.phone}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email (optional)</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={customer?.email ?? ""}
          className="h-11 text-base"
        />
        {state.fieldErrors?.email ? (
          <p role="alert" className="text-sm text-destructive">
            {state.fieldErrors.email}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          defaultValue={customer?.address}
          required
          className="h-11 text-base"
        />
        {state.fieldErrors?.address ? (
          <p role="alert" className="text-sm text-destructive">
            {state.fieldErrors.address}
          </p>
        ) : null}
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <div>
        <Button type="submit" disabled={pending} className="h-11 text-base">
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
