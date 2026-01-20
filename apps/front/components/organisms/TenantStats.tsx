"use client";

import React from "react";
import { StatCard } from "../molecules/StatCard";
import TileTemplate from "../templates/TileTemplate";
import { useEntityCounts } from "@/hooks/thingsboard/dashboard/useEntityCounts";

export function TenantStats() {
  const { tenants, devices, isLoading } = useEntityCounts();

  return (
    <>
      <TileTemplate colSpan={2} rowSpan={2}>
        <StatCard
          label="Tenants"
          value={isLoading ? "..." : tenants}
          addButton
          className="h-full"
        />
      </TileTemplate>
      <TileTemplate colSpan={2} rowSpan={2}>
        <StatCard
          label="Devices"
          value={isLoading ? "..." : devices}
          addButton
          className="h-full"
        />
      </TileTemplate>
    </>
  );
}
