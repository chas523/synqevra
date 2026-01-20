"use client";

import React from "react";
import { SystemMetricCard } from "../molecules/SystemMetricCard";
import TileTemplate from "../templates/TileTemplate";
import { useSystemMetrics } from "@/hooks/thingsboard/dashboard/useSystemMetrics";

// Stałe wartości dla cores i total (nie zmieniają się dynamicznie)
const SYSTEM_INFO = {
  cpu: { cores: 8 },
  memory: { total: "7 Gb" },
  disk: { total: "1007 Gb" },
};

export function ResourceUsageStats() {
  const { latestMetrics, isLoading } = useSystemMetrics();

  return (
    <>
      <TileTemplate colSpan={2} rowSpan={2}>
        <SystemMetricCard
          label="CPU (Processor)"
          value={isLoading ? "..." : `${latestMetrics.cpu}%`}
          subtitle={`| ${SYSTEM_INFO.cpu.cores} cores`}
          checked
          className="h-full"
        />
      </TileTemplate>
      <TileTemplate colSpan={2} rowSpan={2}>
        <SystemMetricCard
          label="Memory (RAM)"
          value={isLoading ? "..." : `${latestMetrics.ram}%`}
          subtitle={`| ${SYSTEM_INFO.memory.total}`}
          checked
          className="h-full"
        />
      </TileTemplate>
      <TileTemplate colSpan={2} rowSpan={2}>
        <SystemMetricCard
          label="Disk"
          value={isLoading ? "..." : `${latestMetrics.disk}%`}
          subtitle={`| ${SYSTEM_INFO.disk.total}`}
          checked
          className="h-full"
        />
      </TileTemplate>
    </>
  );
}
