import type { DefaultSession } from "next-auth";
import type { Role } from "@/lib/generated/prisma/client.ts";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      businessId: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    businessId: string;
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    businessId: string;
    role: Role;
  }
}

// next-auth/jwt.d.ts re-exports (`export *`) from @auth/core/jwt without
// re-declaring the JWT interface, so augmenting "next-auth/jwt" alone does
// not merge into the interface actually used by NextAuth's callback types.
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    businessId: string;
    role: Role;
  }
}
