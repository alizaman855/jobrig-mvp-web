import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Role } from "./generated/prisma/client.ts";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session.user;
}

export async function requireRole(roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    redirect("/dashboard?error=forbidden");
  }
  return user;
}
