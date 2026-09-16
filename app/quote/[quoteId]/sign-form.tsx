"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignaturePad } from "@/components/signature-pad";
import { signQuoteAction, type SignQuoteState } from "./actions";

const initialState: SignQuoteState = {};

export function SignForm({ quoteId }: { quoteId: string }) {
  const router = useRouter();
  const boundAction = signQuoteAction.bind(null, quoteId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (state.success) router.refresh();
  }, [state.success, router]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Approve &amp; sign</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="signatureDataUrl" value={signatureDataUrl ?? ""} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="signedByName">Your full name</Label>
            <Input id="signedByName" name="signedByName" required className="h-11 text-base" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Signature</Label>
            <SignaturePad onChange={setSignatureDataUrl} />
          </div>
          {state.error ? (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          ) : null}
          <Button
            type="submit"
            disabled={pending || !signatureDataUrl}
            className="h-11 text-base"
          >
            {pending ? "Submitting…" : "Approve & sign"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
