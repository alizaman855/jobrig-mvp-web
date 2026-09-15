import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { canAccessPath } from "@/lib/rbac";

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;

  if (!session?.user) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!canAccessPath(nextUrl.pathname, session.user.role)) {
    return NextResponse.redirect(new URL("/dashboard?error=forbidden", nextUrl));
  }
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
