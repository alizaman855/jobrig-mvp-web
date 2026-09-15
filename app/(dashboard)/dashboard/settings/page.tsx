import type { Metadata } from "next";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Settings — Jobrig" };

export default async function SettingsPage() {
  const user = await requireRole(["OWNER"]);
  const business = await prisma.business.findUniqueOrThrow({
    where: { id: user.businessId },
    select: { name: true, logoUrl: true, contactEmail: true, contactPhone: true },
  });

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Business settings</CardTitle>
        <CardDescription>
          Your business name and logo appear on the dashboard, quotes, and invoices.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SettingsForm business={business} />
      </CardContent>
    </Card>
  );
}
