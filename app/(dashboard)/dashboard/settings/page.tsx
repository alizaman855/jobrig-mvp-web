import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, MessageSquareText, Tags } from "lucide-react";
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
    select: {
      name: true,
      logoUrl: true,
      contactEmail: true,
      contactPhone: true,
      googleReviewUrl: true,
    },
  });

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <Card>
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

      <Link href="/dashboard/settings/pricing">
        <Card className="transition-colors hover:bg-muted/50">
          <CardContent className="flex items-center gap-3 py-4">
            <Tags className="size-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">Pricing templates</p>
              <p className="text-sm text-muted-foreground">
                Line items techs can add to a quote in one tap.
              </p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>

      <Link href="/dashboard/reviews">
        <Card className="transition-colors hover:bg-muted/50">
          <CardContent className="flex items-center gap-3 py-4">
            <MessageSquareText className="size-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">Review requests</p>
              <p className="text-sm text-muted-foreground">
                See every review request sent and its delivery status.
              </p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
