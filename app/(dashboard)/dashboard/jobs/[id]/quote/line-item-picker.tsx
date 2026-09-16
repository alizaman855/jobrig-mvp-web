"use client";

import { Plus } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export type PricingTemplateOption = {
  id: string;
  name: string;
  unit: string;
  unitPrice: number;
};

export function LineItemPicker({
  templates,
  onPick,
  onCustom,
  trigger,
}: {
  templates: PricingTemplateOption[];
  onPick: (template: PricingTemplateOption) => void;
  onCustom: () => void;
  trigger: React.ReactNode;
}) {
  return (
    <Sheet>
      <SheetTrigger render={trigger as React.ReactElement} />
      <SheetContent side="bottom" className="max-h-[80svh]">
        <SheetHeader>
          <SheetTitle>Add item</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-1 overflow-y-auto px-4 pb-4">
          {templates.map((template) => (
            <SheetClose
              key={template.id}
              render={
                <button
                  type="button"
                  onClick={() => onPick(template)}
                  className="flex h-14 items-center justify-between gap-3 rounded-lg px-3 text-left transition-colors hover:bg-muted"
                />
              }
            >
              <span className="flex flex-col">
                <span className="font-medium text-foreground">{template.name}</span>
                <span className="text-xs text-muted-foreground">per {template.unit}</span>
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {currency.format(template.unitPrice)}
              </span>
            </SheetClose>
          ))}

          <SheetClose
            render={
              <button
                type="button"
                onClick={onCustom}
                className="mt-1 flex h-14 items-center gap-2 rounded-lg border border-dashed px-3 text-left text-foreground transition-colors hover:bg-muted"
              />
            }
          >
            <Plus className="size-4" />
            <span className="font-medium">Custom item</span>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
