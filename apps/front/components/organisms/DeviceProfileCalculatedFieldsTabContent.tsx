"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import {
  CreateCalculatedFieldRequest,
  DeviceCalculatedField,
  DeviceService,
} from "@/lib/services/thingsboardServices/deviceService";
import {
  AssetCalculatedField,
  AssetService,
} from "@/lib/services/thingsboardServices/assetService";
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
import { Textarea } from "@/components/ui/textarea";
import {
  SelectAdmin,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/admin_select";

interface DeviceProfileCalculatedFieldsTabContentProps {
  profileId: string;
  entityType?: "deviceProfile" | "assetProfile";
}

type CalculatedFieldRow = DeviceCalculatedField | AssetCalculatedField;

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
  useLatestTimestamp: boolean;
  decimalsByDefault: string;
  arguments: CalculatedFieldArgument[];
}

interface AddArgumentForm {
  argumentName: string;
  entityType: EntityType;
  argumentType: ArgumentType;
  attributeScope: "SERVER_SCOPE" | "CLIENT_SCOPE" | "SHARED_SCOPE";
  refEntityId: string;
  refEntityName: string;
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
  attributeScope: "SERVER_SCOPE",
  refEntityId: "",
  refEntityName: "",
  timeSeriesKey: "",
  name: "",
  defaultValue: "",
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

const createRequestPayload = (
  form: AddCalculatedFieldForm,
): CreateCalculatedFieldRequest => ({
  title: form.title.trim(),
  fieldType: form.fieldType,
  expression: form.expression.trim(),
  outputKey: form.fieldType === "simple" ? form.outputKey.trim() : undefined,
  outputType: form.outputType,
  attributeScope: form.attributeScope,
  useLatestTimestamp:
    form.outputType === "TIME_SERIES" ? form.useLatestTimestamp : undefined,
  decimalsByDefault: form.decimalsByDefault.trim()
    ? Number(form.decimalsByDefault)
    : undefined,
  arguments: form.arguments.map((argument) => ({
    argumentName: argument.argumentName,
    entityType: argument.entityType,
    argumentType: argument.argumentType,
    refEntityId: argument.refEntityId || undefined,
    timeSeriesKey: argument.timeSeriesKey,
    name: argument.name,
    defaultValue: argument.defaultValue,
  })),
});

export function DeviceProfileCalculatedFieldsTabContent({
  profileId,
  entityType = "deviceProfile",
}: DeviceProfileCalculatedFieldsTabContentProps) {
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
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
    useLatestTimestamp: false,
    decimalsByDefault: "",
    arguments: [],
  });
  const [argumentForm, setArgumentForm] = useState<AddArgumentForm>(
    createEmptyArgumentForm(),
  );
  const [isCustomArgumentKey, setIsCustomArgumentKey] = useState(false);
  const [hasRequestedTelemetryKeys, setHasRequestedTelemetryKeys] =
    useState(false);
  const [hasRequestedAttributeKeys, setHasRequestedAttributeKeys] =
    useState(false);
  const [hasRequestedReferenceEntities, setHasRequestedReferenceEntities] =
    useState(false);
  const [hasRequestedReferenceEntityKeys, setHasRequestedReferenceEntityKeys] =
    useState(false);

  const shouldFetchCurrentEntityTelemetryKeys =
    isArgumentDialogOpen &&
    hasRequestedTelemetryKeys &&
    argumentForm.entityType === "current_entity" &&
    argumentForm.argumentType === "latest_telemetry";

  const shouldFetchCurrentEntityAttributeKeys =
    isArgumentDialogOpen &&
    hasRequestedAttributeKeys &&
    argumentForm.entityType === "current_entity" &&
    argumentForm.argumentType === "attribute";

  const nonCurrentReferenceType =
    argumentForm.entityType === "device" ||
    argumentForm.entityType === "asset" ||
    argumentForm.entityType === "customer"
      ? argumentForm.entityType
      : null;

  const shouldFetchReferenceEntities =
    isArgumentDialogOpen &&
    hasRequestedReferenceEntities &&
    !!nonCurrentReferenceType;

  const shouldFetchReferenceEntityKeys =
    isArgumentDialogOpen &&
    hasRequestedReferenceEntityKeys &&
    !!nonCurrentReferenceType &&
    !!argumentForm.refEntityId;

  const {
    data: currentEntityTelemetryKeys,
    isLoading: isTelemetryKeysLoading,
    error: telemetryKeysError,
  } = useSWR(
    shouldFetchCurrentEntityTelemetryKeys
      ? ["profileLatestTelemetryKeys", entityType, profileId]
      : null,
    async () =>
      entityType === "assetProfile"
        ? AssetService.fetchAssetProfileLatestTelemetryKeys(profileId)
        : DeviceService.fetchDeviceProfileLatestTelemetryKeys(profileId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 5 * 60 * 1000,
    },
  );

  const {
    data: currentEntityAttributeKeys,
    isLoading: isAttributeKeysLoading,
    error: attributeKeysError,
  } = useSWR(
    shouldFetchCurrentEntityAttributeKeys
      ? [
          "profileAttributeKeys",
          entityType,
          profileId,
          argumentForm.attributeScope,
        ]
      : null,
    async () =>
      entityType === "assetProfile"
        ? AssetService.fetchAssetProfileAttributeKeys(
            profileId,
            argumentForm.attributeScope,
          )
        : DeviceService.fetchDeviceProfileAttributeKeys(
            profileId,
            argumentForm.attributeScope,
          ),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 5 * 60 * 1000,
    },
  );

  const {
    data: referenceEntities,
    isLoading: isReferenceEntitiesLoading,
    error: referenceEntitiesError,
  } = useSWR(
    shouldFetchReferenceEntities
      ? ["cfReferenceEntities", nonCurrentReferenceType]
      : null,
    async () =>
      DeviceService.fetchReferenceEntitiesByType(nonCurrentReferenceType!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 5 * 60 * 1000,
    },
  );

  const {
    data: referenceEntityKeys,
    isLoading: isReferenceEntityKeysLoading,
    error: referenceEntityKeysError,
  } = useSWR(
    shouldFetchReferenceEntityKeys
      ? [
          "cfReferenceEntityKeys",
          nonCurrentReferenceType,
          argumentForm.refEntityId,
          argumentForm.argumentType,
          argumentForm.attributeScope,
        ]
      : null,
    async () => {
      const entityTypeMap = {
        device: "DEVICE",
        asset: "ASSET",
        customer: "CUSTOMER",
      } as const;

      return DeviceService.fetchReferenceEntityKeys(
        entityTypeMap[nonCurrentReferenceType!],
        argumentForm.refEntityId,
        argumentForm.argumentType,
        argumentForm.attributeScope,
      );
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 5 * 60 * 1000,
    },
  );

  const { data, isLoading, mutate } = useSWR(
    profileId
      ? ["profileCalculatedFields", entityType, profileId, page, pageSize]
      : null,
    async () =>
      entityType === "assetProfile"
        ? AssetService.fetchAssetProfileCalculatedFields(
            profileId,
            page,
            pageSize,
            "createdTime",
            "DESC",
          )
        : DeviceService.fetchDeviceProfileCalculatedFields(
            profileId,
            page,
            pageSize,
            "createdTime",
            "DESC",
          ),
  );

  const columns: DataTableColumn<CalculatedFieldRow>[] = useMemo(
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

  const resetForm = () => {
    setForm({
      title: "",
      fieldType: "simple",
      expression: "",
      outputKey: "",
      outputType: "TIME_SERIES",
      attributeScope: "SERVER_SCOPE",
      useLatestTimestamp: false,
      decimalsByDefault: "",
      arguments: [],
    });
  };

  const resetArgumentForm = () => {
    setArgumentForm(createEmptyArgumentForm());
    setIsCustomArgumentKey(false);
    setHasRequestedTelemetryKeys(false);
    setHasRequestedAttributeKeys(false);
    setHasRequestedReferenceEntities(false);
    setHasRequestedReferenceEntityKeys(false);
  };

  const handleFieldTypeChange = (value: FieldType) => {
    setForm((prev) => ({
      ...prev,
      fieldType: value,
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
      attributeScope:
        value === "ATTRIBUTES" ? prev.attributeScope : "SERVER_SCOPE",
      useLatestTimestamp:
        value === "TIME_SERIES" ? prev.useLatestTimestamp : false,
    }));
  };

  const handleAddArgument = () => {
    const argumentName = argumentForm.argumentName.trim();
    const keyValue = argumentForm.timeSeriesKey.trim();

    if (!argumentName) {
      toast.error("Argument name is required");
      return;
    }

    if (!keyValue) {
      toast.error(
        argumentForm.argumentType === "attribute"
          ? "Attribute key is required"
          : "Time series key is required",
      );
      return;
    }

    if (!isCurrentScope(argumentForm.entityType) && !argumentForm.refEntityId) {
      toast.error("Name is required");
      return;
    }

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
    const isSimpleMode = form.fieldType === "simple";

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
        form.outputType === "TIME_SERIES"
          ? "Time series key is required"
          : "Attribute key is required",
      );
      return;
    }

    if (form.arguments.length === 0) {
      toast.error("Add at least one argument");
      return;
    }

    if (isSimpleMode && form.decimalsByDefault.trim()) {
      const parsed = Number(form.decimalsByDefault);
      if (!Number.isInteger(parsed) || parsed < 0 || parsed > 15) {
        toast.error("Decimals by default must be an integer between 0 and 15");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (entityType === "assetProfile") {
        await AssetService.createAssetProfileCalculatedField(
          profileId,
          createRequestPayload(form),
        );
      } else {
        await DeviceService.createDeviceProfileCalculatedField(
          profileId,
          createRequestPayload(form),
        );
      }

      toast.success("Calculated field created successfully");
      setIsDialogOpen(false);
      resetForm();
      await mutate();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to create calculated field",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <DataTable
        title="Calculated fields"
        data={filteredCalculatedFields}
        columns={columns}
        getRowId={(item) => item.id?.id || `${item.createdTime}-${item.name}`}
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
            : "No calculated fields found for this profile."
        }
        loadingMessage="Loading calculated fields..."
        customAction={
          <Button
            type="button"
            className="bg-blue-600 text-white hover:bg-blue-700"
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
            <DialogDescription className="sr-only">
              Configure a new calculated field for this device profile.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <section className="rounded-md border p-4 space-y-3">
              <h3 className="text-base font-medium">General</h3>

              <div className="space-y-1.5">
                <Label htmlFor="profile-cf-title">Title*</Label>
                <Input
                  id="profile-cf-title"
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
            </section>

            <section className="rounded-md border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium">Arguments*</h3>
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
                        <th className="px-3 py-2 text-left">Key</th>
                        <th className="px-3 py-2 w-30"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.arguments.map((argument) => {
                        const keyLabel = argument.timeSeriesKey;
                        return (
                          <tr
                            key={argument.id}
                            className="border-b last:border-b-0"
                          >
                            <td className="px-3 py-2">
                              {argument.argumentName}
                            </td>
                            <td className="px-3 py-2">{keyLabel}</td>
                            <td className="px-3 py-2 text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700"
                                onClick={() =>
                                  handleRemoveArgument(argument.id)
                                }
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
            </section>

            <section className="rounded-md border p-4 space-y-3">
              <h3 className="text-base font-medium">Expression</h3>
              <Label htmlFor="profile-cf-expression">
                {form.fieldType === "simple" ? "Expression*" : "Script*"}
              </Label>
              {form.fieldType === "simple" ? (
                <Input
                  id="profile-cf-expression"
                  value={form.expression}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, expression: e.target.value }))
                  }
                  placeholder="(temperature - 32) / 1.8"
                  disabled={isSubmitting}
                />
              ) : (
                <Textarea
                  id="profile-cf-expression"
                  value={form.expression}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, expression: e.target.value }))
                  }
                  placeholder="function calculate(ctx, a) { return { result: 1 }; }"
                  disabled={isSubmitting}
                  className="min-h-45 font-mono"
                />
              )}
            </section>

            <section className="rounded-md border p-4 space-y-3">
              <h3 className="text-base font-medium">Output</h3>

              <div className="space-y-1.5">
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="profile-cf-output-key">
                    {form.outputType === "TIME_SERIES"
                      ? "Time series key*"
                      : "Attribute key*"}
                  </Label>
                  <Input
                    id="profile-cf-output-key"
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
                  <Label htmlFor="profile-cf-decimals-by-default">
                    Decimals by default
                  </Label>
                  <Input
                    id="profile-cf-decimals-by-default"
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

              {form.outputType === "TIME_SERIES" && (
                <div className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="profile-cf-use-latest-timestamp"
                      className="text-sm"
                    >
                      Use latest timestamp
                    </Label>
                    <p className="text-xs text-slate-500">
                      Use the newest source timestamp for calculated output.
                    </p>
                  </div>
                  <Switch
                    id="profile-cf-use-latest-timestamp"
                    checked={form.useLatestTimestamp}
                    onCheckedChange={(checked) =>
                      setForm((prev) => ({
                        ...prev,
                        useLatestTimestamp: checked,
                      }))
                    }
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </section>
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
            <DialogDescription className="sr-only">
              Define argument source and key for this calculated field.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="profile-arg-name">Argument name*</Label>
              <Input
                id="profile-arg-name"
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
                    attributeScope: "SERVER_SCOPE",
                    refEntityId: "",
                    refEntityName: "",
                    timeSeriesKey: "",
                    name: "",
                  }))
                }
                onOpenChange={() => {
                  setIsCustomArgumentKey(false);
                  setHasRequestedTelemetryKeys(false);
                  setHasRequestedAttributeKeys(false);
                  setHasRequestedReferenceEntities(false);
                  setHasRequestedReferenceEntityKeys(false);
                }}
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
                    attributeScope: "SERVER_SCOPE",
                    refEntityId: "",
                    refEntityName: "",
                    timeSeriesKey: "",
                    name: "",
                  }))
                }
                onOpenChange={() => {
                  setIsCustomArgumentKey(false);
                  setHasRequestedTelemetryKeys(false);
                  setHasRequestedAttributeKeys(false);
                  setHasRequestedReferenceEntityKeys(false);
                }}
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

            {argumentForm.argumentType === "attribute" &&
              (argumentForm.entityType === "current_entity" ||
                argumentForm.entityType === "device") && (
                <div className="space-y-1.5">
                  <Label>Attribute scope</Label>
                  <SelectAdmin
                    value={argumentForm.attributeScope}
                    onValueChange={(value) =>
                      setArgumentForm((prev) => ({
                        ...prev,
                        attributeScope: value as
                          | "SERVER_SCOPE"
                          | "CLIENT_SCOPE"
                          | "SHARED_SCOPE",
                        timeSeriesKey: "",
                      }))
                    }
                    onOpenChange={() => {
                      setIsCustomArgumentKey(false);
                      setHasRequestedAttributeKeys(false);
                      setHasRequestedReferenceEntityKeys(false);
                    }}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select attribute scope" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLIENT_SCOPE">
                        Client attributes
                      </SelectItem>
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

            {isCurrentScope(argumentForm.entityType) ? (
              <div className="space-y-1.5">
                <Label htmlFor="profile-arg-time-series-key">
                  {argumentForm.argumentType === "attribute"
                    ? "Attribute key*"
                    : "Time series key*"}
                </Label>

                {argumentForm.entityType === "current_entity" ? (
                  <>
                    <SelectAdmin
                      value={
                        isCustomArgumentKey
                          ? "__custom__"
                          : argumentForm.timeSeriesKey
                      }
                      onOpenChange={(open) => {
                        if (!open) {
                          return;
                        }

                        if (argumentForm.argumentType === "attribute") {
                          setHasRequestedAttributeKeys(true);
                          return;
                        }

                        setHasRequestedTelemetryKeys(true);
                      }}
                      onValueChange={(value) => {
                        if (value === "__custom__") {
                          setIsCustomArgumentKey(true);
                          setArgumentForm((prev) => ({
                            ...prev,
                            timeSeriesKey: "",
                          }));
                          return;
                        }

                        setIsCustomArgumentKey(false);
                        setArgumentForm((prev) => ({
                          ...prev,
                          timeSeriesKey: value,
                        }));
                      }}
                      disabled={
                        isSubmitting ||
                        (argumentForm.argumentType === "attribute"
                          ? isAttributeKeysLoading
                          : isTelemetryKeysLoading)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            argumentForm.argumentType === "attribute"
                              ? isAttributeKeysLoading
                                ? "Loading attribute keys..."
                                : "Select attribute key"
                              : isTelemetryKeysLoading
                                ? "Loading telemetry keys..."
                                : "Select telemetry key"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {(argumentForm.argumentType === "attribute"
                          ? currentEntityAttributeKeys || []
                          : currentEntityTelemetryKeys || []
                        ).map((key) => (
                          <SelectItem key={key} value={key}>
                            {key}
                          </SelectItem>
                        ))}
                        <SelectItem value="__custom__">
                          Custom key...
                        </SelectItem>
                      </SelectContent>
                    </SelectAdmin>

                    {isCustomArgumentKey && (
                      <Input
                        id="profile-arg-time-series-key"
                        value={argumentForm.timeSeriesKey}
                        onChange={(e) =>
                          setArgumentForm((prev) => ({
                            ...prev,
                            timeSeriesKey: e.target.value,
                          }))
                        }
                        placeholder={
                          argumentForm.argumentType === "attribute"
                            ? "Type custom attribute key"
                            : "Type custom telemetry key"
                        }
                        disabled={isSubmitting}
                      />
                    )}

                    {argumentForm.argumentType === "latest_telemetry" &&
                      isTelemetryKeysLoading && (
                        <p className="text-xs text-slate-500">
                          Loading telemetry keys...
                        </p>
                      )}

                    {argumentForm.argumentType === "latest_telemetry" &&
                      telemetryKeysError && (
                        <p className="text-xs text-red-600">
                          Could not load telemetry keys. You can still type a
                          key manually.
                        </p>
                      )}

                    {argumentForm.argumentType === "attribute" &&
                      isAttributeKeysLoading && (
                        <p className="text-xs text-slate-500">
                          Loading attribute keys...
                        </p>
                      )}

                    {argumentForm.argumentType === "attribute" &&
                      attributeKeysError && (
                        <p className="text-xs text-red-600">
                          Could not load attribute keys. You can still type a
                          key manually.
                        </p>
                      )}
                  </>
                ) : (
                  <Input
                    id="profile-arg-time-series-key"
                    value={argumentForm.timeSeriesKey}
                    onChange={(e) =>
                      setArgumentForm((prev) => ({
                        ...prev,
                        timeSeriesKey: e.target.value,
                      }))
                    }
                    placeholder={
                      argumentForm.argumentType === "attribute"
                        ? "e.g. firmwareVersion"
                        : "e.g. temperature"
                    }
                    disabled={isSubmitting}
                  />
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Name*</Label>
                  <SelectAdmin
                    value={argumentForm.refEntityId}
                    onOpenChange={(open) => {
                      if (open) {
                        setHasRequestedReferenceEntities(true);
                      }
                    }}
                    onValueChange={(value) => {
                      const selectedEntity = (referenceEntities || []).find(
                        (item) => item.id === value,
                      );

                      setIsCustomArgumentKey(false);
                      setHasRequestedReferenceEntityKeys(false);
                      setArgumentForm((prev) => ({
                        ...prev,
                        refEntityId: value,
                        refEntityName: selectedEntity?.name || "",
                        name: selectedEntity?.name || "",
                        timeSeriesKey: "",
                      }));
                    }}
                    disabled={isSubmitting || isReferenceEntitiesLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          isReferenceEntitiesLoading
                            ? "Loading names..."
                            : "Select name"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {(referenceEntities || []).map((entity) => (
                        <SelectItem key={entity.id} value={entity.id}>
                          {entity.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectAdmin>

                  {referenceEntitiesError && (
                    <p className="text-xs text-red-600">
                      Could not load names.
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="profile-arg-time-series-key">
                    {argumentForm.argumentType === "attribute"
                      ? "Attribute key*"
                      : "Time series key*"}
                  </Label>

                  <SelectAdmin
                    value={
                      isCustomArgumentKey
                        ? "__custom__"
                        : argumentForm.timeSeriesKey
                    }
                    onOpenChange={(open) => {
                      if (open) {
                        setHasRequestedReferenceEntityKeys(true);
                      }
                    }}
                    onValueChange={(value) => {
                      if (value === "__custom__") {
                        setIsCustomArgumentKey(true);
                        setArgumentForm((prev) => ({
                          ...prev,
                          timeSeriesKey: "",
                        }));
                        return;
                      }

                      setIsCustomArgumentKey(false);
                      setArgumentForm((prev) => ({
                        ...prev,
                        timeSeriesKey: value,
                      }));
                    }}
                    disabled={
                      isSubmitting ||
                      !argumentForm.refEntityId ||
                      isReferenceEntityKeysLoading
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          !argumentForm.refEntityId
                            ? "Select name first"
                            : isReferenceEntityKeysLoading
                              ? argumentForm.argumentType === "attribute"
                                ? "Loading attribute keys..."
                                : "Loading telemetry keys..."
                              : argumentForm.argumentType === "attribute"
                                ? "Select attribute key"
                                : "Select telemetry key"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {(referenceEntityKeys || []).map((key) => (
                        <SelectItem key={key} value={key}>
                          {key}
                        </SelectItem>
                      ))}
                      <SelectItem value="__custom__">Custom key...</SelectItem>
                    </SelectContent>
                  </SelectAdmin>

                  {isCustomArgumentKey && (
                    <Input
                      id="profile-arg-time-series-key"
                      value={argumentForm.timeSeriesKey}
                      onChange={(e) =>
                        setArgumentForm((prev) => ({
                          ...prev,
                          timeSeriesKey: e.target.value,
                        }))
                      }
                      placeholder={
                        argumentForm.argumentType === "attribute"
                          ? "Type custom attribute key"
                          : "Type custom telemetry key"
                      }
                      disabled={isSubmitting}
                    />
                  )}

                  {referenceEntityKeysError && (
                    <p className="text-xs text-red-600">
                      Could not load keys. You can still type a custom key.
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="profile-arg-default-value">Default value</Label>
              <Input
                id="profile-arg-default-value"
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
    </div>
  );
}
