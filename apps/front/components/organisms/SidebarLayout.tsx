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
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 justify-between ">
          <SidebarTrigger className="-ml-1" />
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

        <main className="flex-1 p-4 min-h-[calc(100vh-64px)] flex flex-col">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default SidebarLayout;
