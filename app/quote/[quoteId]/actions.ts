"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { uploadSignatureImage } from "@/lib/blob";

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
  const quote = await prisma.quote.findUnique({ where: { id: quoteId } });
  if (!quote) return { error: "Quote not found." };
  if (quote.status === "SIGNED") return { error: "This quote has already been signed." };
  if (quote.status !== "SENT") return { error: "This quote isn't ready to sign yet." };

  const signatureUrl = await uploadSignatureImage(quote.id, parsed.data.signatureDataUrl);

  await prisma.$transaction([
    prisma.quote.update({
      where: { id: quote.id },
      data: {
        status: "SIGNED",
        signatureUrl,
        signedByName: parsed.data.signedByName,
        signedAt: new Date(),
      },
    }),
    prisma.job.update({
      where: { id: quote.jobId },
      data: { status: "SCHEDULED" },
    }),
  ]);

  return { success: true };
}
