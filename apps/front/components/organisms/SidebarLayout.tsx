"use client";
import { usePathname } from "next/navigation";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import AppSidebar from "./AppSidebar";
import Image from "next/image";
import Link from "next/link";
import logo from "@/public/logo.svg";
import { useLogout } from "@/hooks/auth/useAuth";
import { Button } from "../ui/button";
import { LogOutIcon } from "lucide-react";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const pathname = usePathname();
  const { logout, isLoading, error, success } = useLogout();

  // Public routes - show header with logo
  if (pathname === "/" || pathname.includes("/auth")) {
    return (
      <>
        <header>
          <div className="container mx-auto px-4 py-4 flex items-center">
            <Link href="/">
              <Image
                src={logo}
                alt="Logo"
                height={32}
                width={100}
                className="h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
          </div>
        </header>
        <main className="min-h-[calc(100vh-64px)] flex flex-col">
          {children}
        </main>
      </>
    );
  }

  // Dashboard routes - show sidebar with header
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0a0f1e] via-[#111827] to-[#0f1419]">
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
      <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div
        className="absolute bottom-20 right-10 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse pointer-events-none"
        style={{ animationDelay: "1.5s" }}
      />
      <div
        className="absolute top-1/2 left-1/3 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"
        style={{ animationDelay: "3s" }}
      />

      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-transparent">
          <header className="flex h-16 shrink-0 items-center gap-2 px-4 justify-between relative z-10">
            <SidebarTrigger className="-ml-1 text-white hover:text-black" />
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
