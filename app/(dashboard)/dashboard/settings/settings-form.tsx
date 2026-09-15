"use client";

import { useActionState, useState } from "react";
import { Building2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSettingsAction, type SettingsState } from "./actions";

const initialState: SettingsState = {};

export function SettingsForm({
  business,
}: {
  business: { name: string; logoUrl: string | null; contactEmail: string | null; contactPhone: string | null };
}) {
  const [state, formAction, pending] = useActionState(updateSettingsAction, initialState);
  const [preview, setPreview] = useState<string | null>(business.logoUrl);

  function onLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <Avatar className="size-16 rounded-lg">
          {preview ? <AvatarImage src={preview} alt="Business logo" /> : null}
          <AvatarFallback className="rounded-lg">
            <Building2 className="size-6 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="logo">Logo</Label>
          <Input
            id="logo"
            name="logo"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={onLogoChange}
            className="h-10 max-w-xs text-sm"
          />
          {state.fieldErrors?.logo ? (
            <p role="alert" className="text-sm text-destructive">
              {state.fieldErrors.logo}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">PNG, JPEG, WebP, or SVG. Up to 4MB.</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Business name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={business.name}
          required
          className="h-10 max-w-md"
        />
        {state.fieldErrors?.name ? (
          <p role="alert" className="text-sm text-destructive">
            {state.fieldErrors.name}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contactEmail">Contact email</Label>
        <Input
          id="contactEmail"
          name="contactEmail"
          type="email"
          defaultValue={business.contactEmail ?? ""}
          className="h-10 max-w-md"
        />
        {state.fieldErrors?.contactEmail ? (
          <p role="alert" className="text-sm text-destructive">
            {state.fieldErrors.contactEmail}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contactPhone">Contact phone</Label>
        <Input
          id="contactPhone"
          name="contactPhone"
          type="tel"
          defaultValue={business.contactPhone ?? ""}
          className="h-10 max-w-md"
        />
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p role="status" className="text-sm text-primary">
          Saved.
        </p>
      ) : null}

      <div>
        <Button type="submit" disabled={pending} className="h-10">
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
