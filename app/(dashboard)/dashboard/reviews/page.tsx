import type { Metadata } from "next";
import { MessageSquareText } from "lucide-react";
import { requireRole } from "@/lib/auth-guards";
import { forTenant } from "@/lib/tenant";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "Review requests — Jobrig" };

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });

function statusVariant(status: string) {
  if (status === "SENT" || status === "DELIVERED") return "default" as const;
  if (status === "FAILED") return "outline" as const;
  return "secondary" as const;
}

export default async function ReviewsPage() {
  const user = await requireRole(["OWNER"]);

  const requests = await forTenant({ businessId: user.businessId }).reviewRequest.findMany({
    include: { customer: { select: { name: true } }, job: { select: { serviceType: true } } },
    orderBy: { createdAt: "desc" },
  });

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
          <MessageSquareText className="size-8 text-muted-foreground" />
          <p className="font-medium">No review requests yet</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Marking an invoice paid automatically sends one, once a Google Review link is set in
            Settings.
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
              <TableHead>Status</TableHead>
              <TableHead>Sent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.customer.name}</TableCell>
                <TableCell className="text-muted-foreground">{request.job.serviceType}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(request.status)}>{request.status}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {request.sentAt ? dateFormatter.format(request.sentAt) : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
