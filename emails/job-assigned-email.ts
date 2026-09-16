const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeStyle: "short" });

export type JobAssignedEmailData = {
  businessName: string;
  techName: string;
  customerName: string;
  serviceType: string;
  address: string;
  scheduledAt: Date | null;
  reason: "assigned" | "rescheduled";
  jobUrl: string;
};

export function jobAssignedEmailHtml(data: JobAssignedEmailData): string {
  const { businessName, techName, customerName, serviceType, address, scheduledAt, reason, jobUrl } = data;

  const headline =
    reason === "assigned" ? "You've been assigned a job" : "A job on your schedule changed";

  return `
<div style="font-family: -apple-system, Segoe UI, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #0f172a;">
  <p style="font-size: 14px; color: #64748b; margin: 0 0 24px;">${businessName}</p>
  <h1 style="font-size: 20px; margin: 0 0 16px;">Hi ${techName}, ${headline.toLowerCase()}</h1>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
    <tr>
      <td style="padding: 8px 0; color: #64748b; width: 100px;">Customer</td>
      <td style="padding: 8px 0; font-weight: 600;">${customerName}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #64748b;">Service</td>
      <td style="padding: 8px 0;">${serviceType}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #64748b;">Address</td>
      <td style="padding: 8px 0;">${address}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #64748b;">Scheduled</td>
      <td style="padding: 8px 0;">${scheduledAt ? dateFormatter.format(scheduledAt) : "Not yet scheduled"}</td>
    </tr>
  </table>
  <a href="${jobUrl}" style="display: inline-block; background: #0369a1; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600;">
    View job
  </a>
</div>
`.trim();
}
