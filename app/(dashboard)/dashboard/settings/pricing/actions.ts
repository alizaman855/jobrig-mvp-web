"use server";

import { revalidatePath } from "next/cache";
import { forTenant } from "@/lib/tenant";
import { requireRole } from "@/lib/auth-guards";
import { pricingTemplateSchema } from "@/lib/validations/pricing-template";

export type PricingTemplateState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

function parseForm(formData: FormData) {
  return pricingTemplateSchema.safeParse({
    name: formData.get("name"),
    unit: formData.get("unit"),
    unitPrice: formData.get("unitPrice"),
  });
}

function fieldErrorsFrom(issues: { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function createPricingTemplateAction(
  _prevState: PricingTemplateState,
  formData: FormData
): Promise<PricingTemplateState> {
  const user = await requireRole(["OWNER"]);
  const parsed = parseForm(formData);
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };

  await forTenant({ businessId: user.businessId }).pricingTemplate.create(parsed.data);

  revalidatePath("/dashboard/settings/pricing");
  return { success: true };
}

export async function updatePricingTemplateAction(
  templateId: string,
  _prevState: PricingTemplateState,
  formData: FormData
): Promise<PricingTemplateState> {
  const user = await requireRole(["OWNER"]);
  const parsed = parseForm(formData);
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };

  const result = await forTenant({ businessId: user.businessId }).pricingTemplate.update(
    templateId,
    parsed.data
  );
  if (result.count === 0) return { error: "Template not found." };

  revalidatePath("/dashboard/settings/pricing");
  return { success: true };
}

export async function deletePricingTemplateAction(templateId: string) {
  const user = await requireRole(["OWNER"]);
  await forTenant({ businessId: user.businessId }).pricingTemplate.delete(templateId);
  revalidatePath("/dashboard/settings/pricing");
}
