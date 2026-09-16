"use client";

import { useActionState, useMemo, useState } from "react";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { suggestTech, type TechCandidate } from "@/lib/suggest-tech";
import type { JobFormState } from "./actions";

const initialState: JobFormState = {};

type CustomerOption = { id: string; name: string; address: string };
type TechOption = TechCandidate;

export function JobForm({
  action,
  customers,
  techs,
  submitLabel,
  job,
  defaultCustomerId,
}: {
  action: (prevState: JobFormState, formData: FormData) => Promise<JobFormState>;
  customers: CustomerOption[];
  techs: TechOption[];
  submitLabel: string;
  job?: {
    customerId: string;
    serviceType: string;
    address: string;
    notes: string | null;
    assignedTechId: string | null;
    scheduledAt: Date | null;
  };
  defaultCustomerId?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [address, setAddress] = useState(job?.address ?? "");
  const [addressTouched, setAddressTouched] = useState(Boolean(job));
  const [assignedTechId, setAssignedTechId] = useState(job?.assignedTechId ?? "unassigned");

  function onCustomerChange(customerId: string | null) {
    if (addressTouched || !customerId) return;
    const customer = customers.find((c) => c.id === customerId);
    if (customer) setAddress(customer.address);
  }

  const scheduledAtDefault = job?.scheduledAt
    ? new Date(job.scheduledAt.getTime() - job.scheduledAt.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
    : "";
  const [scheduledAt, setScheduledAt] = useState(scheduledAtDefault);

  const suggestions = useMemo(() => {
    if (!address.trim()) return [];
    const candidateDateIso = scheduledAt ? scheduledAt.slice(0, 10) : null;
    return suggestTech(address, candidateDateIso, techs);
  }, [address, scheduledAt, techs]);

  const topSuggestion = suggestions.find((s) => s.techId !== assignedTechId);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="customerId">Customer</Label>
        <Select
          name="customerId"
          defaultValue={job?.customerId ?? defaultCustomerId}
          onValueChange={onCustomerChange}
        >
          <SelectTrigger id="customerId" className="h-11 w-full text-base">
            <SelectValue placeholder="Select a customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.fieldErrors?.customerId ? (
          <p role="alert" className="text-sm text-destructive">
            {state.fieldErrors.customerId}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="serviceType">Service type</Label>
        <Input
          id="serviceType"
          name="serviceType"
          placeholder="e.g. AC installation"
          defaultValue={job?.serviceType}
          required
          className="h-11 text-base"
        />
        {state.fieldErrors?.serviceType ? (
          <p role="alert" className="text-sm text-destructive">
            {state.fieldErrors.serviceType}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="address">Service address</Label>
        <Input
          id="address"
          name="address"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            setAddressTouched(true);
          }}
          required
          className="h-11 text-base"
        />
        {state.fieldErrors?.address ? (
          <p role="alert" className="text-sm text-destructive">
            {state.fieldErrors.address}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="assignedTechId">Assigned tech</Label>
          <Select name="assignedTechId" value={assignedTechId} onValueChange={(v) => v && setAssignedTechId(v)}>
            <SelectTrigger id="assignedTechId" className="h-11 w-full text-base">
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {techs.map((tech) => (
                <SelectItem key={tech.id} value={tech.id}>
                  {tech.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="scheduledAt">Scheduled for</Label>
          <Input
            id="scheduledAt"
            name="scheduledAt"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="h-11 text-base"
          />
        </div>
      </div>

      {topSuggestion ? (
        <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
          <div className="flex-1">
            <p className="text-foreground">
              <span className="font-medium">Suggested: {topSuggestion.name}</span> — {topSuggestion.reason}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 shrink-0"
            onClick={() => setAssignedTechId(topSuggestion.techId)}
          >
            Use
          </Button>
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" defaultValue={job?.notes ?? ""} rows={3} />
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
