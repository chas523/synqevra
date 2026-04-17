"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { RuleChainService } from "@/lib/services/thingsboardServices/ruleChainService";
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

interface RuleChainAttributesTabContentProps {
  ruleChainId: string;
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

const ATTRIBUTE_VALUE_PREVIEW_LIMIT = 80;

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

export function RuleChainAttributesTabContent({
  ruleChainId,
}: RuleChainAttributesTabContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState("");
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
  } = useSWR(
    ruleChainId ? ["ruleChainAttributes", ruleChainId] : null,
    async () => {
      return RuleChainService.fetchRuleChainAttributes(ruleChainId);
    },
  );

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
      await RuleChainService.updateRuleChainServerAttributes(ruleChainId, {
        [key]: parsedValue,
      });

      await mutate();
      toast.success("Attribute added successfully");
      setAttributeKey("");
      setAttributeType("string");
      setAttributeValue("");
      setDialogOpen(false);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to add ruleChain attribute",
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

  const handleOpenDetails = (value: string) => {
    setSelectedDetails(value);
    setDetailsDialogOpen(true);
  };

  const columns: DataTableColumn<AttributeRow>[] = useMemo(
    () => [
      {
        key: "lastUpdateTs",
        header: "Last update time",
        render: (row) =>
          row.lastUpdateTs ? new Date(row.lastUpdateTs).toLocaleString() : "-",
        className: "text-slate-700 whitespace-nowrap w-56",
      },
      {
        key: "key",
        header: "Key",
        className: "w-56",
        render: (row) => (
          <div className="truncate font-medium text-slate-900" title={row.key}>
            {row.key}
          </div>
        ),
      },
      {
        key: "value",
        header: "Value",
        className: "whitespace-normal",
        render: (row) => {
          const isLongValue = row.value.length > ATTRIBUTE_VALUE_PREVIEW_LIMIT;

          if (!isLongValue) {
            return (
              <div
                className="max-w-md break-all whitespace-normal font-mono text-sm text-slate-600"
                title={row.value}
              >
                {row.value}
              </div>
            );
          }

          const previewValue = `${row.value.slice(0, 48)}...`;

          return (
            <div className="flex max-w-sm flex-col items-start gap-2">
              <div
                className="font-mono text-sm text-slate-600"
                title={row.value}
              >
                {previewValue}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleOpenDetails(row.value)}
              >
                Show details
              </Button>
            </div>
          );
        },
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
        tableClassName="min-w-0 w-full table-fixed"
        onRefresh={() => {
          mutate();
        }}
        filterComponent={
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <div className="w-full sm:w-56">
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search attribute key..."
              />
            </div>
            <Button
              type="button"
              className="bg-blue-600 text-white hover:bg-blue-700 whitespace-nowrap"
              onClick={() => setDialogOpen(true)}
            >
              Add attribute
            </Button>
          </div>
        }
        emptyMessage={
          searchQuery.trim()
            ? "No attributes match your search."
            : "No attributes found for this ruleChain."
        }
        loadingMessage="Loading attributes..."
      />

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!isSaving) setDialogOpen(open);
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
                <Label htmlFor="ruleChain-attribute-value">Value*</Label>
                <Input
                  id="ruleChain-attribute-value"
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
              <Label htmlFor="ruleChain-attribute-key">Key*</Label>
              <Input
                id="ruleChain-attribute-key"
                value={attributeKey}
                onChange={(event) => setAttributeKey(event.target.value)}
                placeholder="key"
                disabled={isSaving}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleAddAttribute} disabled={isSaving}>
              {isSaving ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-170">
          <DialogHeader>
            <DialogTitle>Attribute value details</DialogTitle>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <div className="text-sm font-medium text-slate-600">Full value</div>
            <pre className="max-h-90 overflow-auto rounded border bg-slate-50 p-3 text-xs font-mono text-slate-700 whitespace-pre-wrap break-all">
              {selectedDetails}
            </pre>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDetailsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
