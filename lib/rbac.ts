import type { Role } from "./generated/prisma/client.ts";

/**
 * Route prefixes restricted to specific roles, checked in order (first
 * match wins). Anything under /dashboard not matched here is open to any
 * authenticated role. Enforced in proxy.ts for fast redirects, and again
 * via requireRole() inside each protected page and Server Action — Next's
 * own guidance warns proxy coverage can be silently lost on a matcher
 * change or route refactor, so it must never be the only check (see
 * node_modules/next/dist/docs .../proxy.md).
 */
const ROUTE_RULES: { prefix: string; roles: Role[] }[] = [
  { prefix: "/dashboard/team", roles: ["OWNER"] },
  { prefix: "/dashboard/settings", roles: ["OWNER"] },
  { prefix: "/dashboard/customers", roles: ["OWNER", "DISPATCHER"] },
  { prefix: "/dashboard/jobs", roles: ["OWNER", "DISPATCHER"] },
];

export function canAccessPath(pathname: string, role: Role): boolean {
  const rule = ROUTE_RULES.find((r) => pathname.startsWith(r.prefix));
  if (!rule) return true;
  return rule.roles.includes(role);
}
