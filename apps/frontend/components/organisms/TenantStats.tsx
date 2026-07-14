"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { StatCard } from "../molecules/StatCard";
import TileTemplate from "../templates/TileTemplate";
import { useEntityCounts } from "@/hooks/thingsboard/dashboard/useEntityCounts";

export function TenantStats() {
  const router = useRouter();
  const { tenants, devices, isLoading } = useEntityCounts();

  const handleAddTenant = () => {
    router.push("/");
  };

  const handleAddDevice = () => {
    router.push("/devices");
  };

  return (
    <>
      <TileTemplate colSpan={2} rowSpan={2}>
        <StatCard
          label="Tenants"
          value={isLoading ? "..." : tenants}
          addButton
          onAddClick={handleAddTenant}
          className="h-full"
        />
      </TileTemplate>
      <TileTemplate colSpan={2} rowSpan={2}>
        <StatCard
          label="Devices"
          value={isLoading ? "..." : devices}
          addButton
          onAddClick={handleAddDevice}
          className="h-full"
        />
      </TileTemplate>
    </>
  );
}
