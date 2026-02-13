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
  UserRoundCog,
  ShieldCheck, BellIcon,
} from "lucide-react";
import Image from "next/image";

import Link from "next/link";
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

const MENU_ITEMS = {
  admin: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/tenants", icon: Building2, label: "Tenants" },
    {
      href: "/dashboard/tenant-profiles",
      icon: PersonStanding,
      label: "Tenant Profiles"
    },
    {
      href: "/dashboard/notifications",
      icon: BellIcon,
      label: "Notification Center"
    },
    {
      href: "/settings",
      icon: Settings,
      label: "Settings",
    },
  ],
  // user: [
  //   { href: "/", icon: Home, label: "Landing Page" },
  //   { href: "/devices", icon: Settings, label: "Devices" },
  //   { href: "/patients", icon: PersonStanding, label: "Patients" },
  //   { href: "/practitioners", icon: Stethoscope, label: "Practitioners" },
  // ],
  medplum: [
    { href: "/patients", icon: PersonStanding, label: "Patients" },
    { href: "/practitioners", icon: Stethoscope, label: "Practitioners" },
  ],
};

export default function AppSidebar() {
  const [medplumEnabled] = useLocalStorage({
    key: 'medplum-enabled',
    defaultValue: false,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MENU_ITEMS.admin.map(({ href, icon: Icon, label }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild>
                    <a href={href}>
                      <Icon />
                      <span>{label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {/* Resources collapsible menu */}
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <FolderOpen />
                      <span>Resources</span>
                      <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <a href="/resources/widgets-library">
                            <span>Widgets Library</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <a href="/resources/image-gallery">
                            <span>Image gallery</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <a href="/resources/scada-symbols">
                            <span>SCADA Symbols</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <a href="/resources/javascript-library">
                            <span>JavaScript library</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <a href="/resources/resource-library">
                            <span>Resource library</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
              {/* Security collapsible menu */}
              <Collapsible className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <ShieldCheck />
                      <span>Security</span>
                      <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/security-settings">
                            <span>Security Settings</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/security/2fa">
                            <span>Two-factor authentication</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* <SidebarGroup>
          <SidebarGroupLabel>User</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MENU_ITEMS.user.map(({ href, icon: Icon, label }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild>
                    <Link href={href}>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup> */}
        {mounted && medplumEnabled && (
          <SidebarGroup>
            <SidebarGroupLabel>Medplum</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {MENU_ITEMS.medplum.map(({ href, icon: Icon, label }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton asChild>
                      <Link href={href}>
                        <Icon />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar >
  );
}
