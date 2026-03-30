"use client";

import React, { useState, useCallback, useMemo } from "react";
import useSWR from "swr";
import { DashboardService } from "@/lib/services/thingsboardServices/dashboardService";
import { DashboardGrid, WidgetLayoutItem } from "@/components/organisms/dashboard/DashboardGrid";
import { Layout } from "react-grid-layout";
import {
  ArrowLeft,
  Edit2,
  Save,
  X,
  Loader2,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DashboardDetailPageProps {
  dashboardId: string;
}

export function DashboardDetailPage({ dashboardId }: DashboardDetailPageProps) {
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingLayout, setPendingLayout] = useState<Layout | null>(null);

  const { data: dashboard, isLoading, mutate } = useSWR(
    dashboardId ? ["dashboard", dashboardId] : null,
    () => DashboardService.getDashboardById(dashboardId),
  );

  const defaultState = dashboard?.configuration?.states?.default;
  const mainLayout = defaultState?.layouts?.main;
  const gridSettings = mainLayout?.gridSettings || {};
  const columns = gridSettings.columns || 24;
  const margin = gridSettings.margin ?? 10;
  const backgroundColor = gridSettings.backgroundColor || "#eeeeee";

  const widgetsConfig = dashboard?.configuration?.widgets || {};
  const layoutWidgets = mainLayout?.widgets || {};

  const widgets: WidgetLayoutItem[] = useMemo(() => {
    return Object.entries(layoutWidgets).map(([id, pos]: [string, any]) => ({
      id,
      sizeX: pos.sizeX,
      sizeY: pos.sizeY,
      row: pos.row,
      col: pos.col,
      widgetConfig: widgetsConfig[id] || null,
    }));
  }, [layoutWidgets, widgetsConfig]);

  const handleLayoutChange = useCallback((layout: Layout) => {
    setPendingLayout(layout);
  }, []);

  const handleSave = async () => {
    if (!dashboard || !pendingLayout) return;
    setIsSaving(true);

    try {
      const updatedWidgets: Record<string, any> = {};
      pendingLayout.forEach((item) => {
        const original = layoutWidgets[item.i] || {};
        updatedWidgets[item.i] = {
          ...original,
          sizeX: item.w,
          sizeY: item.h,
          row: item.y,
          col: item.x,
        };
      });

      const updatedDashboard = {
        ...dashboard,
        configuration: {
          ...dashboard.configuration,
          states: {
            ...dashboard.configuration?.states,
            default: {
              ...defaultState,
              layouts: {
                ...defaultState?.layouts,
                main: {
                  ...mainLayout,
                  widgets: updatedWidgets,
                },
              },
            },
          },
        },
      };

      await DashboardService.saveDashboard(updatedDashboard);
      toast.success("Dashboard layout saved");
      mutate();
      setIsEditMode(false);
      setPendingLayout(null);
    } catch {
      toast.error("Failed to save dashboard layout");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setPendingLayout(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="text-sm text-slate-500">Loading dashboard…</span>
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
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboards")}>
            Go back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-950 overflow-hidden">
      {/* Top bar */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-20">
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
          </div>
          {isEditMode && (
            <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-medium">
              Edit mode
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isEditMode ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="text-slate-500 dark:text-slate-400 gap-1.5"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving || !pendingLayout}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save layout
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditMode(true)}
              className="gap-1.5 text-slate-600 dark:text-slate-300"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </header>

      {/* Grid canvas — scroll is handled inside DashboardGrid */}
      <main className="flex-1 min-h-0">
        {widgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <LayoutDashboard className="h-8 w-8 text-slate-400" />
            </div>
            <div>
              <p className="font-medium text-slate-600 dark:text-slate-300">
                This dashboard is empty
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                Widgets added in ThingsBoard will appear here
              </p>
            </div>
          </div>
        ) : (
          <DashboardGrid
            widgets={widgets}
            columns={columns}
            margin={margin}
            backgroundColor={backgroundColor}
            isEditMode={isEditMode}
            totalRows={18}
            onLayoutChange={handleLayoutChange}
          />
        )}
      </main>
    </div>
  );
}
