"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { acceptInviteAction, type AcceptInviteState } from "./actions";

const initialState: AcceptInviteState = {};

export function AcceptInviteForm({ token, email }: { token: string; email: string }) {
  const boundAction = acceptInviteAction.bind(null, token);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="invite-email">Email</Label>
        <Input id="invite-email" value={email} disabled className="h-11 text-base" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Your name</Label>
        <Input id="name" name="name" autoComplete="name" required className="h-11 text-base" />
        {state.fieldErrors?.name ? (
          <p role="alert" className="text-sm text-destructive">
            {state.fieldErrors.name}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="h-11 text-base"
        />
        {state.fieldErrors?.password ? (
          <p role="alert" className="text-sm text-destructive">
            {state.fieldErrors.password}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">At least 8 characters.</p>
        )}
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="h-11 text-base">
        {pending ? "Joining…" : "Join the team"}
      </Button>
    </form>
  );
}
