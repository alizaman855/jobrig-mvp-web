"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-guards";
import { uploadBusinessLogo } from "@/lib/blob";
import {
  businessSettingsSchema,
  MAX_LOGO_BYTES,
  ACCEPTED_LOGO_TYPES,
} from "@/lib/validations/settings";

export type SettingsState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

export async function updateSettingsAction(
  _prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const user = await requireRole(["OWNER"]);

  const parsed = businessSettingsSchema.safeParse({
    name: formData.get("name"),
    contactEmail: formData.get("contactEmail"),
    contactPhone: formData.get("contactPhone"),
    googleReviewUrl: formData.get("googleReviewUrl"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }

  const logoFile = formData.get("logo");
  let logoUrl: string | undefined;

  if (logoFile instanceof File && logoFile.size > 0) {
    if (logoFile.size > MAX_LOGO_BYTES) {
      return { fieldErrors: { logo: "Logo must be 4MB or smaller." } };
    }
    if (!ACCEPTED_LOGO_TYPES.includes(logoFile.type)) {
      return { fieldErrors: { logo: "Logo must be a PNG, JPEG, WebP, or SVG image." } };
    }
    logoUrl = await uploadBusinessLogo(user.businessId, logoFile);
  }

  const { name, contactEmail, contactPhone, googleReviewUrl } = parsed.data;

  // Business has no separate id to scope by — businessId *is* its id, taken
  // from the authenticated session (never client input), so this can only
  // ever touch the caller's own business. forTenant() doesn't apply here;
  // that pattern is for the child models it owns.
  await prisma.business.update({
    where: { id: user.businessId },
    data: {
      name,
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
      googleReviewUrl: googleReviewUrl || null,
      ...(logoUrl ? { logoUrl } : {}),
    },
  });

  revalidatePath("/dashboard", "layout");

  return { success: true };
}
