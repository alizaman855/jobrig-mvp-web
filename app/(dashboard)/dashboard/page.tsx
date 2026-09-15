import type { Metadata } from "next";
import { requireUser } from "@/lib/auth-guards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Dashboard — Jobrig" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const { error } = await searchParams;

  return (
    <div className="flex flex-col gap-4">
      {error === "forbidden" ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          You don&apos;t have access to that page.
        </div>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user.name ?? user.email}</CardTitle>
          <CardDescription>
            Signed in as {user.role.toLowerCase()}. Job dispatch, quoting, and reporting
            land here in later phases.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          This dashboard home will be built out in Phase 8.
        </CardContent>
      </Card>
    </div>
  );
}
