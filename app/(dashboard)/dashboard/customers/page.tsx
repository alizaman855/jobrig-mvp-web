import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Plus, Users } from "lucide-react";
import { requireRole } from "@/lib/auth-guards";
import { forTenant } from "@/lib/tenant";
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
import { SearchInput } from "@/components/dashboard/search-input";

export const metadata: Metadata = { title: "Customers — Jobrig" };

async function CustomerList({ q }: { q: string }) {
  const user = await requireRole(["OWNER", "DISPATCHER"]);

  const customers = await forTenant({ businessId: user.businessId }).customer.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { name: "asc" },
  });

  if (customers.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
          <Users className="size-8 text-muted-foreground" />
          <p className="font-medium">{q ? "No customers match your search" : "No customers yet"}</p>
          <p className="text-sm text-muted-foreground">
            {q ? "Try a different name, phone, or email." : "Add your first customer to get started."}
          </p>
          {!q ? (
            <Button render={<Link href="/dashboard/customers/new" />} nativeButton={false} className="mt-2 h-9">
              <Plus className="size-4" />
              Add customer
            </Button>
          ) : null}
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
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id} className="cursor-pointer">
                <TableCell className="font-medium">
                  <Link href={`/dashboard/customers/${customer.id}`} className="block">
                    {customer.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{customer.phone}</TableCell>
                <TableCell className="text-muted-foreground">{customer.email ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{customer.address}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput placeholder="Search customers…" />
        <Button render={<Link href="/dashboard/customers/new" />} nativeButton={false} className="h-10 shrink-0">
          <Plus className="size-4" />
          Add customer
        </Button>
      </div>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <CustomerList q={q} />
      </Suspense>
    </div>
  );
}
