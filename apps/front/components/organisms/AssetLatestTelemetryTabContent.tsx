"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SelectAdmin,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/admin_select";
import {
  AssetLatestTelemetryResponse,
  AssetService,
} from "@/lib/services/thingsboardServices/assetService";

interface AssetLatestTelemetryTabContentProps {
  assetId: string;
}

interface TelemetryRow {
  id: string;
  key: string;
  value: string;
  lastUpdateTs: number | null;
}

type TelemetryType = "string" | "integer" | "double" | "boolean" | "json";

const TELEMETRY_TYPES: Array<{ value: TelemetryType; label: string }> = [
  { value: "string", label: "String" },
  { value: "integer", label: "Integer" },
  { value: "double", label: "Double" },
  { value: "boolean", label: "Boolean" },
  { value: "json", label: "JSON" },
];

const parseTelemetryValue = (
  type: TelemetryType,
  rawValue: string,
): unknown => {
  if (type === "string") {
    return rawValue;
  }

  if (type === "integer") {
    const parsed = Number.parseInt(rawValue, 10);
    if (!Number.isFinite(parsed)) {
      throw new Error("Value must be a valid integer");
    }
    return parsed;
  }

  if (type === "double") {
    const parsed = Number.parseFloat(rawValue);
    if (!Number.isFinite(parsed)) {
      throw new Error("Value must be a valid number");
    }
    return parsed;
  }

  if (type === "boolean") {
    const normalized = rawValue.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") {
      return true;
    }
    if (normalized === "false" || normalized === "0") {
      return false;
    }
    throw new Error("Value must be true/false");
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    throw new Error("Value must be valid JSON");
  }
};

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

const mergeTelemetryResponse = (
  serverTelemetry: AssetLatestTelemetryResponse | undefined,
  optimisticTelemetry: AssetLatestTelemetryResponse,
  allowedKeys?: string[],
): AssetLatestTelemetryResponse => {
  const merged: AssetLatestTelemetryResponse = {
    ...(serverTelemetry || {}),
  };

  Object.entries(optimisticTelemetry).forEach(([key, points]) => {
    if (allowedKeys && !allowedKeys.includes(key)) {
      return;
    }

    if (!Array.isArray(points) || points.length === 0) {
      return;
    }

    const optimisticPoint = points[0];
    const currentPoint = Array.isArray(merged[key])
      ? merged[key][0]
      : undefined;

    if (!currentPoint || optimisticPoint.ts >= currentPoint.ts) {
      merged[key] = [optimisticPoint];
    }
  });

  return merged;
};

export function AssetLatestTelemetryTabContent({
  assetId,
}: AssetLatestTelemetryTabContentProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [optimisticTelemetry, setOptimisticTelemetry] =
    useState<AssetLatestTelemetryResponse>({});
  const [telemetryKey, setTelemetryKey] = useState("");
  const [telemetryType, setTelemetryType] = useState<TelemetryType>("string");
  const [telemetryValue, setTelemetryValue] = useState("");

  const { data: attributes, isLoading: isLoadingAttributes } = useSWR(
    assetId ? ["assetAttributes", assetId] : null,
    async () => AssetService.fetchAssetSharedAttributes(assetId),
  );

  const configuredKeys = useMemo(() => {
    if (!Array.isArray(attributes)) {
      return [] as string[];
    }

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

  const {
    data: latestTelemetry,
    isLoading: isLoadingTelemetry,
    mutate: mutateLatestTelemetry,
  } = useSWR(
    assetId && configuredKeys.length > 0
      ? ["assetLatestTelemetry", assetId, configuredKeys.join(",")]
      : null,
    async () => AssetService.fetchAssetLatestTelemetry(assetId, configuredKeys),
  );

  const {
    data: allTelemetryKeys,
    isLoading: isLoadingAllTelemetryKeys,
    mutate: mutateAllTelemetryKeys,
  } = useSWR(assetId ? ["assetLatestTelemetryKeys", assetId] : null, async () =>
    AssetService.fetchAssetLatestTelemetryKeys(assetId),
  );

  const {
    data: allLatestTelemetry,
    isLoading: isLoadingAllTelemetry,
    mutate: mutateAllLatestTelemetry,
  } = useSWR(
    assetId && allTelemetryKeys && allTelemetryKeys.length > 0
      ? ["assetLatestTelemetryAll", assetId, allTelemetryKeys.join(",")]
      : null,
    async () =>
      AssetService.fetchAssetLatestTelemetry(assetId, allTelemetryKeys || []),
  );

  const rows: TelemetryRow[] = useMemo(() => {
    const mergedTelemetry = mergeTelemetryResponse(
      latestTelemetry,
      optimisticTelemetry,
      configuredKeys,
    );

    if (Object.keys(mergedTelemetry).length === 0) {
      return [];
    }

    return Object.entries(mergedTelemetry).map(([key, values], index) => {
      const points = Array.isArray(values) ? values : [];
      const latestPoint = points.reduce<{ ts: number; value: unknown } | null>(
        (current, item) => {
          if (!current || item.ts > current.ts) {
            return item;
          }
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
  }, [configuredKeys, latestTelemetry, optimisticTelemetry]);

  const allRows: TelemetryRow[] = useMemo(() => {
    const mergedTelemetry = mergeTelemetryResponse(
      allLatestTelemetry,
      optimisticTelemetry,
    );

    if (Object.keys(mergedTelemetry).length === 0) {
      return [];
    }

    return Object.entries(mergedTelemetry).map(([key, values], index) => {
      const points = Array.isArray(values) ? values : [];
      const latestPoint = points.reduce<{ ts: number; value: unknown } | null>(
        (current, item) => {
          if (!current || item.ts > current.ts) {
            return item;
          }
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
  }, [allLatestTelemetry, optimisticTelemetry]);

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return rows;
    }

    return rows.filter((row) => row.key.toLowerCase().includes(query));
  }, [rows, searchQuery]);

  const filteredAllRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return allRows;
    }

    return allRows.filter((row) => row.key.toLowerCase().includes(query));
  }, [allRows, searchQuery]);

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

  const valuePlaceholder = useMemo(() => {
    switch (telemetryType) {
      case "integer":
        return "e.g. 72";
      case "double":
        return "e.g. 72.5";
      case "boolean":
        return "true or false";
      case "json":
        return '{"sample": "value"}';
      default:
        return "Enter value";
    }
  }, [telemetryType]);

  const resetForm = () => {
    setTelemetryKey("");
    setTelemetryType("string");
    setTelemetryValue("");
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setIsDialogOpen(false);
  };

  const filterComponent = (
    <div className="flex flex-1 flex-wrap items-center gap-2">
      <div className="w-full sm:w-64">
        <Input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search telemetry key..."
        />
      </div>
    </div>
  );

  const handleSubmit = async () => {
    const key = telemetryKey.trim();

    if (!key) {
      toast.error("Telemetry key is required");
      return;
    }

    if (!telemetryValue.trim()) {
      toast.error("Telemetry value is required");
      return;
    }

    let parsedValue: unknown;

    try {
      parsedValue = parseTelemetryValue(telemetryType, telemetryValue);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid value");
      return;
    }

    setIsSubmitting(true);
    try {
      await AssetService.addAssetLatestTelemetry(assetId, {
        [key]: parsedValue,
      });

      setOptimisticTelemetry((current) => ({
        ...current,
        [key]: [{ ts: Date.now(), value: parsedValue }],
      }));

      await mutateLatestTelemetry();
      await mutateAllTelemetryKeys();
      await mutateAllLatestTelemetry();
      toast.success("Telemetry added successfully");
      resetForm();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add telemetry");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <DataTable
        title="Latest telemetry"
        data={filteredRows}
        columns={columns}
        getRowId={(row) => row.id}
        isLoading={isLoadingAttributes || isLoadingTelemetry}
        currentPage={0}
        pageSize={filteredRows.length || 10}
        totalPages={1}
        totalElements={filteredRows.length}
        onPageChange={() => {}}
        filterComponent={filterComponent}
        emptyMessage={
          searchQuery.trim()
            ? "No telemetry keys match your search."
            : configuredKeys.length === 0
              ? "No telemetry keys configured for this asset."
              : "No telemetry found for selected keys."
        }
        loadingMessage="Loading latest telemetry..."
        customAction={
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setIsDialogOpen(true)}
          >
            Add telemetry
          </Button>
        }
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
              data={filteredAllRows}
              columns={columns}
              getRowId={(row) => row.id}
              isLoading={isLoadingAllTelemetryKeys || isLoadingAllTelemetry}
              currentPage={0}
              pageSize={filteredAllRows.length || 10}
              totalPages={1}
              totalElements={filteredAllRows.length}
              onPageChange={() => {}}
              filterComponent={filterComponent}
              emptyMessage={
                searchQuery.trim()
                  ? "No telemetry keys match your search."
                  : "No latest telemetry found for this asset."
              }
              loadingMessage="Loading all latest telemetry..."
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => (!isSubmitting ? setIsDialogOpen(open) : null)}
      >
        <DialogContent className="sm:max-w-120">
          <DialogHeader>
            <DialogTitle>Add telemetry</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="telemetry-key">Key*</Label>
              <Input
                id="telemetry-key"
                value={telemetryKey}
                onChange={(event) => setTelemetryKey(event.target.value)}
                placeholder="Enter telemetry key"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-[180px_1fr] gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <SelectAdmin
                  value={telemetryType}
                  onValueChange={(value) =>
                    setTelemetryType(value as TelemetryType)
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TELEMETRY_TYPES.map((typeOption) => (
                      <SelectItem
                        key={typeOption.value}
                        value={typeOption.value}
                      >
                        {typeOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectAdmin>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="telemetry-value">Value*</Label>
                <Input
                  id="telemetry-value"
                  value={telemetryValue}
                  onChange={(event) => setTelemetryValue(event.target.value)}
                  placeholder={valuePlaceholder}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
