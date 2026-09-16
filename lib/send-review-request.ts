import "server-only";
import { Prisma } from "./generated/prisma/client.ts";
import { prisma } from "./db";
import { forTenant } from "./tenant";
import { resend, EMAIL_FROM } from "./resend";
import { reviewRequestEmailHtml } from "../emails/review-request-email";

export type SendReviewRequestResult =
  | "sent"
  | "failed"
  | "already_requested"
  | "no_review_link"
  | "no_customer_email"
  | "invoice_not_found";

/**
 * Called after an Invoice is marked PAID. Sends via Resend email rather
 * than Twilio SMS — a deliberate Phase 7 MVP deviation (no new vendor
 * account needed, Resend already wired up in 4.6), not a permanent
 * decision; ReviewRequest.twilioMessageSid stays reserved for when SMS is
 * actually built, emailMessageId is what's populated today.
 *
 * Duplicate-send prevention is @@unique([jobId]) on ReviewRequest, same
 * pattern as Invoice in 6.1: always attempt the create, treat a unique
 * violation as "already requested," never a separate check-then-create.
 */
export async function sendReviewRequestForPaidInvoice(
  businessId: string,
  invoiceId: string
): Promise<SendReviewRequestResult> {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, businessId },
    include: {
      business: { select: { name: true, googleReviewUrl: true } },
      customer: { select: { id: true, name: true, email: true } },
      job: { select: { id: true } },
    },
  });
  if (!invoice) return "invoice_not_found";
  if (!invoice.business.googleReviewUrl) return "no_review_link";
  if (!invoice.customer.email) return "no_customer_email";

  let reviewRequest;
  try {
    reviewRequest = await forTenant({ businessId }).reviewRequest.create({
      jobId: invoice.job.id,
      customerId: invoice.customer.id,
      status: "PENDING",
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return "already_requested";
    }
    throw error;
  }

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: invoice.customer.email,
      subject: `Thanks from ${invoice.business.name} — got a minute for a review?`,
      html: reviewRequestEmailHtml({
        businessName: invoice.business.name,
        customerName: invoice.customer.name,
        googleReviewUrl: invoice.business.googleReviewUrl,
      }),
    });

    await forTenant({ businessId }).reviewRequest.update(reviewRequest.id, {
      status: "SENT",
      sentAt: new Date(),
      emailMessageId: result.data?.id ?? null,
    });
    return "sent";
  } catch (error) {
    console.error("Failed to send review request email:", error);
    await forTenant({ businessId }).reviewRequest.update(reviewRequest.id, { status: "FAILED" });
    return "failed"; // logged as FAILED; the invoice-paid action itself still succeeded
  }
}
