import type { Role } from "./generated/prisma/client.ts";

/**
 * Route prefixes restricted to specific roles. Enforced in proxy.ts for
 * fast redirects, and again via requireRole() inside each protected page
 * and Server Action — Next's own guidance warns proxy coverage can be
 * silently lost on a matcher change or route refactor, so it must never
 * be the only check (see node_modules/next/dist/docs .../proxy.md).
 */
export const OWNER_ONLY_PREFIXES = ["/dashboard/team", "/dashboard/settings"];

export function isOwnerOnlyPath(pathname: string): boolean {
  return OWNER_ONLY_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function canAccessPath(pathname: string, role: Role): boolean {
  if (isOwnerOnlyPath(pathname) && role !== "OWNER") return false;
  return true;
}
