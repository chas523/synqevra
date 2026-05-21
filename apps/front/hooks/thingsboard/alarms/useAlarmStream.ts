"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

import type { AlarmStreamEvent } from "@/types/alarmStream";

interface UseAlarmStreamParams {
  tenantId?: string | null;
  role?: "ADMIN" | "MODERATOR" | "USER";
  onAlarmEventAction?: (event: AlarmStreamEvent) => void;
}

interface UseAlarmStreamResult {
  isConnected: boolean;
  isSubscribed: boolean;
  isEnabled: boolean;
  lastError: string | null;
}

export function useAlarmStream({
  tenantId,
  role,
  onAlarmEventAction,
}: UseAlarmStreamParams): UseAlarmStreamResult {
  const [isConnected, setIsConnected] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const isEnabled = useMemo(
    () => Boolean(tenantId) && role !== "ADMIN",
    [tenantId, role],
  );

  useEffect(() => {
    if (!isEnabled || !tenantId) {
      return;
    }

    const proxyUrl =
      process.env.NEXT_PUBLIC_PROXY_URL || "http://206.81.28.28:30003/api";
    const wsUrl = proxyUrl.replace(/\/api\/?$/, "");

    const socket = io(`${wsUrl}/alarms`, {
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      withCredentials: true,
    });

    socketRef.current = socket;

    const subscribe = () => {
      socket.emit("subscribe-tenant-alarms", { tenantId });
    };

    socket.on("connect", () => {
      setIsConnected(true);
      setLastError(null);
      subscribe();
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      setIsSubscribed(false);
    });

    socket.on("connect_error", (error: Error) => {
      setIsConnected(false);
      setIsSubscribed(false);
      setLastError(error.message || "Alarm socket connection error");
    });

    socket.on("alarms-subscribed", () => {
      setIsSubscribed(true);
      setLastError(null);
    });

    socket.on("alarms-error", (payload: { message?: string }) => {
      setIsSubscribed(false);
      setLastError(payload?.message || "Alarm stream error");
    });

    socket.on("alarm-event", (payload: AlarmStreamEvent) => {
      onAlarmEventAction?.(payload);
    });

    return () => {
      socket.off("connect_error");
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setIsSubscribed(false);
    };
  }, [isEnabled, onAlarmEventAction, tenantId]);

  return {
    isConnected,
    isSubscribed,
    isEnabled,
    lastError,
  };
}
