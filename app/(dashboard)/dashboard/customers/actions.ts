"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { forTenant } from "@/lib/tenant";
import { requireRole } from "@/lib/auth-guards";
import { customerSchema } from "@/lib/validations/customer";

export type CustomerFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

function parseCustomerForm(formData: FormData) {
  return customerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
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

export async function createCustomerAction(
  _prevState: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
  const user = await requireRole(["OWNER", "DISPATCHER"]);
  const parsed = parseCustomerForm(formData);
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };

  const { name, phone, email, address } = parsed.data;
  const customer = await forTenant({ businessId: user.businessId }).customer.create({
    name,
    phone,
    address,
    email: email || null,
  });

  revalidatePath("/dashboard/customers");
  redirect(`/dashboard/customers/${customer.id}`);
}

export async function updateCustomerAction(
  customerId: string,
  _prevState: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
  const user = await requireRole(["OWNER", "DISPATCHER"]);
  const parsed = parseCustomerForm(formData);
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };

  const { name, phone, email, address } = parsed.data;
  const result = await forTenant({ businessId: user.businessId }).customer.update(customerId, {
    name,
    phone,
    address,
    email: email || null,
  });

  if (result.count === 0) {
    return { error: "Customer not found." };
  }

  revalidatePath("/dashboard/customers");
  revalidatePath(`/dashboard/customers/${customerId}`);
  redirect(`/dashboard/customers/${customerId}`);
}
