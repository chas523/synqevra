"use client";

import { useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import useSWR from "swr";
import { toast } from "sonner";
import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import {
  SelectAdmin,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/admin_select";
import { AssetService } from "@/lib/services/thingsboardServices/assetService";

interface CustomerLatestTelemetryTabContentProps {
  customerId: string;
}

interface TelemetryRow {
  id: string;
  key: string;
  value: string;
  lastUpdateTs: number | null;
}

type ValueType = "string" | "integer" | "double" | "boolean" | "json";

const VALUE_TYPE_OPTIONS: Array<{ value: ValueType; label: string }> = [
  { value: "string", label: "String" },
  { value: "integer", label: "Integer" },
  { value: "double", label: "Double" },
  { value: "boolean", label: "Boolean" },
  { value: "json", label: "JSON" },
];

const INTEGER_INPUT_REGEX = /^-?\d*$/;
const DOUBLE_INPUT_REGEX = /^-?\d*([\.,]\d*)?$/;
const INTEGER_SUBMIT_REGEX = /^-?\d+$/;
const DOUBLE_SUBMIT_REGEX = /^-?\d+([\.,]\d+)?$/;

const formatValue = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "-";
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

export function CustomerLatestTelemetryTabContent({
  customerId,
}: CustomerLatestTelemetryTabContentProps) {
  const { resolvedTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [telemetryKey, setTelemetryKey] = useState("");
  const [valueType, setValueType] = useState<ValueType>("string");
  const [telemetryValue, setTelemetryValue] = useState("");
  const [booleanValue, setBooleanValue] = useState(false);
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false);
  const [jsonDraft, setJsonDraft] = useState("{}");

  const handleTelemetryValueChange = (nextValue: string) => {
    if (valueType === "integer" && !INTEGER_INPUT_REGEX.test(nextValue)) {
      return;
    }

    if (valueType === "double" && !DOUBLE_INPUT_REGEX.test(nextValue)) {
      return;
    }

    setTelemetryValue(nextValue);
  };

  const {
    data: allKeys,
    isLoading: isLoadingKeys,
    mutate: mutateAllKeys,
  } = useSWR(
    customerId ? ["customerTelemetryKeys", customerId] : null,
    async () => AssetService.fetchCustomerLatestTelemetryKeys(customerId),
  );

  const {
    data: latestTelemetry,
    isLoading: isLoadingTelemetry,
    mutate,
  } = useSWR(
    customerId && allKeys && allKeys.length > 0
      ? ["customerLatestTelemetry", customerId, allKeys.join(",")]
      : null,
    async () =>
      AssetService.fetchCustomerLatestTelemetry(customerId, allKeys || []),
  );

  const handleAddTelemetry = async () => {
    const key = telemetryKey.trim();

    if (!key) {
      toast.error("Telemetry key is required");
      return;
    }

    if (valueType !== "boolean" && !telemetryValue.trim()) {
      toast.error("Telemetry value is required");
      return;
    }

    let parsedValue: unknown;
    try {
      if (valueType === "string") {
        parsedValue = telemetryValue;
      } else if (valueType === "integer") {
        if (!INTEGER_SUBMIT_REGEX.test(telemetryValue.trim())) {
          throw new Error("Value must be a valid integer");
        }
        const parsed = Number.parseInt(telemetryValue, 10);
        if (!Number.isFinite(parsed))
          throw new Error("Value must be a valid integer");
        parsedValue = parsed;
      } else if (valueType === "double") {
        if (!DOUBLE_SUBMIT_REGEX.test(telemetryValue.trim())) {
          throw new Error("Value must be a valid number");
        }
        const parsed = Number.parseFloat(telemetryValue.replace(",", "."));
        if (!Number.isFinite(parsed))
          throw new Error("Value must be a valid number");
        parsedValue = parsed;
      } else if (valueType === "boolean") {
        parsedValue = booleanValue;
      } else {
        parsedValue = JSON.parse(telemetryValue);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Invalid telemetry value",
      );
      return;
    }

    setIsSaving(true);
    try {
      await AssetService.addCustomerLatestTelemetry(customerId, {
        [key]: parsedValue,
      });
      await mutateAllKeys();
      await mutate();
      toast.success("Telemetry added successfully");
      setTelemetryKey("");
      setValueType("string");
      setTelemetryValue("");
      setBooleanValue(false);
      setJsonDraft("{}");
      setDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add telemetry");
    } finally {
      setIsSaving(false);
    }
  };

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

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) => row.key.toLowerCase().includes(query));
  }, [rows, searchQuery]);

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

  const editorTheme = resolvedTheme === "dark" ? "vs-dark" : "light";

  return (
    <div className="space-y-4">
      <DataTable
        title="Latest Telemetry"
        data={filteredRows}
        columns={columns}
        getRowId={(row) => row.id}
        isLoading={isLoadingKeys || isLoadingTelemetry}
        currentPage={0}
        pageSize={filteredRows.length || 10}
        totalPages={1}
        totalElements={filteredRows.length}
        onPageChange={() => {}}
        onRefresh={async () => {
          await mutateAllKeys();
          await mutate();
        }}
        filterComponent={
          <div className="flex items-center gap-2">
            <div className="w-64">
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search telemetry key..."
              />
            </div>
          </div>
        }
        customAction={
          <Button
            type="button"
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => setDialogOpen(true)}
          >
            Add telemetry
          </Button>
        }
        emptyMessage={
          searchQuery.trim()
            ? "No telemetry keys match your search."
            : "No telemetry found for this customer."
        }
        loadingMessage="Loading latest telemetry..."
      />

      <Dialog
        modal={false}
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!isSaving) setDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-130">
          <DialogHeader>
            <DialogTitle>Add latest telemetry</DialogTitle>
            <DialogDescription>
              Define a key and value to add latest telemetry for this customer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[160px_1fr]">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <SelectAdmin
                  value={valueType}
                  onValueChange={(value) => {
                    const nextType = value as ValueType;
                    if (nextType === valueType) return;
                    setValueType(nextType);
                    setTelemetryValue("");
                    setBooleanValue(false);
                    setJsonDraft("{}");
                  }}
                  disabled={isSaving}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {VALUE_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectAdmin>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="customer-telemetry-value">Value*</Label>
                {valueType === "boolean" ? (
                  <div className="flex items-center gap-3 pt-2">
                    <Switch
                      checked={booleanValue}
                      onCheckedChange={(checked) => {
                        setBooleanValue(checked);
                        setTelemetryValue(checked ? "true" : "false");
                      }}
                      disabled={isSaving}
                    />
                    <span className="text-sm text-slate-700">
                      {booleanValue ? "true" : "false"}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      id="customer-telemetry-value"
                      value={telemetryValue}
                      onChange={(event) =>
                        handleTelemetryValueChange(event.target.value)
                      }
                      inputMode={
                        valueType === "integer"
                          ? "numeric"
                          : valueType === "double"
                            ? "decimal"
                            : undefined
                      }
                      placeholder={
                        valueType === "integer"
                          ? "e.g. 123"
                          : valueType === "double"
                            ? "e.g. 12.34 or 12,34"
                            : valueType === "json"
                              ? '{"k":"v"}'
                              : "String value"
                      }
                      disabled={isSaving || valueType === "json"}
                    />
                    {valueType === "json" && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setJsonDraft(telemetryValue.trim() || "{}");
                          setJsonDialogOpen(true);
                        }}
                        disabled={isSaving}
                      >
                        Edit JSON
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="customer-telemetry-key">Key*</Label>
              <Input
                id="customer-telemetry-key"
                value={telemetryKey}
                onChange={(event) => setTelemetryKey(event.target.value)}
                placeholder="key"
                disabled={isSaving}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleAddTelemetry}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        modal={false}
        open={jsonDialogOpen}
        onOpenChange={(open) => setJsonDialogOpen(open)}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit JSON value</DialogTitle>
            <DialogDescription>
              Enter a valid JSON object or value for telemetry payload.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="overflow-hidden rounded-md border">
              <Editor
                height="320px"
                defaultLanguage="json"
                value={jsonDraft}
                onChange={(value) => setJsonDraft(value ?? "")}
                theme={editorTheme}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: "on",
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setJsonDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                try {
                  JSON.parse(jsonDraft);
                  setTelemetryValue(jsonDraft);
                  setJsonDialogOpen(false);
                } catch {
                  toast.error("JSON must be valid");
                }
              }}
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
