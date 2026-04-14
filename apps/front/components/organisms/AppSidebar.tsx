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
  Box,
  Eye,
  Radio,
  Layers,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useConnectionStatus } from "@/hooks/connection/useConnectionStatus";
import { useAppSelector } from "@/lib/redux/store";

import logoDarkStatic from "@/public/logo.svg";
import logoLightStatic from "@/public/logo-white.svg";
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

const WHITELABEL_LOGO_UPDATED_EVENT = "whitelabel-logo-updated";
const WHITELABEL_LOGO_VERSION_KEY = "whitelabel-logo-version";

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
        {
          href: "/dashboard/tenant-profiles",
          icon: PersonStanding,
          label: "Tenant Profiles",
        },
        {
          href: "/dashboard/notifications",
          icon: BellIcon,
          label: "Notification Center",
        },
        {
          label: "Resources",
          icon: FolderOpen,
          items: [
            { href: "/resources/widgets-library", label: "Widgets Library" },
            { href: "/resources/image-gallery", label: "Image gallery" },
            { href: "/resources/scada-symbols", label: "SCADA Symbols" },
            {
              href: "/resources/javascript-library",
              label: "JavaScript library",
            },
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
        { href: "/dashboards", icon: LayoutDashboard, label: "Dashboards" },
        { href: "/devices", icon: Settings, label: "Devices" },
        { href: "/patients", icon: PersonStanding, label: "Patients" },
        { href: "/practitioners", icon: Stethoscope, label: "Practitioners" },
        {
          href: "/dashboard/notifications",
          icon: BellIcon,
          label: "Notification Center",
        },
        {
          label: "Entities",
          icon: Layers,
          items: [
            { href: "/entities/devices", label: "Devices", icon: Settings },
            { href: "/entities/assets", label: "Assets", icon: Box },
            {
              href: "/entities/entity-views",
              label: "Entity views",
              icon: Eye,
            },
            { href: "/entities/gateways", label: "Gateways", icon: Radio },
          ],
        },
        {
          href: "/customers",
          icon: Building2,
          label: "Customers",
        },
        {
          label: "Profiles",
          icon: PersonStanding,
          items: [
            {
              href: "/profiles/device-profiles",
              label: "Device Profiles",
              icon: Settings,
            },
            {
              href: "/profiles/asset-profiles",
              label: "Asset Profiles",
              icon: Box,
            },
          ],
        },
        {
          label: "Resources",
          icon: FolderOpen,
          items: [
            { href: "/resources/widgets-library", label: "Widgets Library" },
            { href: "/resources/image-gallery", label: "Image gallery" },
            { href: "/resources/scada-symbols", label: "SCADA Symbols" },
            {
              href: "/resources/javascript-library",
              label: "JavaScript library",
            },
            { href: "/resources/resource-library", label: "Resource library" },
          ],
        },
        {
          label: "Advanced features",
          icon: Wrench,
          items: [
            { href: "/advanced/ota-updates", label: "OTA updates", icon: Cpu },
            {
              href: "/advanced/version-control",
              label: "Version control",
              icon: History,
            },
          ],
        },
        { href: "/rulechains", icon: Layers, label: "Rulechains" },
        { href: "/settings/notifications", icon: Settings, label: "Settings" },
        {
          label: "Security",
          icon: ShieldCheck,
          items: [
            { href: "/security-settings/auditLogs", label: "Audit Logs" },
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
            <Collapsible key={item.label} className="group/collapsible">
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
                        <SidebarMenuSubButton asChild>
                          <Link href={subItem.href} prefetch={false}>
                            {subItem.icon && (
                              <subItem.icon className="h-4 w-4" />
                            )}
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
  const { hasMedplum, isLoading: isConnectionStatusLoading } =
    useConnectionStatus();

  const [imgErrorDarkTheme, setImgErrorDarkTheme] = useState<
    "none" | "tenant_failed" | "global_failed"
  >("none");
  const [imgErrorLightTheme, setImgErrorLightTheme] = useState<
    "none" | "tenant_failed" | "global_failed"
  >("none");
  const [logoVersion, setLogoVersion] = useState("0");
  const tenantId = user?.tenantId;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Reset errors if user changes
    setImgErrorDarkTheme("none");
    setImgErrorLightTheme("none");
  }, [tenantId]);

  useEffect(() => {
    // Fetch version from MinIO so all browsers (not just the uploader) see the
    // latest logo. Falls back to localStorage if the file doesn't exist yet.
    fetch("/public-assets/global/version.json", { cache: "no-store" })
      .then((r) => r.json())
      .then(({ version }: { version: string }) => {
        setLogoVersion(version);
        window.localStorage.setItem(WHITELABEL_LOGO_VERSION_KEY, version);
      })
      .catch(() => {
        const fallback =
          window.localStorage.getItem(WHITELABEL_LOGO_VERSION_KEY) || "0";
        setLogoVersion(fallback);
      });

    const onLogoUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      const nextVersion =
        customEvent.detail ||
        window.localStorage.getItem(WHITELABEL_LOGO_VERSION_KEY) ||
        Date.now().toString();
      setLogoVersion(nextVersion);
      // Reset error fallback state so the freshly uploaded tenant logo is tried again
      setImgErrorDarkTheme("none");
      setImgErrorLightTheme("none");
    };

    window.addEventListener(WHITELABEL_LOGO_UPDATED_EVENT, onLogoUpdated);

    return () => {
      window.removeEventListener(WHITELABEL_LOGO_UPDATED_EVENT, onLogoUpdated);
    };
  }, []);

  const groups =
    role === "ADMIN" ? SIDEBAR_CONFIG.ADMIN : SIDEBAR_CONFIG.OTHERS;
  const shouldShowMedplumNavigation = isConnectionStatusLoading || hasMedplum;
  const MEDPLUM_ROUTES = ["/patients", "/devices", "/practitioners"];
  const visibleGroups = groups.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (role !== "ADMIN" && item.href && MEDPLUM_ROUTES.includes(item.href)) {
        return shouldShowMedplumNavigation;
      }

      return true;
    }),
  }));

  const getLogoSrc = (theme: "dark" | "light") => {
    const errorState =
      theme === "dark" ? imgErrorDarkTheme : imgErrorLightTheme;

    // If all MinIO fetches failed, fallback to local static assets
    if (errorState === "global_failed") {
      return theme === "dark" ? logoLightStatic.src : logoDarkStatic.src;
    }

    const useTenant = tenantId && errorState !== "tenant_failed";
    const prefix = useTenant ? tenantId : "global";
    // Dark theme uses the white logo, light theme uses the dark logo
    const filename = theme === "dark" ? "logo-dark.svg" : "logo-white.svg";
    return `/public-assets/${prefix}/${filename}?v=${logoVersion}`;
  };

  const handleImageError = (theme: "dark" | "light") => {
    if (theme === "dark") {
      setImgErrorDarkTheme((prev) =>
        prev === "none" && tenantId ? "tenant_failed" : "global_failed",
      );
    } else {
      setImgErrorLightTheme((prev) =>
        prev === "none" && tenantId ? "tenant_failed" : "global_failed",
      );
    }
  };

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
                {/* Light Theme Logo */}
                <img
                  src={getLogoSrc("light")}
                  alt="Logo"
                  className="ml-2 h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity dark:hidden"
                  onError={() => handleImageError("light")}
                />
                {/* Dark Theme Logo */}
                <img
                  src={getLogoSrc("dark")}
                  alt="Logo"
                  className="ml-2 h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity hidden dark:block"
                  onError={() => handleImageError("dark")}
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {visibleGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <NavMenuItems items={group.items} />
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {mounted &&
          medplumEnabled &&
          role === "ADMIN" &&
          shouldShowMedplumNavigation && (
            <SidebarGroup>
              <SidebarGroupLabel>Medplum</SidebarGroupLabel>
              <SidebarGroupContent>
                <NavMenuItems
                  items={[
                    {
                      href: "/patients",
                      icon: PersonStanding,
                      label: "Patients",
                    },
                    {
                      href: "/practitioners",
                      icon: Stethoscope,
                      label: "Practitioners",
                    },
                  ]}
                />
              </SidebarGroupContent>
            </SidebarGroup>
          )}
      </SidebarContent>
    </Sidebar>
  );
}
