"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deletePricingTemplateAction } from "./actions";

export function DeleteTemplateButton({ templateId, name }: { templateId: string; name: string }) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!window.confirm(`Delete "${name}"? This won't affect quotes that already used it.`)) return;
    startTransition(() => {
      deletePricingTemplateAction(templateId);
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      disabled={pending}
      onClick={onClick}
      aria-label={`Delete ${name}`}
    >
      <Trash2 className="size-4 text-destructive" />
    </Button>
  );
}
