"use client";

import useSWR from "swr";
import { DeviceService } from "@/lib/services/thingsboardServices/deviceService";
import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import { useMemo } from "react";

interface DeviceAttributesTabContentProps {
  deviceId: string;
}

interface AttributeRow {
  id: string;
  key: string;
  value: string;
  lastUpdateTs: number | null;
}

const formatValue = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }

  if (value === null || value === undefined) {
    return "-";
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const toEpoch = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

export function DeviceAttributesTabContent({
  deviceId,
}: DeviceAttributesTabContentProps) {
  const { data: attributes, isLoading } = useSWR(
    deviceId ? ["deviceAttributes", deviceId] : null,
    async () => {
      return DeviceService.fetchDeviceSharedAttributes(deviceId);
    },
  );

  const dataArray: AttributeRow[] = useMemo(() => {
    if (!attributes) return [];

    if (Array.isArray(attributes)) {
      return attributes.map((item, index) => ({
        id: `${item.key}-${index}`,
        key: item.key,
        value: formatValue(item.value),
        lastUpdateTs: toEpoch(item.lastUpdateTs),
      }));
    }

    return Object.entries(attributes as Record<string, unknown>).map(
      ([key, value], index) => ({
        id: `${key}-${index}`,
        key,
        value: formatValue(value),
        lastUpdateTs: null,
      }),
    );
  }, [attributes]);

  const columns: DataTableColumn<AttributeRow>[] = useMemo(
    () => [
      {
        key: "lastUpdateTs",
        header: "Last update time",
        render: (row) =>
          row.lastUpdateTs ? new Date(row.lastUpdateTs).toLocaleString() : "-",
        className: "w-1/3 text-slate-700",
      },
      {
        key: "key",
        header: "Key",
        className: "font-medium text-slate-900 w-1/4",
      },
      {
        key: "value",
        header: "Value",
        className: "font-mono text-sm text-slate-600",
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <DataTable
        title="Shared Attributes"
        data={dataArray}
        columns={columns}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        currentPage={0}
        pageSize={dataArray.length || 10}
        totalPages={1}
        totalElements={dataArray.length}
        onPageChange={() => {}}
        emptyMessage="No attributes found for this device."
        loadingMessage="Loading attributes..."
      />
    </div>
  );
}
