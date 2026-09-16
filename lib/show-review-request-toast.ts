import { toast } from "sonner";
import type { SendReviewRequestResult } from "./send-review-request";

export function showReviewRequestToast(result: SendReviewRequestResult | undefined) {
  if (result === "sent") {
    toast.success("Review request sent");
  } else if (result === "no_review_link") {
    toast.info("Invoice marked paid — no review request sent", {
      description: "Add a Google Review link in Settings to send these automatically.",
    });
  } else if (result === "no_customer_email") {
    toast.info("Invoice marked paid — no review request sent", {
      description: "This customer has no email on file.",
    });
  } else if (result === "failed") {
    toast.error("Invoice marked paid, but the review request email failed to send");
  }
}
