"use client";

import { useEffect, useState } from "react";
import { useLocalStorage } from "@mantine/hooks";
import {
  Building2,
  ChevronDown,
  FolderOpen,
  Home,
  LayoutDashboard,
  PersonStanding,
  Settings,
  Stethoscope,
  ShieldCheck,
  BellIcon,
  Cpu,
  History,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAppSelector } from "@/lib/redux/store";

import logoDark from "@/public/logo.svg";
import logoLight from "@/public/logo-white.svg";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "../ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface NavItem {
  label: string;
  href?: string;
  icon?: any;
  items?: { label: string; href: string; icon?: any }[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const SIDEBAR_CONFIG: Record<string, NavGroup[]> = {
  ADMIN: [
    {
      label: "Admin",
      items: [
        { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/dashboard/tenants", icon: Building2, label: "Tenants" },
        { href: "/dashboard/tenant-profiles", icon: PersonStanding, label: "Tenant Profiles" },
        { href: "/dashboard/notifications", icon: BellIcon, label: "Notification Center" },
        {
          label: "Resources",
          icon: FolderOpen,
          items: [
            { href: "/resources/widgets-library", label: "Widgets Library" },
            { href: "/resources/image-gallery", label: "Image gallery" },
            { href: "/resources/scada-symbols", label: "SCADA Symbols" },
            { href: "/resources/javascript-library", label: "JavaScript library" },
            { href: "/resources/resource-library", label: "Resource library" },
          ],
        },
        {
          label: "Security",
          icon: ShieldCheck,
          items: [
            { href: "/security-settings", label: "Security Settings" },
            { href: "/security/2fa", label: "Two-factor authentication" },
            { href: "/security-settings/oauth2/domains", label: "OAuth 2.0" },
          ],
        },
        { href: "/settings", icon: Settings, label: "Settings" },
      ],
    },
  ],
  OTHERS: [
    {
      label: "User",
      items: [
        { href: "/", icon: Home, label: "Landing Page" },
        { href: "/devices", icon: Settings, label: "Devices" },
        { href: "/patients", icon: PersonStanding, label: "Patients" },
        { href: "/practitioners", icon: Stethoscope, label: "Practitioners" },
        { href: "/dashboard/notifications", icon: BellIcon, label: "Notification Center" },
        {
          label: "Resources",
          icon: FolderOpen,
          items: [
            { href: "/resources/widgets-library", label: "Widgets Library" },
            { href: "/resources/image-gallery", label: "Image gallery" },
            { href: "/resources/scada-symbols", label: "SCADA Symbols" },
            { href: "/resources/javascript-library", label: "JavaScript library" },
            { href: "/resources/resource-library", label: "Resource library" },
          ],
        },
        {
          label: "Advanced features",
          icon: Wrench,
          items: [
            { href: "/advanced/ota-updates", label: "OTA updates", icon: Cpu },
            { href: "/advanced/version-control", label: "Version control", icon: History },
          ],
        },
        { href: "/settings/notifications", icon: Settings, label: "Settings" },
        {
          label: "Security",
          icon: ShieldCheck,
          items: [
            { href: "/security-settings/auditLogs", label: "Audit Logs" },
            { href: "/security-settings/oauth2/clients", label: "OAuth 2.0" },
          ],
        },
      ],
    },
  ],
};

const NavMenuItems = ({ items }: { items: NavItem[] }) => {
  return (
    <SidebarMenu>
      {items.map((item) => {
        if (item.items) {
          return (
            <Collapsible
              key={item.label}
              className="group/collapsible"
              defaultOpen={item.label === "Resources"}
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton>
                    {item.icon && <item.icon />}
                    <span>{item.label}</span>
                    <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.href}>
                        <SidebarMenuSubButton asChild >
                          <Link href={subItem.href} prefetch={false}>
                            {subItem.icon && <subItem.icon className="h-4 w-4" />}
                            <span>{subItem.label}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        }

        return (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton asChild>
              <Link href={item.href!} prefetch={false}>
                {item.icon && <item.icon />}
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
};

export default function AppSidebar() {
  const [medplumEnabled] = useLocalStorage({
    key: "medplum-enabled",
    defaultValue: false,
  });
  const [mounted, setMounted] = useState(false);
  const user = useAppSelector((state) => state.user.user);
  const role = user?.role;

  useEffect(() => {
    setMounted(true);
  }, []);

  const groups = role === "ADMIN" ? SIDEBAR_CONFIG.ADMIN : SIDEBAR_CONFIG.OTHERS;

  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      className=" bg-transparent dark:bg-slate-900/30 shadow-lg shadow-slate-500/10 dark:shadow-blue-500/10"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <Image
                  src={logoDark}
                  alt="Logo"
                  height={32}
                  width={100}
                  className="ml-2 h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity dark:hidden"
                />
                <Image
                  src={logoLight}
                  alt="Logo"
                  height={32}
                  width={100}
                  className="ml-2 h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity hidden dark:block"
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <NavMenuItems items={group.items} />
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {mounted && medplumEnabled && role === "ADMIN" && (
          <SidebarGroup>
            <SidebarGroupLabel>Medplum</SidebarGroupLabel>
            <SidebarGroupContent>
              <NavMenuItems
                items={[
                  { href: "/patients", icon: PersonStanding, label: "Patients" },
                  { href: "/practitioners", icon: Stethoscope, label: "Practitioners" },
                ]}
              />
            </SidebarGroupContent>
          </SidebarGroup>
        )}

      </SidebarContent>
    </Sidebar>
  );
}

