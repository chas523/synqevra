"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import { DeviceService, DeviceCalculatedField } from "@/lib/services/thingsboardServices/deviceService";
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
import { Textarea } from "@/components/ui/textarea";
import {
  SelectAdmin,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/admin_select";

interface DeviceCalculatedFieldsTabContentProps {
  deviceId: string;
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
  timeSeriesKey: string;
  name: string;
  defaultValue: string;
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
  timeSeriesKey: "",
  name: "",
  defaultValue: "",
});

export function DeviceCalculatedFieldsTabContent({
  deviceId,
}: DeviceCalculatedFieldsTabContentProps) {
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isArgumentDialogOpen, setIsArgumentDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    createEmptyArgumentForm()
  );
  const [isCustomTimeSeriesKey, setIsCustomTimeSeriesKey] = useState(false);

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
      ? ["deviceLatestTelemetryKeys", deviceId]
      : null,
    async () => DeviceService.fetchDeviceLatestTelemetryKeys(deviceId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 5 * 60 * 1000,
    }
  );

  const { data, isLoading, mutate } = useSWR(
    deviceId ? ["deviceCalculatedFields", deviceId, page, pageSize] : null,
    async () =>
      DeviceService.fetchDeviceCalculatedFields(
        deviceId,
        page,
        pageSize,
        "createdTime",
        "DESC"
      )
  );

  const columns: DataTableColumn<DeviceCalculatedField>[] = useMemo(
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
        render: (item) => item.configuration?.expression || "-",
        className: "font-mono text-sm",
      },
      {
        key: "output",
        header: "Output",
        render: (item) => item.configuration?.output?.name || "-",
      },
    ],
    []
  );

  const resetForm = () => {
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
      attributeScope: value === "ATTRIBUTES" ? prev.attributeScope : "SERVER_SCOPE",
    }));
  };

  const resetArgumentForm = () => {
    setArgumentForm(createEmptyArgumentForm());
    setIsCustomTimeSeriesKey(false);
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
          : "Name is required"
      );
      return;
    }

    setForm((current) => ({
      ...current,
      arguments: [
        ...current.arguments,
        {
          id: crypto.randomUUID(),
          ...argumentForm,
        },
      ],
    }));

    setIsArgumentDialogOpen(false);
    resetArgumentForm();
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
      toast.error(form.fieldType === "simple" ? "Expression is required" : "Script is required");
      return;
    }

    if (isSimpleMode && !outputKey) {
      toast.error(outputType === "TIME_SERIES" ? "Time series key is required" : "Attribute key is required");
      return;
    }

    if (form.arguments.length === 0) {
      toast.error("Add at least one argument");
      return;
    }

    setIsSubmitting(true);
    try {
      await DeviceService.createDeviceCalculatedField(deviceId, {
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
          timeSeriesKey: argument.timeSeriesKey,
          name: argument.name,
          defaultValue: argument.defaultValue,
        })),
      });

      toast.success("Calculated field created successfully");
      setIsDialogOpen(false);
      resetForm();
      await mutate();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to create calculated field"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <DataTable
        title="Calculated fields"
        data={data?.data || []}
        columns={columns}
        getRowId={(row) => row.id.id}
        isLoading={isLoading}
        currentPage={page}
        pageSize={pageSize}
        totalPages={data?.totalPages || 0}
        totalElements={data?.totalElements || 0}
        onPageChange={setPage}
        onRefresh={mutate}
        emptyMessage="No calculated fields found for this device."
        loadingMessage="Loading calculated fields..."
        customAction={
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setIsDialogOpen(true)}
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
            <DialogTitle>Add calculated field</DialogTitle>
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
                onValueChange={(value) => handleFieldTypeChange(value as FieldType)}
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
                <div className="text-sm text-slate-500">No arguments added yet.</div>
              ) : (
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-slate-50">
                        <th className="px-3 py-2 text-left">Name</th>
                        <th className="px-3 py-2 text-left">Key</th>
                        <th className="px-3 py-2 w-30"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.arguments.map((argument) => {
                        const keyLabel = isCurrentScope(argument.entityType)
                          ? argument.timeSeriesKey
                          : argument.name;
                        return (
                          <tr key={argument.id} className="border-b last:border-b-0">
                            <td className="px-3 py-2">{argument.argumentName}</td>
                            <td className="px-3 py-2">{keyLabel}</td>
                            <td className="px-3 py-2 text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleRemoveArgument(argument.id)}
                                disabled={isSubmitting}
                              >
                                Delete
                              </Button>
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
              <Label htmlFor="cf-expression">
                {form.fieldType === "simple" ? "Expression*" : "Script*"}
              </Label>
              {form.fieldType === "simple" ? (
                <Input
                  id="cf-expression"
                  value={form.expression}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, expression: e.target.value }))
                  }
                  placeholder="(temperature - 32) / 1.8"
                  disabled={isSubmitting}
                />
              ) : (
                <Textarea
                  id="cf-expression"
                  value={form.expression}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, expression: e.target.value }))
                  }
                  placeholder="function calculate(ctx, a) { return { result: 1 }; }"
                  disabled={isSubmitting}
                  className="min-h-45 font-mono"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div
                className={
                  form.fieldType === "simple" && form.outputType === "TIME_SERIES"
                    ? "col-span-2 space-y-1.5"
                    : "space-y-1.5"
                }
              >
                <Label>Output type</Label>
                <SelectAdmin
                  value={form.outputType}
                  onValueChange={(value) => handleOutputTypeChange(value as OutputType)}
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
                      <SelectItem value="SERVER_SCOPE">Server attributes</SelectItem>
                      <SelectItem value="SHARED_SCOPE">Shared attributes</SelectItem>
                    </SelectContent>
                  </SelectAdmin>
                </div>
              )}
            </div>

            {form.fieldType === "simple" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cf-output-key">
                    {form.outputType === "TIME_SERIES" ? "Time series key*" : "Attribute key*"}
                  </Label>
                  <Input
                    id="cf-output-key"
                    value={form.outputKey}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, outputKey: e.target.value }))
                    }
                    placeholder={form.outputType === "TIME_SERIES" ? "e.g. temperatureC" : "e.g. avgTemp"}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cf-decimals-by-default">Decimals by default</Label>
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
            <Button type="button" onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add"}
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
                  setArgumentForm((prev) => ({ ...prev, argumentName: e.target.value }))
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
                        <SelectItem value="__custom__">Custom key...</SelectItem>
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
                    <p className="text-xs text-slate-500">Loading telemetry keys...</p>
                  )}
                {argumentForm.entityType === "current_entity" &&
                  argumentForm.argumentType === "latest_telemetry" &&
                  telemetryKeysError && (
                    <p className="text-xs text-red-600">
                      Could not load telemetry keys. You can still type a key manually.
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
            <Button type="button" onClick={handleAddArgument} disabled={isSubmitting}>
              Add argument
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
