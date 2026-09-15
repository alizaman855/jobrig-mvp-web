"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/db";
import { signIn } from "@/auth";
import { hashInviteToken } from "@/lib/invite-token";
import { acceptInviteSchema } from "@/lib/validations/invite";

export type AcceptInviteState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function acceptInviteAction(
  token: string,
  _prevState: AcceptInviteState,
  formData: FormData
): Promise<AcceptInviteState> {
  const parsed = acceptInviteSchema.safeParse({
    name: formData.get("name"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }

  const tokenHash = hashInviteToken(token);
  const invitation = await prisma.invitation.findUnique({ where: { tokenHash } });

  if (!invitation || invitation.acceptedAt || invitation.expiresAt.getTime() < Date.now()) {
    return { error: "This invite link is invalid or has expired." };
  }

  // Re-check globally: the email could have gotten an account through some
  // other path between the invite being sent and being accepted.
  const existingUser = await prisma.user.findUnique({ where: { email: invitation.email } });
  if (existingUser) {
    return { error: "This email already has an account. Try logging in instead." };
  }

  const { name, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        businessId: invitation.businessId,
        name,
        email: invitation.email,
        passwordHash,
        role: invitation.role,
      },
    });
    await tx.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date(), acceptedByUserId: newUser.id },
    });
  });

  try {
    await signIn("credentials", {
      email: invitation.email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created, but automatic sign-in failed. Please log in." };
    }
    throw error;
  }

  return {};
}
