"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shareQuoteAction } from "../../actions";

export function ShareQuoteButton({
  jobId,
  quoteId,
  alreadySent,
}: {
  jobId: string;
  quoteId: string;
  alreadySent: boolean;
}) {
  const router = useRouter();
  const [sent, setSent] = useState(alreadySent);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const signUrl = typeof window !== "undefined" ? `${window.location.origin}/quote/${quoteId}` : "";

  function onShare() {
    startTransition(async () => {
      const result = await shareQuoteAction(jobId, quoteId);
      if (result.ok) {
        setSent(true);
        router.refresh();
      }
    });
  }

  async function copyLink() {
    await navigator.clipboard.writeText(signUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!sent) {
    return (
      <Button type="button" onClick={onShare} disabled={pending} className="h-9">
        <Send className="size-4" />
        {pending ? "Sharing…" : "Share for signature"}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm">
      <span className="max-w-[16rem] flex-1 truncate text-muted-foreground sm:max-w-xs">{signUrl}</span>
      <Button type="button" variant="outline" size="sm" onClick={copyLink} className="h-8 shrink-0">
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        {copied ? "Copied" : "Copy link"}
      </Button>
    </div>
  );
}
