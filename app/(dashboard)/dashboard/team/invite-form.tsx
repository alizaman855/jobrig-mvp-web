"use client";

import { useActionState, useState } from "react";
import { Check, Copy, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inviteAction, type InviteState } from "./actions";

const initialState: InviteState = {};

export function InviteForm() {
  const [state, formAction, pending] = useActionState(inviteAction, initialState);
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    if (!state.inviteUrl) return;
    await navigator.clipboard.writeText(state.inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3">
      <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="invite-email">Email</Label>
          <Input
            id="invite-email"
            name="email"
            type="email"
            placeholder="tech@example.com"
            required
            className="h-10"
          />
          {state.fieldErrors?.email ? (
            <p role="alert" className="text-sm text-destructive">
              {state.fieldErrors.email}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="invite-role">Role</Label>
          <Select name="role" defaultValue="TECH">
            <SelectTrigger id="invite-role" className="h-10 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TECH">Tech</SelectItem>
              <SelectItem value="DISPATCHER">Dispatcher</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={pending} className="h-10">
          <UserPlus className="size-4" />
          {pending ? "Sending invite…" : "Send invite"}
        </Button>
      </form>
      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      {state.inviteUrl ? (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm">
          <span className="flex-1 truncate text-muted-foreground">{state.inviteUrl}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyLink}
            className="h-8 shrink-0"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy link"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
