"use client";

import React from "react";
import {
  GripVertical,
  Maximize2,
  Download,
  X,
  BarChart2,
  Activity,
  Thermometer,
  Droplets,
} from "lucide-react";
import type { WidgetLayoutItem } from "./DashboardGrid";

interface WidgetTileProps {
  widget: WidgetLayoutItem;
  isEditMode: boolean;
}

function getWidgetIcon(typeFullFqn: string) {
  if (typeFullFqn?.includes("time_series"))
    return <Activity className="h-4 w-4 text-blue-400" />;
  if (typeFullFqn?.includes("chart"))
    return <BarChart2 className="h-4 w-4 text-blue-400" />;
  if (typeFullFqn?.includes("temperature"))
    return <Thermometer className="h-4 w-4 text-orange-400" />;
  if (typeFullFqn?.includes("humidity"))
    return <Droplets className="h-4 w-4 text-cyan-400" />;
  return <BarChart2 className="h-4 w-4 text-blue-400" />;
}

export function WidgetTile({ widget, isEditMode }: WidgetTileProps) {
  const config = widget.widgetConfig?.config || {};
  const title =
    config.title ||
    widget.widgetConfig?.typeFullFqn
      ?.replace("system.", "")
      .replace(/_/g, " ") ||
    "Widget";
  const datasources = config.datasources || [];

  const dataKeys: {
    name: string;
    label: string;
    color: string;
    units?: string;
  }[] = [];
  datasources.forEach((ds: any) => {
    (ds.dataKeys || []).forEach((dk: any) => {
      dataKeys.push({
        name: dk.name,
        label: dk.label || dk.name,
        color: dk.color,
        units: dk.units,
      });
    });
  });

  return (
    <div className="group h-full w-full flex flex-col bg-white dark:bg-slate-900 rounded-md shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-shadow hover:shadow-md">
      {/* Widget Header */}
      <div
        className={`flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-700/80 bg-white dark:bg-slate-900 ${
          isEditMode
            ? "drag-handle cursor-grab active:cursor-grabbing select-none"
            : ""
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {isEditMode && (
            <GripVertical className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          )}
          {getWidgetIcon(widget.widgetConfig?.typeFullFqn)}
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-colors">
            <Download className="h-3.5 w-3.5" />
          </button>
          <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-colors">
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Widget Body - placeholder chart area */}
      <div className="flex-1 relative overflow-hidden bg-white dark:bg-slate-900/70">
        {dataKeys.length > 0 && (
          <div className="absolute top-2 left-3 flex flex-wrap gap-3 z-10">
            {dataKeys.map((dk) => (
              <div key={dk.name} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: dk.color }}
                />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {dk.label}
                  {dk.units && (
                    <span className="text-slate-400 ml-0.5">({dk.units})</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Chart placeholder with realistic empty chart look */}
        <div className="absolute inset-0 flex items-end px-4 pb-6 pt-10 gap-px">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col justify-end items-stretch"
            >
              <div className="border-r border-slate-100 dark:border-slate-800 h-full flex flex-col justify-between pb-0">
                <div className="w-full border-t border-slate-100 dark:border-slate-800" />
                <div className="w-full border-t border-slate-100 dark:border-slate-800" />
                <div className="w-full border-t border-slate-100 dark:border-slate-800" />
                <div className="w-full border-t border-slate-100 dark:border-slate-800" />
              </div>
            </div>
          ))}
        </div>

        {/* X-axis tick labels */}
        <div className="absolute bottom-1 left-4 right-4 flex justify-between">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className="text-[10px] text-slate-400 dark:text-slate-600"
            >
              {`${10 + i}:00`}
            </span>
          ))}
        </div>

        {/* "No data" hint */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-xs text-slate-300 dark:text-slate-600 italic">
            No data to display
          </span>
        </div>
      </div>
    </div>
  );
}
