import { Home, PersonStanding, Settings, Stethoscope } from "lucide-react";
import Image from "next/image";

import Link from "next/link";
import logo from "@/public/logo-white.svg";
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
];

export default function AppSidebar() {
  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      className=" bg-slate-900/30 shadow-lg shadow-blue-500/10"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <Image
                  src={logo}
                  alt="Logo"
                  height={32}
                  width={100}
                  className="ml-2 h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity"
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
