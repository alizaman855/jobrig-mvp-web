import type { Role } from "./generated/prisma/client.ts";

/**
 * Route rules, checked in order — first match wins. Anything under
 * /dashboard not matched here is open to any authenticated role. Enforced
 * in proxy.ts for fast redirects, and again via requireRole()/
 * requireJobAccess() inside each protected page and Server Action — Next's
 * own guidance warns proxy coverage can be silently lost on a matcher
 * change or route refactor, so it must never be the only check (see
 * node_modules/next/dist/docs .../proxy.md).
 *
 * `match` is a predicate rather than a plain prefix so a route like
 * /dashboard/jobs/[id]/quote can open to TECH while the rest of
 * /dashboard/jobs (the board, create/edit) stays OWNER+DISPATCHER only —
 * this rule must be listed before the general jobs rule below it.
 */
const QUOTE_BUILDER_PATH = /^\/dashboard\/jobs\/[^/]+\/quote(\/|$)/;

const ROUTE_RULES: { match: (pathname: string) => boolean; roles: Role[] }[] = [
  { match: (p) => p.startsWith("/dashboard/team"), roles: ["OWNER"] },
  { match: (p) => p.startsWith("/dashboard/settings"), roles: ["OWNER"] },
  { match: (p) => p.startsWith("/dashboard/reviews"), roles: ["OWNER"] },
  { match: (p) => p.startsWith("/dashboard/customers"), roles: ["OWNER", "DISPATCHER"] },
  { match: (p) => p.startsWith("/dashboard/invoices"), roles: ["OWNER", "DISPATCHER"] },
  { match: (p) => QUOTE_BUILDER_PATH.test(p), roles: ["OWNER", "DISPATCHER", "TECH"] },
  { match: (p) => p.startsWith("/dashboard/jobs"), roles: ["OWNER", "DISPATCHER"] },
];

export function canAccessPath(pathname: string, role: Role): boolean {
  const rule = ROUTE_RULES.find((r) => r.match(pathname));
  if (!rule) return true;
  return rule.roles.includes(role);
}
