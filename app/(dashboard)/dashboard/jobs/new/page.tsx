import type { Metadata } from "next";
import { requireRole } from "@/lib/auth-guards";
import { forTenant } from "@/lib/tenant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JobForm } from "../job-form";
import { createJobAction } from "../actions";

export const metadata: Metadata = { title: "New job — Jobrig" };

export default async function NewJobPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>;
}) {
  const { customerId } = await searchParams;
  const user = await requireRole(["OWNER", "DISPATCHER"]);
  const db = forTenant({ businessId: user.businessId });

  const [customers, techs] = await Promise.all([
    db.customer.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, address: true } }),
    db.user.findMany({ where: { role: "TECH" }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>New job</CardTitle>
      </CardHeader>
      <CardContent>
        <JobForm
          action={createJobAction}
          customers={customers}
          techs={techs}
          submitLabel="Create job"
          defaultCustomerId={customerId}
        />
      </CardContent>
    </Card>
  );
}
