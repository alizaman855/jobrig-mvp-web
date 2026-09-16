"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LineItemPicker, type PricingTemplateOption } from "./line-item-picker";
import { saveQuoteDraftAction } from "./actions";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

type BuilderLineItem = {
  key: string;
  description: string;
  unit: string;
  quantity: string;
  unitPrice: string;
};

function newKey() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `item-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function lineTotal(item: BuilderLineItem) {
  const qty = Number(item.quantity) || 0;
  const price = Number(item.unitPrice) || 0;
  return qty * price;
}

export function QuoteBuilder({
  jobId,
  customerName,
  jobAddress,
  templates,
  initialQuoteId,
  initialLineItems,
}: {
  jobId: string;
  customerName: string;
  jobAddress: string;
  templates: PricingTemplateOption[];
  initialQuoteId: string | null;
  initialLineItems: BuilderLineItem[];
}) {
  const router = useRouter();
  const [quoteId, setQuoteId] = useState(initialQuoteId);
  const [lineItems, setLineItems] = useState<BuilderLineItem[]>(initialLineItems);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [continuePending, setContinuePending] = useState(false);
  const [continueError, setContinueError] = useState<string | null>(null);

  const focusKeyRef = useRef<string | null>(null);
  const inputRefs = useRef(new Map<string, HTMLInputElement>());
  const saveSeqRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextAutosave = useRef(true); // don't autosave on initial mount

  const total = lineItems.reduce((sum, item) => sum + lineTotal(item), 0);

  useEffect(() => {
    if (focusKeyRef.current) {
      const el = inputRefs.current.get(focusKeyRef.current);
      el?.focus();
      el?.select();
      focusKeyRef.current = null;
    }
  }, [lineItems]);

  async function persist(items: BuilderLineItem[]) {
    const mySeq = ++saveSeqRef.current;
    setSaveState("saving");
    const result = await saveQuoteDraftAction(
      jobId,
      quoteId,
      items.map((item) => ({
        description: item.description,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }))
    );
    if (mySeq !== saveSeqRef.current) return; // a newer save has since started
    if (result.ok) {
      setQuoteId(result.quoteId);
      setSaveState("saved");
    } else {
      setSaveState("error");
    }
  }

  // Debounced autosave, ~800ms after the last edit, skipped while there's
  // nothing worth saving yet or on first mount (resuming an existing draft
  // shouldn't immediately re-save itself).
  useEffect(() => {
    if (skipNextAutosave.current) {
      skipNextAutosave.current = false;
      return;
    }
    if (lineItems.length === 0) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void persist(lineItems);
    }, 800);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineItems]);

  function addFromTemplate(template: PricingTemplateOption) {
    const key = newKey();
    focusKeyRef.current = key;
    setLineItems((items) => [
      ...items,
      {
        key,
        description: template.name,
        unit: template.unit,
        quantity: "1",
        unitPrice: String(template.unitPrice),
      },
    ]);
  }

  function addCustom() {
    const key = newKey();
    focusKeyRef.current = key;
    setLineItems((items) => [
      ...items,
      { key, description: "", unit: "", quantity: "1", unitPrice: "0" },
    ]);
  }

  function updateItem(key: string, patch: Partial<BuilderLineItem>) {
    setLineItems((items) => items.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  function removeItem(key: string) {
    setLineItems((items) => items.filter((item) => item.key !== key));
    inputRefs.current.delete(key);
  }

  async function onContinue() {
    setContinuePending(true);
    setContinueError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const mySeq = ++saveSeqRef.current;
    const result = await saveQuoteDraftAction(
      jobId,
      quoteId,
      lineItems.map((item) => ({
        description: item.description,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }))
    );
    if (mySeq !== saveSeqRef.current) return;
    if (!result.ok) {
      setContinuePending(false);
      setContinueError(result.error);
      return;
    }
    router.push(`/dashboard/jobs/${jobId}/quote/${result.quoteId}/preview`);
  }

  return (
    <div className="-m-4 flex min-h-[calc(100svh-3.5rem)] flex-col sm:-m-6">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <Button
          render={<a href={`/dashboard/jobs/${jobId}`} />}
          nativeButton={false}
          variant="ghost"
          size="icon-sm"
          aria-label="Back to job"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{customerName}</p>
          <p className="truncate text-xs text-muted-foreground">{jobAddress}</p>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">
          {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : saveState === "error" ? "Save failed" : ""}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {lineItems.length === 0 ? (
          <div className="flex flex-col items-center gap-1 rounded-xl border border-dashed py-12 text-center">
            <p className="font-medium">No items yet</p>
            <p className="text-sm text-muted-foreground">Tap + Add item to start.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {lineItems.map((item) => (
              <div key={item.key} className="rounded-xl border bg-card p-3">
                <div className="flex items-start gap-2">
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(item.key, { description: e.target.value })}
                    placeholder="Description"
                    className="h-10 flex-1 border-none px-0 text-base font-medium shadow-none focus-visible:ring-0"
                    aria-label="Description"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeItem(item.key)}
                    aria-label="Remove item"
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">
                      Qty {item.unit ? `(${item.unit})` : ""}
                    </label>
                    <Input
                      ref={(el) => {
                        if (el) inputRefs.current.set(item.key, el);
                        else inputRefs.current.delete(item.key);
                      }}
                      value={item.quantity}
                      onChange={(e) => updateItem(item.key, { quantity: e.target.value })}
                      inputMode="decimal"
                      className="h-11 text-base"
                      aria-label="Quantity"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">Price</label>
                    <Input
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.key, { unitPrice: e.target.value })}
                      inputMode="decimal"
                      className="h-11 text-base"
                      aria-label="Unit price"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Total</span>
                    <span className="flex h-11 items-center text-base font-semibold">
                      {currency.format(lineTotal(item))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <LineItemPicker
          templates={templates}
          onPick={addFromTemplate}
          onCustom={addCustom}
          trigger={
            <Button type="button" variant="outline" className="mt-3 h-12 w-full text-base">
              <Plus className="size-4" />
              Add item
            </Button>
          }
        />
      </div>

      <div className="border-t bg-background px-4 py-3" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        {continueError ? (
          <p role="alert" className="mb-2 text-sm text-destructive">
            {continueError}
          </p>
        ) : null}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-2xl font-bold text-foreground">{currency.format(total)}</span>
        </div>
        <Button
          type="button"
          onClick={onContinue}
          disabled={lineItems.length === 0 || continuePending}
          className="h-12 w-full text-base"
        >
          {continuePending ? "Saving…" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
