const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "long" });

export type SignedQuoteEmailData = {
  businessName: string;
  customerName: string;
  serviceType: string;
  total: number;
  signedAt: Date;
  quoteUrl: string;
};

export function signedQuoteEmailHtml(data: SignedQuoteEmailData): string {
  const { businessName, customerName, serviceType, total, signedAt, quoteUrl } = data;

  return `
<div style="font-family: -apple-system, Segoe UI, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #0f172a;">
  <p style="font-size: 14px; color: #64748b; margin: 0 0 24px;">${businessName}</p>
  <h1 style="font-size: 20px; margin: 0 0 16px;">Thanks, ${customerName} — your quote is signed</h1>
  <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 24px;">
    Here's a copy of your signed quote for <strong>${serviceType}</strong>, approved on ${dateFormatter.format(signedAt)}.
  </p>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
    <tr>
      <td style="padding: 16px; background: #f8fafc; border-radius: 8px; font-size: 16px; font-weight: 600;">
        Total: ${currency.format(total)}
      </td>
    </tr>
  </table>
  <a href="${quoteUrl}" style="display: inline-block; background: #0369a1; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600;">
    View your signed quote
  </a>
  <p style="font-size: 12px; color: #94a3b8; margin-top: 32px;">
    This quote is valid for 30 days from the date issued.
  </p>
</div>
`.trim();
}
