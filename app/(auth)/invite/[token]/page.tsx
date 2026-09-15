import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { hashInviteToken } from "@/lib/invite-token";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AcceptInviteForm } from "./accept-invite-form";

export const metadata: Metadata = { title: "Join your team — Jobrig" };

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const tokenHash = hashInviteToken(token);

  const invitation = await prisma.invitation.findUnique({
    where: { tokenHash },
    include: { business: { select: { name: true } } },
  });

  if (!invitation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invite not found</CardTitle>
          <CardDescription>
            This invite link doesn&apos;t exist. Check the link or ask for a new invite.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const expired = invitation.expiresAt.getTime() < Date.now();
  const alreadyAccepted = invitation.acceptedAt !== null;

  if (expired || alreadyAccepted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invite link no longer valid</CardTitle>
          <CardDescription>
            {alreadyAccepted
              ? "This invite has already been used. Try logging in instead."
              : "This invite link has expired. Ask your business owner to send a new one."}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join {invitation.business.name} on Jobrig</CardTitle>
        <CardDescription>
          You&apos;ve been invited as a {invitation.role.toLowerCase()}. Set your password to
          get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AcceptInviteForm token={token} email={invitation.email} />
      </CardContent>
    </Card>
  );
}
