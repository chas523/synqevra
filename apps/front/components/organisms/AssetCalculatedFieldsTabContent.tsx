"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import {
  AssetService,
  AssetCalculatedField,
} from "@/lib/services/thingsboardServices/assetService";
import { DeviceService } from "@/lib/services/thingsboardServices/deviceService";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  SelectAdmin,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/admin_select";
import { ScriptEditor } from "@/components/molecules/ScriptEditor";
import { TestScriptModal } from "@/components/molecules/TestScriptModal";

interface AssetCalculatedFieldsTabContentProps {
  assetId: string;
}

type FieldType = "simple" | "script";
type OutputType = "TIME_SERIES" | "ATTRIBUTES";
type AttributeScope = "SERVER_SCOPE" | "SHARED_SCOPE";
type EntityType =
  | "current_entity"
  | "device"
  | "asset"
  | "customer"
  | "current_tenant";
type ArgumentType = "attribute" | "latest_telemetry";

interface CalculatedFieldArgument {
  id: string;
  argumentName: string;
  entityType: EntityType;
  argumentType: ArgumentType;
  refEntityId: string;
  timeSeriesKey: string;
  name: string;
  defaultValue: string;
}

interface AddCalculatedFieldForm {
  title: string;
  fieldType: FieldType;
  expression: string;
  outputKey: string;
  outputType: OutputType;
  attributeScope: AttributeScope;
  decimalsByDefault: string;
  arguments: CalculatedFieldArgument[];
}

interface AddArgumentForm {
  argumentName: string;
  entityType: EntityType;
  argumentType: ArgumentType;
  refEntityId: string;
  name: string;
  defaultValue: string;
  timeSeriesKey: string;
}

const ENTITY_OPTIONS: Array<{ value: EntityType; label: string }> = [
  { value: "current_entity", label: "Current entity" },
  { value: "device", label: "Device" },
  { value: "asset", label: "Asset" },
  { value: "customer", label: "Customer" },
  { value: "current_tenant", label: "Current tenant" },
];

const ARGUMENT_TYPE_OPTIONS: Array<{ value: ArgumentType; label: string }> = [
  { value: "attribute", label: "Attribute" },
  { value: "latest_telemetry", label: "Latest telemetry" },
];

const isCurrentScope = (entityType: EntityType): boolean =>
  entityType === "current_entity" || entityType === "current_tenant";

const createEmptyArgumentForm = (): AddArgumentForm => ({
  argumentName: "",
  entityType: "current_entity",
  argumentType: "latest_telemetry",
  refEntityId: "",
  name: "",
  defaultValue: "",
  timeSeriesKey: "",
});

const createClientId = (): string => {
  const cryptoObject = globalThis.crypto as
    | { randomUUID?: () => string }
    | undefined;

  if (cryptoObject && typeof cryptoObject.randomUUID === "function") {
    return cryptoObject.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export function AssetCalculatedFieldsTabContent({
  assetId,
}: AssetCalculatedFieldsTabContentProps) {
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isArgumentDialogOpen, setIsArgumentDialogOpen] = useState(false);
  const [isTestScriptModalOpen, setIsTestScriptModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddCalculatedFieldForm>({
    title: "",
    fieldType: "simple",
    expression: "",
    outputKey: "",
    outputType: "TIME_SERIES",
    attributeScope: "SERVER_SCOPE",
    decimalsByDefault: "",
    arguments: [],
  });
  const [argumentForm, setArgumentForm] = useState<AddArgumentForm>(
    createEmptyArgumentForm(),
  );
  const [isCustomTimeSeriesKey, setIsCustomTimeSeriesKey] = useState(false);
  const [editingArgumentId, setEditingArgumentId] = useState<string | null>(
    null,
  );
  const [entityNames, setEntityNames] = useState<Record<string, string>>({});

  const shouldFetchCurrentEntityTelemetryKeys =
    isArgumentDialogOpen &&
    argumentForm.entityType === "current_entity" &&
    argumentForm.argumentType === "latest_telemetry";

  const {
    data: currentEntityTelemetryKeys,
    isLoading: isTelemetryKeysLoading,
    error: telemetryKeysError,
  } = useSWR(
    shouldFetchCurrentEntityTelemetryKeys
      ? ["assetLatestTelemetryKeys", assetId]
      : null,
    async () => AssetService.fetchAssetLatestTelemetryKeys(assetId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 5 * 60 * 1000,
    },
  );

  const { data, isLoading, mutate } = useSWR(
    assetId ? ["AssetCalculatedFields", assetId, page, pageSize] : null,
    async () =>
      AssetService.fetchAssetCalculatedFields(
        assetId,
        page,
        pageSize,
        "createdTime",
        "DESC",
      ),
  );

  const columns: DataTableColumn<AssetCalculatedField>[] = useMemo(
    () => [
      {
        key: "createdTime",
        header: "Created time",
        render: (item) => new Date(item.createdTime).toLocaleString(),
      },
      {
        key: "name",
        header: "Name",
        className: "font-medium text-slate-900",
      },
      {
        key: "type",
        header: "Type",
      },
      {
        key: "expression",
        header: "Expression",
        render: (item) => (
          <div
            className="truncate max-w-75"
            title={item.configuration?.expression || ""}
          >
            {item.configuration?.expression || "-"}
          </div>
        ),
        className: "font-mono text-sm",
      },
      {
        key: "output",
        header: "Output",
        render: (item) => item.configuration?.output?.name || "-",
      },
    ],
    [],
  );

  const filteredCalculatedFields = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return data?.data || [];
    }

    return (data?.data || []).filter((item) => {
      const name = item.name?.toLowerCase() || "";
      const expression = item.configuration?.expression?.toLowerCase() || "";
      const outputName = item.configuration?.output?.name?.toLowerCase() || "";

      return (
        name.includes(query) ||
        expression.includes(query) ||
        outputName.includes(query)
      );
    });
  }, [data?.data, searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  const handleEditClick = (item: AssetCalculatedField) => {
    setEditingId(item.id?.id || null);
    const config = (item as any).configuration;
    const rawArguments = (item as any).arguments || config?.arguments;

    let mappedArguments: CalculatedFieldArgument[] = [];
    if (Array.isArray(rawArguments)) {
      mappedArguments = rawArguments.map((arg: any) => ({
        id: createClientId(),
        argumentName: arg.argumentName || "",
        entityType: (arg.entityType?.toLowerCase() as EntityType) || "device",
        argumentType: (arg.argumentType as ArgumentType) || "attribute",
        refEntityId:
          typeof arg.refEntityId === "object"
            ? arg.refEntityId.id
            : arg.refEntityId || "",
        timeSeriesKey: arg.timeSeriesKey || "",
        name: arg.name || "",
        defaultValue: arg.defaultValue || "",
      }));
    } else if (rawArguments && typeof rawArguments === "object") {
      mappedArguments = Object.entries(rawArguments).map(
        ([name, entry]: [string, any]) => {
          const entityType =
            entry.refEntityId?.entityType?.toLowerCase() || "device";
          const argType =
            entry.refEntityKey?.type === "TS_LATEST" ||
            entry.refEntityKey?.type === "TELEMETRY"
              ? "latest_telemetry"
              : "attribute";

          return {
            id: createClientId(),
            argumentName: name,
            entityType: (entityType === "device" ||
            entityType === "asset" ||
            entityType === "customer"
              ? entityType
              : "current_entity") as EntityType,
            argumentType: argType as ArgumentType,
            refEntityId:
              entry.refEntityId?.id ||
              (typeof entry.refEntityId === "string" ? entry.refEntityId : ""),
            timeSeriesKey: entry.refEntityKey?.key || entry.timeSeriesKey || "",
            name: entry.name || "",
            defaultValue: entry.defaultValue || "",
          };
        },
      );
    }

    // Fetch names for reference entities
    const deviceIds = mappedArguments
      .filter((a) => a.entityType === "device" && a.refEntityId)
      .map((a) => a.refEntityId);
    const assetIds = mappedArguments
      .filter((a) => a.entityType === "asset" && a.refEntityId)
      .map((a) => a.refEntityId);

    if (deviceIds.length || assetIds.length) {
      Promise.all([
        deviceIds.length
          ? DeviceService.fetchDevicesByIds(deviceIds as string[])
          : Promise.resolve([]),
        assetIds.length
          ? AssetService.fetchAssetsByIds(assetIds as string[])
          : Promise.resolve([]),
      ])
        .then(([devices, assets]) => {
          const names: Record<string, string> = {};

          // Handle both raw array and wrapped response formats
          const deviceList = Array.isArray(devices)
            ? devices
            : (devices as any)?.data || [];
          const assetList = Array.isArray(assets)
            ? assets
            : (assets as any)?.data || [];

          deviceList.forEach((d: any) => {
            const id = typeof d.id === "object" ? d.id.id : d.id;
            if (id) names[id] = d.name;
          });

          assetList.forEach((a: any) => {
            const id = typeof a.id === "object" ? a.id.id : a.id;
            if (id) names[id] = a.name;
          });

          setEntityNames((prev) => ({ ...prev, ...names }));
        })
        .catch((err) => {
          console.error("Failed to fetch entity names", err);
        });
    }

    setForm({
      title: item.name || "",
      fieldType: item.type?.toLowerCase() === "script" ? "script" : "simple",
      expression: config?.expression || "",
      outputKey: config?.output?.name || "",
      outputType: (config?.output?.type as OutputType) || "TIME_SERIES",
      attributeScope: (config?.output as any)?.attributeScope || "SERVER_SCOPE",
      decimalsByDefault: config?.output?.decimalsByDefault?.toString() || "",
      arguments: mappedArguments,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      title: "",
      fieldType: "simple",
      expression: "",
      outputKey: "",
      outputType: "TIME_SERIES",
      attributeScope: "SERVER_SCOPE",
      decimalsByDefault: "",
      arguments: [],
    });
  };

  const handleFieldTypeChange = (value: FieldType) => {
    setForm((prev) => ({
      ...prev,
      fieldType: value,
      // Script mode does not use output key or decimals fields.
      ...(value === "script"
        ? {
            outputKey: "",
            decimalsByDefault: "",
          }
        : {}),
    }));
  };

  const handleOutputTypeChange = (value: OutputType) => {
    setForm((prev) => ({
      ...prev,
      outputType: value,
      // Scope applies only to attribute output.
      attributeScope:
        value === "ATTRIBUTES" ? prev.attributeScope : "SERVER_SCOPE",
    }));
  };

  const resetArgumentForm = () => {
    setArgumentForm(createEmptyArgumentForm());
    setIsCustomTimeSeriesKey(false);
    setEditingArgumentId(null);
  };

  const handleAddArgument = () => {
    const argumentName = argumentForm.argumentName.trim();
    const keyValue = isCurrentScope(argumentForm.entityType)
      ? argumentForm.timeSeriesKey.trim()
      : argumentForm.name.trim();

    if (!argumentName) {
      toast.error("Argument name is required");
      return;
    }

    if (!keyValue) {
      toast.error(
        isCurrentScope(argumentForm.entityType)
          ? "Time series key is required"
          : "Name is required",
      );
      return;
    }

    if (editingArgumentId) {
      setForm((current) => ({
        ...current,
        arguments: current.arguments.map((arg) =>
          arg.id === editingArgumentId ? { ...arg, ...argumentForm } : arg,
        ),
      }));
    } else {
      setForm((current) => ({
        ...current,
        arguments: [
          ...current.arguments,
          {
            id: createClientId(),
            ...argumentForm,
          },
        ],
      }));
    }

    // Sync entity names to avoid showing ID in table
    if (
      !isCurrentScope(argumentForm.entityType) &&
      argumentForm.refEntityId &&
      argumentForm.name
    ) {
      setEntityNames((prev) => ({
        ...prev,
        [argumentForm.refEntityId]: argumentForm.name,
      }));
    }

    setIsArgumentDialogOpen(false);
    resetArgumentForm();
  };

  const handleEditArgument = (argument: CalculatedFieldArgument) => {
    setEditingArgumentId(argument.id);
    setArgumentForm({
      argumentName: argument.argumentName,
      entityType: argument.entityType,
      argumentType: argument.argumentType,
      refEntityId: argument.refEntityId || "",
      name: argument.name,
      defaultValue: argument.defaultValue,
      timeSeriesKey: argument.timeSeriesKey,
    });
    setIsCustomTimeSeriesKey(false);
    setIsArgumentDialogOpen(true);
  };

  const handleRemoveArgument = (id: string) => {
    setForm((current) => ({
      ...current,
      arguments: current.arguments.filter((argument) => argument.id !== id),
    }));
  };

  const handleCreate = async () => {
    const title = form.title.trim();
    const expression = form.expression.trim();
    const outputKey = form.outputKey.trim();
    const outputType = form.outputType;
    const attributeScope = form.attributeScope;
    const isSimpleMode = form.fieldType === "simple";

    let decimalsByDefault: number | undefined;
    if (isSimpleMode && form.decimalsByDefault.trim()) {
      const parsed = Number(form.decimalsByDefault);
      if (!Number.isInteger(parsed) || parsed < 0 || parsed > 15) {
        toast.error("Decimals by default must be an integer between 0 and 15");
        return;
      }
      decimalsByDefault = parsed;
    }

    if (!title) {
      toast.error("Title is required");
      return;
    }

    if (!expression) {
      toast.error(
        form.fieldType === "simple"
          ? "Expression is required"
          : "Script is required",
      );
      return;
    }

    if (isSimpleMode && !outputKey) {
      toast.error(
        outputType === "TIME_SERIES"
          ? "Time series key is required"
          : "Attribute key is required",
      );
      return;
    }

    if (form.arguments.length === 0) {
      toast.error("Add at least one argument");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        fieldType: form.fieldType,
        expression,
        outputKey: isSimpleMode ? outputKey : undefined,
        outputType,
        attributeScope,
        decimalsByDefault,
        arguments: form.arguments.map((argument) => ({
          argumentName: argument.argumentName,
          entityType: argument.entityType,
          argumentType: argument.argumentType,
          refEntityId: argument.refEntityId,
          timeSeriesKey: argument.timeSeriesKey,
          name: argument.name,
          defaultValue: argument.defaultValue,
        })),
        id: editingId
          ? { id: editingId, entityType: "CALCULATED_FIELD" }
          : undefined,
      };

      await AssetService.createAssetCalculatedField(assetId, payload as any);

      toast.success(
        `Calculated field ${editingId ? "updated" : "created"} successfully`,
      );
      setIsDialogOpen(false);
      resetForm();
      await mutate();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          `Failed to ${editingId ? "update" : "create"} calculated field`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCalculatedField = async (item: AssetCalculatedField) => {
    if (
      !window.confirm(
        `Are you sure you want to delete calculated field "${item.name}"?`,
      )
    ) {
      return;
    }

    try {
      await AssetService.deleteCalculatedField(item.id.id);
      toast.success("Calculated field deleted successfully");
      await mutate();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to delete calculated field",
      );
    }
  };

  return (
    <div className="space-y-4">
      <DataTable
        title="Calculated fields"
        data={filteredCalculatedFields}
        columns={columns}
        getRowId={(row) => row.id.id}
        isLoading={isLoading}
        currentPage={isSearching ? 0 : page}
        pageSize={
          isSearching ? filteredCalculatedFields.length || 10 : pageSize
        }
        totalPages={isSearching ? 1 : data?.totalPages || 0}
        totalElements={
          isSearching
            ? filteredCalculatedFields.length
            : data?.totalElements || 0
        }
        onPageChange={isSearching ? () => {} : setPage}
        onRefresh={mutate}
        rowActions={(row) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEditClick(row)}
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => handleDeleteCalculatedField(row)}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        filterComponent={
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <div className="w-full sm:w-64">
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search calculated field..."
              />
            </div>
          </div>
        }
        emptyMessage={
          isSearching
            ? "No calculated fields match your search."
            : "No calculated fields found for this asset."
        }
        loadingMessage="Loading calculated fields..."
        customAction={
          <Button
            type="button"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
          >
            Add calculated field
          </Button>
        }
      />

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => (!isSubmitting ? setIsDialogOpen(open) : null)}
      >
        <DialogContent className="sm:max-w-190 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit calculated field" : "Add calculated field"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="cf-title">Title*</Label>
              <Input
                id="cf-title"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g. temperature_c"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Type</Label>
              <SelectAdmin
                value={form.fieldType}
                onValueChange={(value) =>
                  handleFieldTypeChange(value as FieldType)
                }
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-55">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple</SelectItem>
                  <SelectItem value="script">Script</SelectItem>
                </SelectContent>
              </SelectAdmin>
            </div>

            <div className="rounded-md border p-3 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base">Arguments*</Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsArgumentDialogOpen(true)}
                  disabled={isSubmitting}
                >
                  Add argument
                </Button>
              </div>

              {form.arguments.length === 0 ? (
                <div className="text-sm text-slate-500">
                  No arguments added yet.
                </div>
              ) : (
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-slate-50">
                        <th className="px-3 py-2 text-left">Name</th>
                        <th className="px-3 py-2 text-left">Entity type</th>
                        <th className="px-3 py-2 text-left">Target entity</th>
                        <th className="px-3 py-2 text-left">Type</th>
                        <th className="px-3 py-2 text-left">Key</th>
                        <th className="px-3 py-2 w-20"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.arguments.map((argument) => {
                        const entityTypeLabel =
                          ENTITY_OPTIONS.find(
                            (opt) => opt.value === argument.entityType,
                          )?.label || argument.entityType;
                        const argTypeLabel =
                          ARGUMENT_TYPE_OPTIONS.find(
                            (opt) => opt.value === argument.argumentType,
                          )?.label || argument.argumentType;

                        return (
                          <tr
                            key={argument.id}
                            className="border-b last:border-b-0"
                          >
                            <td className="px-3 py-2">
                              {argument.argumentName}
                            </td>
                            <td className="px-3 py-2">{entityTypeLabel}</td>
                            <td className="px-3 py-2">
                              {!isCurrentScope(argument.entityType) ? (
                                <span className="text-blue-600">
                                  {entityNames[
                                    argument.refEntityId as string
                                  ] ||
                                    argument.name ||
                                    argument.refEntityId ||
                                    "-"}
                                </span>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="px-3 py-2">{argTypeLabel}</td>
                            <td className="px-3 py-2">
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                                {argument.timeSeriesKey}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditArgument(argument)}
                                  disabled={isSubmitting}
                                  title="Edit"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() =>
                                    handleRemoveArgument(argument.id)
                                  }
                                  disabled={isSubmitting}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M3 6h18" />
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                    <line x1="10" y1="11" x2="10" y2="17" />
                                    <line x1="14" y1="11" x2="14" y2="17" />
                                  </svg>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              {form.fieldType === "simple" ? (
                <>
                  <Label htmlFor="cf-expression">Expression*</Label>
                  <Input
                    id="cf-expression"
                    value={form.expression}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        expression: e.target.value,
                      }))
                    }
                    placeholder="(temperature - 32) / 1.8"
                    disabled={isSubmitting}
                  />
                </>
              ) : (
                <>
                  <ScriptEditor
                    value={form.expression}
                    onChange={(val) =>
                      setForm((prev) => ({ ...prev, expression: val }))
                    }
                    disabled={isSubmitting}
                    minHeight="250px"
                  />
                  <div className="flex justify-end pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={form.arguments.length === 0 || isSubmitting}
                      onClick={() => setIsTestScriptModalOpen(true)}
                      title={form.arguments.length === 0 ? "Add at least one argument to test the script" : ""}
                    >
                      Test Script Function
                    </Button>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div
                className={
                  form.fieldType === "simple" &&
                  form.outputType === "TIME_SERIES"
                    ? "col-span-2 space-y-1.5"
                    : "space-y-1.5"
                }
              >
                <Label>Output type</Label>
                <SelectAdmin
                  value={form.outputType}
                  onValueChange={(value) =>
                    handleOutputTypeChange(value as OutputType)
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select output type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TIME_SERIES">Time series</SelectItem>
                    <SelectItem value="ATTRIBUTES">Attribute</SelectItem>
                  </SelectContent>
                </SelectAdmin>
              </div>

              {form.outputType === "ATTRIBUTES" && (
                <div className="space-y-1.5">
                  <Label>Attribute scope</Label>
                  <SelectAdmin
                    value={form.attributeScope}
                    onValueChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        attributeScope: value as AttributeScope,
                      }))
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select attribute scope" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SERVER_SCOPE">
                        Server attributes
                      </SelectItem>
                      <SelectItem value="SHARED_SCOPE">
                        Shared attributes
                      </SelectItem>
                    </SelectContent>
                  </SelectAdmin>
                </div>
              )}
            </div>

            {form.fieldType === "simple" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cf-output-key">
                    {form.outputType === "TIME_SERIES"
                      ? "Time series key*"
                      : "Attribute key*"}
                  </Label>
                  <Input
                    id="cf-output-key"
                    value={form.outputKey}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        outputKey: e.target.value,
                      }))
                    }
                    placeholder={
                      form.outputType === "TIME_SERIES"
                        ? "e.g. temperatureC"
                        : "e.g. avgTemp"
                    }
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cf-decimals-by-default">
                    Decimals by default
                  </Label>
                  <Input
                    id="cf-decimals-by-default"
                    type="number"
                    min={0}
                    max={15}
                    step={1}
                    value={form.decimalsByDefault}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        decimalsByDefault: e.target.value,
                      }))
                    }
                    placeholder="e.g. 2"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreate}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? editingId
                  ? "Saving..."
                  : "Adding..."
                : editingId
                  ? "Save"
                  : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isArgumentDialogOpen}
        onOpenChange={(open) => {
          if (!isSubmitting) {
            setIsArgumentDialogOpen(open);
            if (!open) {
              resetArgumentForm();
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-155">
          <DialogHeader>
            <DialogTitle>Add argument</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="arg-name">Argument name*</Label>
              <Input
                id="arg-name"
                value={argumentForm.argumentName}
                onChange={(e) =>
                  setArgumentForm((prev) => ({
                    ...prev,
                    argumentName: e.target.value,
                  }))
                }
                placeholder="e.g. a"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Entity type</Label>
              <SelectAdmin
                value={argumentForm.entityType}
                onValueChange={(value) =>
                  setArgumentForm((prev) => ({
                    ...prev,
                    entityType: value as EntityType,
                    timeSeriesKey: "",
                    name: "",
                  }))
                }
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  {ENTITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectAdmin>
            </div>

            <div className="space-y-1.5">
              <Label>Argument type</Label>
              <SelectAdmin
                value={argumentForm.argumentType}
                onValueChange={(value) =>
                  setArgumentForm((prev) => ({
                    ...prev,
                    argumentType: value as ArgumentType,
                    timeSeriesKey: "",
                  }))
                }
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select argument type" />
                </SelectTrigger>
                <SelectContent>
                  {ARGUMENT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectAdmin>
            </div>

            {isCurrentScope(argumentForm.entityType) ? (
              <div className="space-y-1.5">
                <Label htmlFor="arg-time-series-key">Time series key*</Label>
                {argumentForm.entityType === "current_entity" &&
                argumentForm.argumentType === "latest_telemetry" ? (
                  <>
                    <SelectAdmin
                      value={
                        isCustomTimeSeriesKey
                          ? "__custom__"
                          : argumentForm.timeSeriesKey
                      }
                      onValueChange={(value) => {
                        if (value === "__custom__") {
                          setIsCustomTimeSeriesKey(true);
                          setArgumentForm((prev) => ({
                            ...prev,
                            timeSeriesKey: "",
                          }));
                          return;
                        }

                        setIsCustomTimeSeriesKey(false);
                        setArgumentForm((prev) => ({
                          ...prev,
                          timeSeriesKey: value,
                        }));
                      }}
                      disabled={isSubmitting || isTelemetryKeysLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            isTelemetryKeysLoading
                              ? "Loading telemetry keys..."
                              : "Select telemetry key"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {(currentEntityTelemetryKeys || []).map((key) => (
                          <SelectItem key={key} value={key}>
                            {key}
                          </SelectItem>
                        ))}
                        <SelectItem value="__custom__">
                          Custom key...
                        </SelectItem>
                      </SelectContent>
                    </SelectAdmin>

                    {isCustomTimeSeriesKey && (
                      <Input
                        id="arg-time-series-key"
                        value={argumentForm.timeSeriesKey}
                        onChange={(e) =>
                          setArgumentForm((prev) => ({
                            ...prev,
                            timeSeriesKey: e.target.value,
                          }))
                        }
                        placeholder="Type custom telemetry key"
                        disabled={isSubmitting}
                      />
                    )}
                  </>
                ) : (
                  <Input
                    id="arg-time-series-key"
                    value={argumentForm.timeSeriesKey}
                    onChange={(e) =>
                      setArgumentForm((prev) => ({
                        ...prev,
                        timeSeriesKey: e.target.value,
                      }))
                    }
                    placeholder="e.g. temperature"
                    disabled={isSubmitting}
                  />
                )}
                {argumentForm.entityType === "current_entity" &&
                  argumentForm.argumentType === "latest_telemetry" &&
                  isTelemetryKeysLoading && (
                    <p className="text-xs text-slate-500">
                      Loading telemetry keys...
                    </p>
                  )}
                {argumentForm.entityType === "current_entity" &&
                  argumentForm.argumentType === "latest_telemetry" &&
                  telemetryKeysError && (
                    <p className="text-xs text-red-600">
                      Could not load telemetry keys. You can still type a key
                      manually.
                    </p>
                  )}
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="arg-ref-name">Name*</Label>
                <Input
                  id="arg-ref-name"
                  value={argumentForm.name}
                  onChange={(e) =>
                    setArgumentForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="e.g. speed"
                  disabled={isSubmitting}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="arg-default-value">Default value</Label>
              <Input
                id="arg-default-value"
                value={argumentForm.defaultValue}
                onChange={(e) =>
                  setArgumentForm((prev) => ({
                    ...prev,
                    defaultValue: e.target.value,
                  }))
                }
                placeholder="Optional"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsArgumentDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddArgument}
              disabled={isSubmitting}
            >
              Add argument
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isTestScriptModalOpen && (
        <TestScriptModal
          open={isTestScriptModalOpen}
          onClose={() => setIsTestScriptModalOpen(false)}
          onApply={(newVal) =>
            setForm((prev) => ({ ...prev, expression: newVal }))
          }
          expression={form.expression}
          arguments={form.arguments.map((a) => ({
            argumentName: a.argumentName,
            defaultValue: a.defaultValue,
          }))}
        />
      )}
    </div>
  );
}
