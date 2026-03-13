"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EntityViewService } from "@/lib/services/thingsboardServices/entityViewService";

interface EntityViewLatestTelemetryTabContentProps {
  entityViewId: string;
}

interface TelemetryRow {
  id: string;
  key: string;
  value: string;
  lastUpdateTs: number | null;
}

const formatValue = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "-";

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

export function EntityViewLatestTelemetryTabContent({
  entityViewId,
}: EntityViewLatestTelemetryTabContentProps) {
  const [manualKeys, setManualKeys] = useState<string[]>([]);

  const { data: attributes, isLoading: isLoadingAttributes } = useSWR(
    entityViewId ? ["entityViewAttributesForTelemetry", entityViewId] : null,
    async () => EntityViewService.fetchEntityViewSharedAttributes(entityViewId),
  );

  const configuredKeys = useMemo(() => {
    if (!Array.isArray(attributes)) return [] as string[];

    const telemetryKeysAttribute = attributes.find(
      (attribute) => attribute.key === "telemetry_keys",
    )?.value;

    if (Array.isArray(telemetryKeysAttribute)) {
      return telemetryKeysAttribute
        .map((key) => String(key).trim())
        .filter(Boolean);
    }

    if (typeof telemetryKeysAttribute === "string") {
      return telemetryKeysAttribute
        .split(",")
        .map((key) => key.trim())
        .filter(Boolean);
    }

    return [] as string[];
  }, [attributes]);

  const telemetryKeys = useMemo(() => {
    return Array.from(new Set([...configuredKeys, ...manualKeys]));
  }, [configuredKeys, manualKeys]);

  const {
    data: latestTelemetry,
    isLoading: isLoadingTelemetry,
    mutate: mutateLatestTelemetry,
  } = useSWR(
    entityViewId && telemetryKeys.length > 0
      ? ["entityViewLatestTelemetry", entityViewId, telemetryKeys.join(",")]
      : null,
    async () =>
      EntityViewService.fetchEntityViewLatestTelemetry(
        entityViewId,
        telemetryKeys,
      ),
  );

  const {
    data: allTelemetryKeys,
    isLoading: isLoadingAllTelemetryKeys,
    mutate: mutateAllTelemetryKeys,
  } = useSWR(
    entityViewId ? ["entityViewLatestTelemetryKeys", entityViewId] : null,
    async () =>
      EntityViewService.fetchEntityViewLatestTelemetryKeys(entityViewId),
  );

  const {
    data: allLatestTelemetry,
    isLoading: isLoadingAllTelemetry,
    mutate: mutateAllLatestTelemetry,
  } = useSWR(
    entityViewId && allTelemetryKeys && allTelemetryKeys.length > 0
      ? [
          "entityViewLatestTelemetryAll",
          entityViewId,
          allTelemetryKeys.join(","),
        ]
      : null,
    async () =>
      EntityViewService.fetchEntityViewLatestTelemetry(
        entityViewId,
        allTelemetryKeys || [],
      ),
  );

  const rows: TelemetryRow[] = useMemo(() => {
    if (!latestTelemetry) return [];

    return Object.entries(latestTelemetry).map(([key, values], index) => {
      const points = Array.isArray(values) ? values : [];
      const latestPoint = points.reduce<{ ts: number; value: unknown } | null>(
        (current, item) => {
          if (!current || item.ts > current.ts) return item;
          return current;
        },
        null,
      );

      return {
        id: `${key}-${index}`,
        key,
        value: latestPoint ? formatValue(latestPoint.value) : "-",
        lastUpdateTs: latestPoint ? latestPoint.ts : null,
      };
    });
  }, [latestTelemetry]);

  const allRows: TelemetryRow[] = useMemo(() => {
    if (!allLatestTelemetry) return [];

    return Object.entries(allLatestTelemetry).map(([key, values], index) => {
      const points = Array.isArray(values) ? values : [];
      const latestPoint = points.reduce<{ ts: number; value: unknown } | null>(
        (current, item) => {
          if (!current || item.ts > current.ts) return item;
          return current;
        },
        null,
      );

      return {
        id: `all-${key}-${index}`,
        key,
        value: latestPoint ? formatValue(latestPoint.value) : "-",
        lastUpdateTs: latestPoint ? latestPoint.ts : null,
      };
    });
  }, [allLatestTelemetry]);

  const columns: DataTableColumn<TelemetryRow>[] = useMemo(
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
        title="Latest telemetry"
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        isLoading={isLoadingAttributes || isLoadingTelemetry}
        currentPage={0}
        pageSize={rows.length || 10}
        totalPages={1}
        totalElements={rows.length}
        onPageChange={() => {}}
        emptyMessage={
          telemetryKeys.length === 0
            ? "No telemetry keys configured for this entity view."
            : "No telemetry found for selected keys."
        }
        loadingMessage="Loading latest telemetry..."
      />

      <Accordion
        type="single"
        collapsible
        className="w-full rounded-md border px-4"
      >
        <AccordionItem value="all-latest-telemetry" className="border-b-0">
          <AccordionTrigger className="text-sm font-medium">
            Show all latest telemetry (unfiltered)
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <DataTable
              title="All latest telemetry"
              data={allRows}
              columns={columns}
              getRowId={(row) => row.id}
              isLoading={isLoadingAllTelemetryKeys || isLoadingAllTelemetry}
              currentPage={0}
              pageSize={allRows.length || 10}
              totalPages={1}
              totalElements={allRows.length}
              onPageChange={() => {}}
              emptyMessage="No latest telemetry found for this entity view."
              loadingMessage="Loading all latest telemetry..."
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
