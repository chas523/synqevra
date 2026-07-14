"use client";

import { useEffect, useState } from "react";
import { useTelemetryContext } from "@/lib/context/TelemetryContext";
import type {
  SystemMetricsData,
  LatestSystemMetrics,
} from "@/lib/types/telemetryTypes";

/**
 * Hook to subscribe to systemMetricsChart data from ThingsBoard.
 * Automatically requests data on connection and updates in real-time.
 */
export function useSystemMetrics() {
  const { socket, isThingsboardConnected, requestSystemMetrics } =
    useTelemetryContext();

  const [metricsHistory, setMetricsHistory] = useState<SystemMetricsData[]>([]);
  const [latestMetrics, setLatestMetrics] = useState<LatestSystemMetrics>({
    cpu: 0,
    ram: 0,
    disk: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!socket) return;

    if (isThingsboardConnected) {
      requestSystemMetrics();
    }

    const handleSystemMetrics = (data: SystemMetricsData[]) => {
      if (data.length === 0) return;

      if (data.length > 10) {
        setMetricsHistory(data);
      } else {
        setMetricsHistory((prev) => {
          const updated = [...prev, ...data];
          return updated.slice(-60);
        });
      }

      const latest = data[data.length - 1];
      setLatestMetrics({
        cpu: latest.cpu,
        ram: latest.ram,
        disk: latest.disk,
        time: latest.time,
      });

      setIsLoading(false);
    };

    socket.on("systemMetricsChart", handleSystemMetrics);

    return () => {
      socket.off("systemMetricsChart", handleSystemMetrics);
    };
  }, [socket, isThingsboardConnected, requestSystemMetrics]);

  return {
    metricsHistory,
    latestMetrics,
    isLoading,
    refresh: requestSystemMetrics,
  };
}
