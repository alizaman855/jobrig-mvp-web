"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  ClipboardList,
  LayoutDashboard,
  Receipt,
  Settings,
  Users,
  UsersRound,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { Role } from "@/lib/generated/prisma/client.ts";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: Role[];
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/dashboard/jobs",
    label: "Jobs",
    icon: Briefcase,
    roles: ["OWNER", "DISPATCHER"],
  },
  {
    href: "/dashboard/customers",
    label: "Customers",
    icon: UsersRound,
    roles: ["OWNER", "DISPATCHER"],
  },
  {
    href: "/dashboard/invoices",
    label: "Invoices",
    icon: Receipt,
    roles: ["OWNER", "DISPATCHER"],
  },
  {
    href: "/dashboard/my-jobs",
    label: "My Jobs",
    icon: ClipboardList,
    roles: ["TECH"],
  },
  { href: "/dashboard/team", label: "Team", icon: Users, roles: ["OWNER"] },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, roles: ["OWNER"] },
];

export function AppSidebar({
  role,
  businessName,
  logoUrl,
}: {
  role: Role;
  businessName: string;
  logoUrl?: string | null;
}) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={businessName}
              className="size-7 shrink-0 rounded-md object-cover"
            />
          ) : (
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">
              {businessName.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="truncate text-sm font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            {businessName}
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role)).map(
                (item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={
                        item.href === "/dashboard"
                          ? pathname === item.href
                          : pathname.startsWith(item.href)
                      }
                      tooltip={item.label}
                    >
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
