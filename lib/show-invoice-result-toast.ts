import { toast } from "sonner";
import type { GenerateInvoiceResult } from "./generate-invoice";

/** Shared by every place a job can be marked COMPLETED (dispatcher's status
 * dropdown, a tech's own status buttons) so the "no invoice — no signed
 * quote" case is never silent in the UI, only at the data layer. */
export function showInvoiceResultToast(result: GenerateInvoiceResult | undefined) {
  if (result === "no_signed_quote") {
    toast.info("Job completed — no invoice created", {
      description: "This job has no signed quote to invoice from yet.",
    });
  } else if (result === "created") {
    toast.success("Invoice created");
  }
}
