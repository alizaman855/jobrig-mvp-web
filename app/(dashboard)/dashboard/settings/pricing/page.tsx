import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Plus, SquarePen, Tags } from "lucide-react";
import { requireRole } from "@/lib/auth-guards";
import { forTenant } from "@/lib/tenant";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PricingTemplateDialog } from "./pricing-template-dialog";
import { DeleteTemplateButton } from "./delete-template-button";

export const metadata: Metadata = { title: "Pricing templates — Jobrig" };

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default async function PricingTemplatesPage() {
  const user = await requireRole(["OWNER"]);

  const templates = await forTenant({ businessId: user.businessId }).pricingTemplate.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/dashboard/settings"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Settings
      </Link>

      <Card className="max-w-2xl">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Pricing templates</CardTitle>
          </div>
          <PricingTemplateDialog
            trigger={
              <Button size="sm" className="h-9">
                <Plus className="size-4" />
                Add template
              </Button>
            }
          />
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Tags className="size-8 text-muted-foreground" />
              <p className="font-medium">No pricing templates yet</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Add line items like &quot;AC unit install — per ton&quot; so techs can add them
                to a quote in one tap.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell className="text-muted-foreground">{template.unit}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {currency.format(Number(template.unitPrice))}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <PricingTemplateDialog
                          template={{
                            id: template.id,
                            name: template.name,
                            unit: template.unit,
                            unitPrice: template.unitPrice.toString(),
                          }}
                          trigger={
                            <Button type="button" variant="ghost" size="icon-sm" aria-label={`Edit ${template.name}`}>
                              <SquarePen className="size-4" />
                            </Button>
                          }
                        />
                        <DeleteTemplateButton templateId={template.id} name={template.name} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
