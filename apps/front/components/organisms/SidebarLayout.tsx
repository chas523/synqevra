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
        className="absolute top-20 left-10 w-64 h-64 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse pointer-events-none"
        style={
          isDark
            ? undefined
            : { backgroundColor: "var(--wl-light-shell-blob-1)" }
        }
      />
      <div
        className="absolute bottom-20 right-10 w-80 h-80 dark:bg-cyan-500/20 rounded-full blur-3xl animate-pulse pointer-events-none"
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
            <SidebarTrigger className="-ml-1 text-slate-700 dark:text-white hover:text-slate-900 dark:hover:text-black" />
            <div className="flex items-center gap-3">
              {user && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 backdrop-blur-md shadow-sm transition-all hover:bg-white/60 dark:hover:bg-white/10">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-linear-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                    {user.role === "ADMIN" ? (
                      <ShieldCheck className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    ) : (
                      <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div className="flex-col leading-tight hidden sm:flex">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-cyan-600 dark:text-cyan-500/80">
                      {user.role}
                    </span>
                  </div>
                </div>
              )}
              <NotificationButton />

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
