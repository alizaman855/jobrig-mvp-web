"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { forTenant } from "@/lib/tenant";
import { requireRole } from "@/lib/auth-guards";
import { generateInviteToken, hashInviteToken, INVITE_EXPIRY_MS } from "@/lib/invite-token";
import { inviteSchema } from "@/lib/validations/invite";
import { serviceZoneSchema } from "@/lib/validations/service-zone";

export type InviteState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  inviteUrl?: string;
};

export async function inviteAction(
  _prevState: InviteState,
  formData: FormData
): Promise<InviteState> {
  const user = await requireRole(["OWNER"]);

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }

  const { email, role } = parsed.data;

  // Email is globally unique across all businesses (Phase 1 decision), so
  // this must be a direct, un-scoped lookup rather than forTenant() — the
  // whole point is to catch accounts in *other* businesses too, and to
  // surface it here rather than let it fail later as a constraint error
  // deep in the accept-invite flow.
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { fieldErrors: { email: "This email already has an account." } };
  }

  const token = generateInviteToken();
  const tokenHash = hashInviteToken(token);
  const expiresAt = new Date(Date.now() + INVITE_EXPIRY_MS);

  await forTenant({ businessId: user.businessId }).invitation.upsertByEmail(email, {
    create: {
      role,
      tokenHash,
      expiresAt,
      invitedByUserId: user.id,
    },
    update: {
      role,
      tokenHash,
      expiresAt,
      acceptedAt: null,
      acceptedByUserId: null,
      invitedByUserId: user.id,
    },
  });

  revalidatePath("/dashboard/team");

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.startsWith("localhost") || host?.startsWith("127.0.0.1") ? "http" : "https";
  const inviteUrl = `${protocol}://${host}/invite/${token}`;
  return { inviteUrl };
}

export type ServiceZoneState = {
  error?: string;
  success?: boolean;
};

export async function updateServiceZoneAction(
  techId: string,
  _prevState: ServiceZoneState,
  formData: FormData
): Promise<ServiceZoneState> {
  const user = await requireRole(["OWNER"]);

  const parsed = serviceZoneSchema.safeParse({ serviceZone: formData.get("serviceZone") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid service zone." };
  }

  const result = await forTenant({ businessId: user.businessId }).user.update(techId, {
    serviceZone: parsed.data.serviceZone || null,
  });
  if (result.count === 0) return { error: "Team member not found." };

  revalidatePath("/dashboard/team");
  return { success: true };
}
