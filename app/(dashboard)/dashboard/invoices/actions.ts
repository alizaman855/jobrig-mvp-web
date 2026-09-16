"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-guards";
import { markInvoicePaidSchema } from "@/lib/validations/invoice";

export type MarkPaidState = {
  error?: string;
  success?: boolean;
};

export async function markInvoicePaidAction(
  invoiceId: string,
  _prevState: MarkPaidState,
  formData: FormData
): Promise<MarkPaidState> {
  const user = await requireRole(["OWNER", "DISPATCHER"]);

  const parsed = markInvoicePaidSchema.safeParse({
    paymentMethod: formData.get("paymentMethod"),
  });
  if (!parsed.success) {
    return { error: "Select a payment method." };
  }

  // Conditional update, not read-then-write: `status: "UNPAID"` is part of
  // the WHERE clause itself, so only a currently-unpaid invoice matches —
  // a double submit (or a future Stripe webhook racing a manual mark-as-
  // paid) can't process the same invoice twice. forTenant()'s generic
  // update() doesn't support an extra condition beyond id, so this goes
  // directly through prisma, same as the earlier quote-signing race fix.
  const result = await prisma.invoice.updateMany({
    where: { id: invoiceId, businessId: user.businessId, status: "UNPAID" },
    data: {
      status: "PAID",
      paymentMethod: parsed.data.paymentMethod,
      paidAt: new Date(),
    },
  });

  if (result.count === 0) {
    return { error: "Invoice not found, or already marked paid." };
  }

  revalidatePath("/dashboard/invoices");
  return { success: true };
}
