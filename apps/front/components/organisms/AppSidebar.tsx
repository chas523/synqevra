import { Home, PersonStanding, Settings, Stethoscope } from "lucide-react";
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
} from "../ui/sidebar";

const MENU_ITEMS = [
  { href: "/", icon: Home, label: "Landing Page" },
  { href: "/devices", icon: Settings, label: "Devices" },
  { href: "/patients", icon: PersonStanding, label: "Patients" },
  { href: "/practitioners", icon: Stethoscope, label: "Practitioners" },
  { href: "/dashboard", icon: PersonStanding, label: "Dashboard" },

  {
    href: "/dashboard/requestedUsers",
    icon: PersonStanding,
    label: "Pending Users",
  },
  {
    href: "/dashboard/activeUsers",
    icon: PersonStanding,
    label: "Active Users",
  },
  {
    href: "/settings",
    icon: Settings,
    label: "Settings",
  },
];

export default function AppSidebar() {
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
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MENU_ITEMS.map(({ href, icon: Icon, label }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild>
                    <a href={href}>
                      <Icon />
                      <span>{label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
