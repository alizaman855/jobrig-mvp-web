import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { forTenant } from "@/lib/tenant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerForm } from "../../customer-form";
import { updateCustomerAction } from "../../actions";

export const metadata: Metadata = { title: "Edit customer — Jobrig" };

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireRole(["OWNER", "DISPATCHER"]);
  const customer = await forTenant({ businessId: user.businessId }).customer.findById(id);

  if (!customer) notFound();

  const boundAction = updateCustomerAction.bind(null, customer.id);

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Edit customer</CardTitle>
      </CardHeader>
      <CardContent>
        <CustomerForm action={boundAction} customer={customer} submitLabel="Save changes" />
      </CardContent>
    </Card>
  );
}
