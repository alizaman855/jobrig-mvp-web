import type { Metadata } from "next";
import Link from "next/link";
import { Receipt } from "lucide-react";
import { requireRole } from "@/lib/auth-guards";
import { forTenant } from "@/lib/tenant";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MarkPaidDialog } from "./mark-paid-dialog";

export const metadata: Metadata = { title: "Invoices — Jobrig" };

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export default async function InvoicesPage() {
  const user = await requireRole(["OWNER", "DISPATCHER"]);

  const invoices = await forTenant({ businessId: user.businessId }).invoice.findMany({
    include: {
      customer: { select: { name: true } },
      job: { select: { serviceType: true, id: true } },
      quote: { select: { lineItems: { select: { id: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
          <Receipt className="size-8 text-muted-foreground" />
          <p className="font-medium">No invoices yet</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Completing a job with a signed quote automatically creates an invoice here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Job</TableHead>
              <TableHead>Line items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead className="w-32" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.customer.name}</TableCell>
                <TableCell>
                  <Link
                    href={`/dashboard/jobs/${invoice.job.id}`}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {invoice.job.serviceType}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {invoice.quote?.lineItems.length ?? 0} item
                  {(invoice.quote?.lineItems.length ?? 0) === 1 ? "" : "s"}
                </TableCell>
                <TableCell className="font-medium">{currency.format(Number(invoice.total))}</TableCell>
                <TableCell>
                  <Badge variant={invoice.status === "PAID" ? "default" : "outline"}>
                    {invoice.status}
                    {invoice.status === "PAID" && invoice.paymentMethod ? ` · ${invoice.paymentMethod}` : ""}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {invoice.paidAt ? dateFormatter.format(invoice.paidAt) : "—"}
                </TableCell>
                <TableCell>
                  {invoice.status === "UNPAID" ? (
                    <MarkPaidDialog
                      invoiceId={invoice.id}
                      trigger={
                        <Button type="button" size="sm" className="h-8">
                          Mark paid
                        </Button>
                      }
                    />
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
