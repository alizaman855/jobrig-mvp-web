import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/db";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { UserMenu } from "@/components/dashboard/user-menu";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const business = await prisma.business.findUniqueOrThrow({
    where: { id: user.businessId },
    select: { name: true },
  });

  return (
    <SidebarProvider>
      <AppSidebar role={user.role} businessName={business.name} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1" />
          <UserMenu name={user.name ?? user.email ?? "Account"} email={user.email ?? ""} />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
