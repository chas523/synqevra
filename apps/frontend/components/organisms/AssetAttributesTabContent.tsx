"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { AssetService } from "@/lib/services/thingsboardServices/assetService";
import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import { Button } from "@/components/ui/button";
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

interface AssetAttributesTabContentProps {
  assetId: string;
}

interface AttributeRow {
  id: string;
  key: string;
  value: string;
  lastUpdateTs: number | null;
}

type AttributeType = "string" | "integer" | "double" | "boolean" | "json";

const ATTRIBUTE_TYPE_OPTIONS: Array<{ value: AttributeType; label: string }> = [
  { value: "string", label: "String" },
  { value: "integer", label: "Integer" },
  { value: "double", label: "Double" },
  { value: "boolean", label: "Boolean" },
  { value: "json", label: "JSON" },
];

const INTEGER_INPUT_REGEX = /^-?\d*$/;
const DOUBLE_INPUT_REGEX = /^-?\d*([\.,]\d*)?$/;

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

export function AssetAttributesTabContent({
  assetId,
}: AssetAttributesTabContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [attributeKey, setAttributeKey] = useState("");
  const [attributeType, setAttributeType] = useState<AttributeType>("string");
  const [attributeValue, setAttributeValue] = useState("");

  const handleAttributeValueChange = (nextValue: string) => {
    if (attributeType === "integer" && !INTEGER_INPUT_REGEX.test(nextValue)) {
      return;
    }

    if (attributeType === "double" && !DOUBLE_INPUT_REGEX.test(nextValue)) {
      return;
    }

    setAttributeValue(nextValue);
  };

  const {
    data: attributes,
    isLoading,
    mutate,
  } = useSWR(assetId ? ["assetAttributes", assetId] : null, async () => {
    return AssetService.fetchAssetServerAttributes(assetId);
  });

  const handleAddAttribute = async () => {
    const key = attributeKey.trim();

    if (!key) {
      toast.error("Attribute key is required");
      return;
    }

    if (!attributeValue.trim()) {
      toast.error("Attribute value is required");
      return;
    }

    let parsedValue: unknown;
    try {
      if (attributeType === "string") {
        parsedValue = attributeValue;
      } else if (attributeType === "integer") {
        const parsed = Number.parseInt(attributeValue, 10);
        if (!Number.isFinite(parsed)) {
          throw new Error("Value must be a valid integer");
        }
        parsedValue = parsed;
      } else if (attributeType === "double") {
        const parsed = Number.parseFloat(attributeValue.replace(",", "."));
        if (!Number.isFinite(parsed)) {
          throw new Error("Value must be a valid number");
        }
        parsedValue = parsed;
      } else if (attributeType === "boolean") {
        const normalized = attributeValue.trim().toLowerCase();
        if (normalized === "true" || normalized === "1") {
          parsedValue = true;
        } else if (normalized === "false" || normalized === "0") {
          parsedValue = false;
        } else {
          throw new Error("Value must be true/false");
        }
      } else {
        parsedValue = JSON.parse(attributeValue);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Invalid attribute value",
      );
      return;
    }

    setIsSaving(true);
    try {
      await AssetService.updateAssetServerAttributes(assetId, {
        [key]: parsedValue,
      });
      await mutate();
      toast.success("Server attribute added successfully");
      setAttributeKey("");
      setAttributeType("string");
      setAttributeValue("");
      setDialogOpen(false);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to add server attribute",
      );
    } finally {
      setIsSaving(false);
    }
  };

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

  const filteredDataArray = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return dataArray;

    return dataArray.filter((row) => row.key.toLowerCase().includes(query));
  }, [dataArray, searchQuery]);

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
        title="Server Attributes"
        data={filteredDataArray}
        columns={columns}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        currentPage={0}
        pageSize={filteredDataArray.length || 10}
        totalPages={1}
        totalElements={filteredDataArray.length}
        onPageChange={() => {}}
        onRefresh={() => {
          mutate();
        }}
        filterComponent={
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <div className="w-full sm:w-64">
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search attribute key..."
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
            Add attribute
          </Button>
        }
        emptyMessage={
          searchQuery.trim()
            ? "No attributes match your search."
            : "No attributes found for this asset."
        }
        loadingMessage="Loading attributes..."
      />

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!isSaving) {
            setDialogOpen(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-130">
          <DialogHeader>
            <DialogTitle>Add server attribute</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[160px_1fr]">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <SelectAdmin
                  value={attributeType}
                  onValueChange={(value) => {
                    const nextType = value as AttributeType;
                    if (nextType === attributeType) return;
                    setAttributeType(nextType);
                    setAttributeValue("");
                  }}
                  disabled={isSaving}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ATTRIBUTE_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectAdmin>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="asset-attribute-value">Value*</Label>
                <Input
                  id="asset-attribute-value"
                  value={attributeValue}
                  onChange={(event) =>
                    handleAttributeValueChange(event.target.value)
                  }
                  inputMode={
                    attributeType === "integer"
                      ? "numeric"
                      : attributeType === "double"
                        ? "decimal"
                        : undefined
                  }
                  placeholder={
                    attributeType === "integer"
                      ? "e.g. 123"
                      : attributeType === "double"
                        ? "e.g. 12.34"
                        : attributeType === "boolean"
                          ? "true / false"
                          : attributeType === "json"
                            ? '{"k":"v"}'
                            : "String value"
                  }
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="asset-attribute-key">Key*</Label>
              <Input
                id="asset-attribute-key"
                value={attributeKey}
                onChange={(event) => setAttributeKey(event.target.value)}
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
              onClick={handleAddAttribute}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
