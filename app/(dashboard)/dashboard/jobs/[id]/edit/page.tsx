import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { forTenant } from "@/lib/tenant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JobForm } from "../../job-form";
import { updateJobAction } from "../../actions";
import { getTechCandidates } from "../../get-tech-candidates";

export const metadata: Metadata = { title: "Edit job — Jobrig" };

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireRole(["OWNER", "DISPATCHER"]);
  const db = forTenant({ businessId: user.businessId });

  const [job, customers, techs] = await Promise.all([
    db.job.findById(id),
    db.customer.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, address: true } }),
    getTechCandidates(user.businessId, id),
  ]);

  if (!job) notFound();

  const boundAction = updateJobAction.bind(null, job.id);

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Edit job</CardTitle>
      </CardHeader>
      <CardContent>
        <JobForm action={boundAction} customers={customers} techs={techs} submitLabel="Save changes" job={job} />
      </CardContent>
    </Card>
  );
}
