"use client";

import { useEffect, useState } from "react";
import { useTelemetryContext } from "@/lib/context/TelemetryContext";
import type { EntityCountData, EntityCounts } from "@/lib/types/telemetryTypes";

/**
 * Hook to subscribe to entity-count data from ThingsBoard.
 * Automatically requests data on connection and listens for updates.
 */
export function useEntityCounts() {
  const { socket, isThingsboardConnected, requestEntityCount } =
    useTelemetryContext();

  const [counts, setCounts] = useState<EntityCounts>({
    tenants: 0,
    devices: 0,
    users: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!socket) return;

    const handleEntityCount = (data: EntityCountData) => {
      setCounts((prev) => {
        const updated = { ...prev };

        if (data.type === "TENANT") {
          updated.tenants = data.count;
        } else if (data.type === "DEVICE") {
          updated.devices = data.count;
        } else if (data.type === "USER") {
          updated.users = data.count;
        }

        return updated;
      });

      setIsLoading(false);
    };

    socket.on("entity-count", handleEntityCount);

    return () => {
      socket.off("entity-count", handleEntityCount);
    };
  }, [socket]);

  return {
    tenants: counts.tenants,
    devices: counts.devices,
    users: counts.users,
    isLoading,
    refresh: requestEntityCount,
  };
}
