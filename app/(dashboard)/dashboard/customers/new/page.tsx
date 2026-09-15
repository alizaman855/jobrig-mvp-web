import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerForm } from "../customer-form";
import { createCustomerAction } from "../actions";

export const metadata: Metadata = { title: "Add customer — Jobrig" };

export default function NewCustomerPage() {
  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Add customer</CardTitle>
      </CardHeader>
      <CardContent>
        <CustomerForm action={createCustomerAction} submitLabel="Add customer" />
      </CardContent>
    </Card>
  );
}
