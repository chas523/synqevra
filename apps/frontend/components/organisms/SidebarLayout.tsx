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
import {
  LogOutIcon,
  Moon,
  Sun,
  Loader2,
  User,
  ShieldCheck,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";
import NotificationButton from "../molecules/NotificationButton";
import { useTelemetryContext } from "@/lib/context/TelemetryContext";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch, useAppSelector } from "@/lib/redux/store";
import {
  fetchUserInformations,
  clearUser,
} from "@/lib/redux/slices/userSlice/userSlice";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const { reconnect } = useTelemetryContext();

  const pathname = usePathname();
  const { logout, isLoading } = useLogout();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const userStatus = useAppSelector((state) => state.user.status);
  const user = useAppSelector((state) => state.user.user);
  const dispatch = useAppDispatch();

  const prevPathRef = useRef(pathname);

  useEffect(() => {
    //we check if component is mounted (because useeffect only runs on client)
    setMounted(true);

    const wasAuth =
      prevPathRef.current === "/" || prevPathRef.current.includes("/auth");
    const isLoggedIn = !(pathname === "/" || pathname.includes("/auth"));

    if (wasAuth && isLoggedIn) {
      reconnect();
    }

    if (isLoggedIn && userStatus === "idle") {
      dispatch(fetchUserInformations());
    }

    prevPathRef.current = pathname;
  }, [pathname, reconnect]);

  if (!mounted)
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
          <p className="font-medium text-muted-foreground">Loading...</p>
        </div>
      </div>
    );

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const dashboardBackgroundStyle = isDark
    ? undefined
    : {
        backgroundImage:
          "linear-gradient(to bottom right, var(--wl-light-shell-from), var(--wl-light-shell-via), var(--wl-light-shell-to))",
      };

  const handleLogout = async () => {
    await logout(user?.role ?? "");
    dispatch(clearUser());
  };

  // Public routes - show header with logo
  if (
    pathname === "/" ||
    pathname.includes("/auth") ||
    pathname.includes("/dashboard/requestedUsers")
  ) {
    return (
      <div
        suppressHydrationWarning
        className="min-h-screen bg-background transition-colors"
      >
        <header className="border-b border-border bg-card/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/">
              <Image
                src={logo}
                alt="Logo"
                height={32}
                width={100}
                className="h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity dark:hidden"
                priority
                style={{ width: "auto", height: "auto" }}
              />
              <Image
                src={logoWhite}
                alt="Logo"
                height={32}
                width={100}
                className="h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity hidden dark:block"
                priority
                style={{ width: "auto", height: "auto" }}
              />
            </Link>

            <Button
              size="icon"
              variant="outline"
              className="cursor-pointer border-border bg-card/80 text-foreground hover:bg-muted"
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
    <div
      className="min-h-screen relative overflow-hidden bg-background dark:bg-linear-to-br dark:from-[#0a0f1e] dark:via-[#111827] dark:to-[#0f1419]"
      style={dashboardBackgroundStyle}
    >
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(var(--wl-light-shell-grid-rgb), 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(var(--wl-light-shell-grid-rgb), 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Animated gradient blobs */}
      <div
        className="absolute top-20 left-10 h-64 w-64 rounded-full blur-3xl animate-pulse pointer-events-none dark:bg-primary/20"
        style={
          isDark
            ? undefined
            : { backgroundColor: "var(--wl-light-shell-blob-1)" }
        }
      />
      <div
        className="absolute bottom-20 right-10 h-80 w-80 rounded-full blur-3xl animate-pulse pointer-events-none dark:bg-primary/20"
        style={
          isDark
            ? { animationDelay: "1.5s" }
            : {
                animationDelay: "1.5s",
                backgroundColor: "var(--wl-light-shell-blob-2)",
              }
        }
      />
      <div
        className="absolute top-1/2 left-1/3 w-72 h-72 dark:bg-teal-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"
        style={
          isDark
            ? { animationDelay: "3s" }
            : {
                animationDelay: "3s",
                backgroundColor: "var(--wl-light-shell-blob-3)",
              }
        }
      />

      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-transparent">
          <header className="flex h-16 shrink-0 items-center gap-2 px-4 justify-between relative z-20">
            <SidebarTrigger className="-ml-1 text-foreground transition-colors hover:text-primary" />
            <div className="flex items-center gap-3">
              {user && (
                <div className="flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 shadow-sm backdrop-blur-md transition-colors hover:bg-card">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-accent/60">
                    {user.role === "ADMIN" ? (
                      <ShieldCheck className="h-4 w-4 text-primary" />
                    ) : (
                      <User className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-col leading-tight hidden sm:flex">
                    <span className="text-sm font-semibold text-foreground">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      {user.role}
                    </span>
                  </div>
                </div>
              )}
              <NotificationButton />

              <Button
                size="icon"
                variant="outline"
                className="cursor-pointer border-border bg-card/80 text-foreground hover:bg-muted"
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
                className="cursor-pointer gap-2 bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg"
                onClick={handleLogout}
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
