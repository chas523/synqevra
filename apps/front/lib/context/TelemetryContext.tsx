"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";

interface TelemetryContextType {
  socket: Socket | null;
  isConnected: boolean;
  isThingsboardConnected: boolean;
  requestEntityCount: () => void;
  requestSystemMetrics: () => void;
}

const TelemetryContext = createContext<TelemetryContextType | null>(null);

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isThingsboardConnected, setIsThingsboardConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const hasRequestedEntityCount = useRef(false);
  const hasRequestedSystemMetrics = useRef(false);
  const hasRequestedMsgCount = useRef(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) {
      return;
    }

    isInitialized.current = true;

    const proxyUrl =
      process.env.NEXT_PUBLIC_PROXY_URL || "http://167.172.178.76:30003/api";
    const wsUrl = proxyUrl.replace(/\/api\/?$/, "");

    console.log("connecting websocket to:", `${wsUrl}/telemetry`);

    const socket = io(`${wsUrl}/telemetry`, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("connected to backend socket.io");
      setIsConnected(true);
      socket.emit("connect-thingsboard");
    });

    socket.on("disconnect", () => {
      console.log("disconnected from backend");
      setIsConnected(false);
      setIsThingsboardConnected(false);
    });

    socket.on("thingsboard-connected", () => {
      console.log("thingsboard connected");
      setIsThingsboardConnected(true);

      if (!hasRequestedEntityCount.current) {
        socket.emit("entity-count");
        hasRequestedEntityCount.current = true;
      }

      if (!hasRequestedSystemMetrics.current) {
        socket.emit("systemMetricsChart");
        hasRequestedSystemMetrics.current = true;
      }
      if (!hasRequestedMsgCount.current) {
        socket.emit("transportMsgCountHourly");
        hasRequestedSystemMetrics.current = true;
      }
    });

    socket.on("thingsboard-disconnected", () => {
      console.log("thingsboard disconnected");
      setIsThingsboardConnected(false);
      hasRequestedEntityCount.current = false;
      hasRequestedSystemMetrics.current = false;
    });

    socket.on("thingsboard-error", (data: { message: string }) => {
      console.error("thingsboard error:", data.message);
    });

    socket.on(
      "commands-sent",
      (data: { success: boolean; topic: string; count: number }) => {
        console.log(`commands sent: ${data.topic} (${data.count})`);
      }
    );

    socket.on("error", (data: { message: string; topic?: string }) => {
      console.error(`error ${data.topic || "websocket"}:`, data.message);
    });

    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, []);

  const requestEntityCount = () => {
    if (socketRef.current && isThingsboardConnected) {
      if (hasRequestedEntityCount.current) {
        return;
      }

      socketRef.current.emit("entity-count");
      hasRequestedEntityCount.current = true;
    }
  };

  const requestSystemMetrics = () => {
    if (socketRef.current && isThingsboardConnected) {
      if (hasRequestedSystemMetrics.current) {
        return;
      }

      socketRef.current.emit("systemMetricsChart");
      hasRequestedSystemMetrics.current = true;
    }
  };

  return (
    <TelemetryContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        isThingsboardConnected,
        requestEntityCount,
        requestSystemMetrics,
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetryContext() {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error(
      "useTelemetryContext must be used within TelemetryProvider."
    );
  }
  return context;
}
