"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/db";
import { signIn } from "@/auth";
import { signupSchema } from "@/lib/validations/auth";

export type SignupState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function signupAction(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const parsed = signupSchema.safeParse({
    businessName: formData.get("businessName"),
    ownerName: formData.get("ownerName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { fieldErrors };
  }

  const { businessName, ownerName, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { fieldErrors: { email: "An account with this email already exists." } };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Business + first (OWNER) user must be created together, atomically —
  // a business with zero users or a user with no business is invalid state.
  await prisma.$transaction(async (tx) => {
    const business = await tx.business.create({
      data: { name: businessName },
    });
    await tx.user.create({
      data: {
        businessId: business.id,
        name: ownerName,
        email,
        passwordHash,
        role: "OWNER",
      },
    });
  });

  try {
    await signIn("credentials", {
      email,
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
