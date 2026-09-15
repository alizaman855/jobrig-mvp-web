import type { Metadata } from "next";
import { requireRole } from "@/lib/auth-guards";
import { forTenant } from "@/lib/tenant";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InviteForm } from "./invite-form";

export const metadata: Metadata = { title: "Team — Jobrig" };

function roleBadgeVariant(role: string) {
  if (role === "OWNER") return "default" as const;
  if (role === "DISPATCHER") return "secondary" as const;
  return "outline" as const;
}

export default async function TeamPage() {
  const user = await requireRole(["OWNER"]);
  const db = forTenant({ businessId: user.businessId });

  const [users, invitations] = await Promise.all([
    db.user.findMany({ orderBy: { createdAt: "asc" } }),
    db.invitation.findMany({
      where: { acceptedAt: null },
      orderBy: { createdAt: "desc" },
      include: { invitedBy: { select: { name: true } } },
    }),
  ]);

  const now = Date.now();

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Invite a technician</CardTitle>
          <CardDescription>
            Send an invite link — they&apos;ll set their own password to join.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team members</CardTitle>
          <CardDescription>{users.length} people on this account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell className="text-muted-foreground">{member.email}</TableCell>
                  <TableCell>
                    <Badge variant={roleBadgeVariant(member.role)}>{member.role}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {invitations.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Pending invites</CardTitle>
            <CardDescription>Not yet accepted.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Invited by</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invite) => {
                  const expired = invite.expiresAt.getTime() < now;
                  return (
                    <TableRow key={invite.id}>
                      <TableCell className="font-medium">{invite.email}</TableCell>
                      <TableCell>
                        <Badge variant={roleBadgeVariant(invite.role)}>{invite.role}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {invite.invitedBy.name}
                      </TableCell>
                      <TableCell>
                        {expired ? (
                          <Badge variant="outline" className="text-muted-foreground">
                            Expired
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
