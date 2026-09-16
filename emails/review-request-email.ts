export type ReviewRequestEmailData = {
  businessName: string;
  customerName: string;
  googleReviewUrl: string;
};

export function reviewRequestEmailHtml(data: ReviewRequestEmailData): string {
  const { businessName, customerName, googleReviewUrl } = data;

  return `
<div style="font-family: -apple-system, Segoe UI, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #0f172a;">
  <p style="font-size: 14px; color: #64748b; margin: 0 0 24px;">${businessName}</p>
  <h1 style="font-size: 20px; margin: 0 0 16px;">Thanks for choosing us, ${customerName}!</h1>
  <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 24px;">
    We hope you're happy with the work. If you have a minute, a quick review helps us out a lot
    and helps other folks in the area find us.
  </p>
  <a href="${googleReviewUrl}" style="display: inline-block; background: #0369a1; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600;">
    Leave a review
  </a>
  <p style="font-size: 12px; color: #94a3b8; margin-top: 32px;">
    Thanks again for your business.
  </p>
</div>
`.trim();
}
