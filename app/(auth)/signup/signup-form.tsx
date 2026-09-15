"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signupAction, type SignupState } from "./actions";

const initialState: SignupState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Create your business account</CardTitle>
        <CardDescription>
          Set up Jobrig for your team in under a minute.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="businessName">Business name</Label>
            <Input
              id="businessName"
              name="businessName"
              autoComplete="organization"
              required
              className="h-11 text-base"
            />
            {state.fieldErrors?.businessName ? (
              <p role="alert" className="text-sm text-destructive">
                {state.fieldErrors.businessName}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ownerName">Your name</Label>
            <Input
              id="ownerName"
              name="ownerName"
              autoComplete="name"
              required
              className="h-11 text-base"
            />
            {state.fieldErrors?.ownerName ? (
              <p role="alert" className="text-sm text-destructive">
                {state.fieldErrors.ownerName}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="h-11 text-base"
            />
            {state.fieldErrors?.email ? (
              <p role="alert" className="text-sm text-destructive">
                {state.fieldErrors.email}
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
            {pending ? "Creating account…" : "Create account"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
