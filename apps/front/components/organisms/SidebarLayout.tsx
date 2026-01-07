"use client";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import AppSidebar from "./AppSidebar";
import Link from "next/link";
import logo from "@/public/logo.svg";
import logoWhite from "@/public/logo-white.svg";
import { useLogout } from "@/hooks/auth/useAuth";
import { Button } from "../ui/button";
import { LogOutIcon, Moon, Sun, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();
  const { logout, isLoading, error, success } = useLogout();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  //we check if component is mounted (because useeffect only runs on client)
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted)
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Loader2 className="w-10 h-10 text-cyan-500 dark:text-cyan-400 animate-spin" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Loading...
          </p>
        </div>
      </div>
    );

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  // Public routes - show header with logo
  if (pathname === "/" || pathname.includes("/auth")) {
    return (
      <div
        suppressHydrationWarning
        className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors"
      >
        <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/">
              <Image
                src={logo}
                alt="Logo"
                height={32}
                width={100}
                className="h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity dark:hidden"
              />
              <Image
                src={logoWhite}
                alt="Logo"
                height={32}
                width={100}
                className="h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity hidden dark:block"
              />
            </Link>
            <Button
              size="icon"
              variant="outline"
              className="cursor-pointer bg-white/80 dark:bg-white/10 border-slate-200 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/20 text-slate-700 dark:text-white"
              onClick={toggleTheme}
            >
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </header>
        <main className="min-h-[calc(100vh-64px)] flex flex-col">
          {children}
        </main>
      </div>
    );
  }

  // Dashboard routes - show sidebar with header
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-[#0a0f1e] dark:via-[#111827] dark:to-[#0f1419]">
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Animated gradient blobs */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200/40 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div
        className="absolute bottom-20 right-10 w-80 h-80 bg-cyan-200/40 dark:bg-cyan-500/20 rounded-full blur-3xl animate-pulse pointer-events-none"
        style={{ animationDelay: "1.5s" }}
      />
      <div
        className="absolute top-1/2 left-1/3 w-72 h-72 bg-teal-200/30 dark:bg-teal-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"
        style={{ animationDelay: "3s" }}
      />

      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-transparent">
          <header className="flex h-16 shrink-0 items-center gap-2 px-4 justify-between relative z-10">
            <SidebarTrigger className="-ml-1 text-slate-700 dark:text-white hover:text-slate-900 dark:hover:text-black" />
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="outline"
                className="cursor-pointer bg-white/80 dark:bg-white/10 border-slate-200 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/20 text-slate-700 dark:text-white"
                onClick={toggleTheme}
              >
                {isDark ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              <Button
                size="lg"
                className="cursor-pointer gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md hover:shadow-lg"
                onClick={logout}
              >
                {isLoading ? (
                  "Logging out "
                ) : (
                  <>
                    <LogOutIcon className="h-5 w-5" />
                    <span>Logout</span>
                  </>
                )}
              </Button>
            </div>
          </header>

          <main className="flex-1 p-4 min-h-[calc(100vh-64px)] flex flex-col relative z-10 bg-transparent">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export default SidebarLayout;
