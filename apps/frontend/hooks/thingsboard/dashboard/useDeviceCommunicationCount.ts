"use client";

import { useEffect, useState } from "react";
import { useTelemetryContext } from "@/lib/context/TelemetryContext";
import {
  SystemMetricsData,
  LatestSystemMetrics,
  MsgCount,
} from "@/lib/types/telemetryTypes";

/**
 * Hook to subscribe to transportMsgCountHourly data from ThingsBoard.
 * Automatically requests data on connection and updates in real-time.
 */
export function useDeviceCommunicationCount() {
  const { socket, isThingsboardConnected, requestMsgCount } =
    useTelemetryContext();

  const [metricsHistory, setMetricsHistory] = useState<MsgCount[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!socket) return;

    if (isThingsboardConnected) {
      requestMsgCount();
    }

    const handleSystemMetrics = (data: MsgCount[]) => {
      if (data.length === 0) return;

      if (data.length > 10) {
        setMetricsHistory(data);
      } else {
        setMetricsHistory((prev) => {
          const updated = [...prev, ...data];
          return updated.slice(-30);
        });
      }

      setIsLoading(false);
    };

    socket.on("transportMsgCountHourly", handleSystemMetrics);

    return () => {
      socket.off("transportMsgCountHourly", handleSystemMetrics);
    };
  }, [socket, isThingsboardConnected, requestMsgCount]);

  return {
    metricsHistory,
    isLoading,
  };
}
