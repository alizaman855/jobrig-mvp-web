"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { uploadSignatureImage } from "@/lib/blob";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { signedQuoteEmailHtml } from "@/emails/signed-quote-email";

const signQuoteSchema = z.object({
  signedByName: z.string().trim().min(2, "Enter your full name"),
  signatureDataUrl: z.string().startsWith("data:image/png;base64,", "A signature is required"),
});

export type SignQuoteState = {
  error?: string;
  success?: boolean;
};

export async function signQuoteAction(
  quoteId: string,
  _prevState: SignQuoteState,
  formData: FormData
): Promise<SignQuoteState> {
  const parsed = signQuoteSchema.safeParse({
    signedByName: formData.get("signedByName"),
    signatureDataUrl: formData.get("signatureDataUrl"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please sign to continue." };
  }

  // Public, unauthenticated action — no session/businessId to scope by.
  // The quote is looked up by id alone and only ever mutated if it's
  // currently SENT, which closes the double-submit / already-signed race.
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: {
      business: { select: { name: true } },
      customer: { select: { name: true, email: true } },
      job: { select: { serviceType: true } },
    },
  });
  if (!quote) return { error: "Quote not found." };
  if (quote.status === "SIGNED") return { error: "This quote has already been signed." };
  if (quote.status !== "SENT") return { error: "This quote isn't ready to sign yet." };

  const signatureUrl = await uploadSignatureImage(quote.id, parsed.data.signatureDataUrl);
  const signedAt = new Date();

  await prisma.$transaction([
    prisma.quote.update({
      where: { id: quote.id },
      data: {
        status: "SIGNED",
        signatureUrl,
        signedByName: parsed.data.signedByName,
        signedAt,
      },
    }),
    prisma.job.update({
      where: { id: quote.jobId },
      data: { status: "SCHEDULED" },
    }),
  ]);

  if (quote.customer.email) {
    try {
      const host = (await headers()).get("host");
      const protocol = host?.startsWith("localhost") || host?.startsWith("127.0.0.1") ? "http" : "https";
      await resend.emails.send({
        from: EMAIL_FROM,
        to: quote.customer.email,
        subject: `Your signed quote from ${quote.business.name}`,
        html: signedQuoteEmailHtml({
          businessName: quote.business.name,
          customerName: quote.customer.name,
          serviceType: quote.job.serviceType,
          total: Number(quote.total),
          signedAt,
          quoteUrl: `${protocol}://${host}/quote/${quote.id}`,
        }),
      });
    } catch (error) {
      // The quote is already validly signed at this point — an email
      // failure shouldn't undo that or block the customer's confirmation.
      console.error("Failed to send signed quote email:", error);
    }
  }

  return { success: true };
}
