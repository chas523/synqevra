"use client";

import React, { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { DashboardService } from "@/lib/services/thingsboardServices/dashboardService";
import { ArrowLeft, Loader2, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";

interface DashboardDetailPageProps {
  dashboardId: string;
}

export function DashboardDetailPage({ dashboardId }: DashboardDetailPageProps) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const { data: dashboard, isLoading: isLoadingDashboard } = useSWR(
    dashboardId ? ["dashboard", dashboardId] : null,
    () => DashboardService.getDashboardById(dashboardId),
  );

  const { data: tokenData, isLoading: isLoadingToken } = useSWR(
    "embed-token",
    () => DashboardService.getEmbedToken(),
  );

  useEffect(() => {
    if (iframeLoaded && tokenData?.jwtToken && iframeRef.current) {
      // We pass the JWT token to the bridge, and the URL to redirect to right after storing it.
      // Append hideToolbar if TB supports it, but we also clip it visually.
      const targetUrl = `/dashboards/${dashboardId}?hideToolbar=true`;

      console.log("Sending postMessage to iframe bridge...");
      iframeRef.current.contentWindow?.postMessage(
        {
          jwtToken: tokenData.jwtToken,
          redirect: targetUrl,
        },
        "http://localhost:3002",
      );
    }
  }, [iframeLoaded, tokenData, dashboardId]);

  const isLoading = isLoadingDashboard || isLoadingToken;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="text-sm text-slate-500">
            Loading dashboard environment...
          </span>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4 text-center max-w-xs">
          <LayoutDashboard className="h-12 w-12 text-slate-300" />
          <p className="text-sm text-slate-500">Dashboard not found.</p>
          <button
            className="border px-4 py-2 rounded-md text-sm hover:bg-slate-100"
            onClick={() => router.push("/dashboards")}
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-950 overflow-hidden">
      {/* Top bar */}
      <header className="shrink-0 flex items-center justify-between px-4 h-14 bg-background dark:bg-slate-900 border-b border-border dark:border-slate-800 shadow-sm z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboards")}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4 text-slate-400" />
            <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
              {dashboard.title || dashboard.name}
            </span>
            <span className="text-xs ml-2 bg-primary/10 dark:bg-blue-900/30 text-primary dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">
              Live Proxy
            </span>
          </div>
        </div>
      </header>

      {/* Frame Container */}
      <main className="flex-1 overflow-hidden relative bg-slate-200 dark:bg-slate-800">
        {/* We use negative margins & extra height to "clip" the top toolbar and prevent scrolling if needed */}
        <div className="absolute inset-0 overflow-hidden">
          <iframe
            ref={iframeRef}
            src="http://localhost:3002/bridge.html"
            className="absolute top-0 left-0 w-full h-full"
            style={{
              border: "none",
              pointerEvents: "auto",
            }}
            onLoad={() => setIframeLoaded(true)}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>

        {/* Invisible overlay over the edges to prevent user from dragging to reveal hidden parts if necessary */}
        <div className="absolute top-0 left-0 right-0 h-1.25 bg-slate-100 dark:bg-slate-950 z-10 pointer-events-none" />
      </main>
    </div>
  );
}
