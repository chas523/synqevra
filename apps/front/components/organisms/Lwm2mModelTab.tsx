"use client";

import Editor from "@monaco-editor/react";
import {
  Lwm2mObjectListField,
  type Lwm2mObjectOption,
} from "@/components/molecules/Lwm2mObjectListField";
import Select from "@/components/molecules/PortalSelect";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";

type Lwm2mTab = "model" | "bootstrap" | "other" | "json";
type Lwm2mObserveStrategy = "SINGLE" | "COMPOSITE_ALL" | "COMPOSITE_BY_OBJECT";
type PowerMode = "DRX" | "EDRX" | "PSM";
type TimeUnit = "MILLISECONDS" | "SECONDS" | "MINUTES" | "HOURS";
type Lwm2mFirmwareUpdateStrategy = "1" | "2" | "3";
type Lwm2mSoftwareUpdateStrategy = "1" | "2";
type Lwm2mDefaultObjectVersion = "1.0" | "1.1" | "1.2";
type Lwm2mSecurityMode = "NO_SEC" | "PSK" | "RPK" | "X509_CERT";

type Lwm2mResourceConfig = {
  id: number;
  name: string;
  keyName: string;
  attribute: boolean;
  telemetry: boolean;
  observe: boolean;
};

type Lwm2mObjectConfig = {
  keyId: string;
  name: string;
  multiple: boolean;
  instances: number[];
  resources: Lwm2mResourceConfig[];
  instanceResources: Record<number, Lwm2mResourceConfig[]>;
  objectAttributes: {
    minimumPeriod?: number;
    maximumPeriod?: number;
  };
  instanceAttributes: Record<
    number,
    {
      minimumPeriod?: number;
      maximumPeriod?: number;
    }
  >;
};

type Lwm2mBootstrapServerConfig = {
  id: string;
  shortServerId: string;
  bootstrapServerIs: boolean;
  host: string;
  port: string;
  clientHoldOffTime: string;
  serverPublicKey: string;
  serverCertificate: string;
  bootstrapServerAccountTimeout: string;
  lifetime: string;
  defaultMinPeriod: string;
  notifIfDisabled: boolean;
  binding: string;
  securityMode: string;
};

type Lwm2mFormSlice = {
  lwm2mActiveTab: Lwm2mTab;
  lwm2mObjectList: Array<{ keyId: string; name: string }>;
  lwm2mObjectConfigs: Lwm2mObjectConfig[];
  lwm2mObserveStrategy: Lwm2mObserveStrategy;
  lwm2mPowerMode: PowerMode;
  lwm2mPsmActivityTimer: string;
  lwm2mPsmActivityTimerTimeUnit: TimeUnit;
  lwm2mEdrxCycle: string;
  lwm2mEdrxCycleTimeUnit: TimeUnit;
  lwm2mPagingTransmissionWindow: string;
  lwm2mPagingTransmissionWindowTimeUnit: TimeUnit;
  lwm2mUseObject19ForOtaInfo: boolean;
  lwm2mFirmwareUpdateStrategy: Lwm2mFirmwareUpdateStrategy;
  lwm2mFirmwareUpdateCoapResource: string;
  lwm2mSoftwareUpdateStrategy: Lwm2mSoftwareUpdateStrategy;
  lwm2mSoftwareUpdateCoapResource: string;
  lwm2mDefaultObjectVersion: Lwm2mDefaultObjectVersion;
  lwm2mBootstrapServerUpdateEnable: boolean;
  lwm2mBootstrapServers: Lwm2mBootstrapServerConfig[];
  lwm2mJsonConfig: string;
};

type Lwm2mModelTabProps = {
  formState: Lwm2mFormSlice;
  lwm2mTabOptions: Array<{ value: Lwm2mTab; label: string }>;
  powerModeOptions: Array<{ value: PowerMode; label: string }>;
  timeUnitOptions: Array<{ value: TimeUnit; label: string }>;
  lwm2mFirmwareUpdateStrategyOptions: Array<{
    value: Lwm2mFirmwareUpdateStrategy;
    label: string;
    description?: string;
  }>;
  lwm2mSoftwareUpdateStrategyOptions: Array<{
    value: Lwm2mSoftwareUpdateStrategy;
    label: string;
    description?: string;
  }>;
  lwm2mDefaultObjectVersionOptions: Array<{
    value: Lwm2mDefaultObjectVersion;
    label: string;
  }>;
  lwm2mObjectOptions: Lwm2mObjectOption[];
  lwm2mObjectSearch: string;
  isLoadingLwm2mObjects: boolean;
  isSaving: boolean;
  expandedLwm2mObjectKeys: Set<string>;
  editorTheme: "light" | "vs-dark";
  onLwm2mTabChange: (tab: Lwm2mTab) => void;
  onLwm2mSearchChange: (value: string) => void;
  onAddLwm2mObject: (option: Lwm2mObjectOption) => void;
  onRemoveLwm2mObject: (keyId: string) => void;
  onObserveStrategyChange: (strategy: Lwm2mObserveStrategy) => void;
  onToggleLwm2mObjectExpanded: (keyId: string) => void;
  onOpenInstanceDialog: (objectKeyId: string) => void;
  onOpenObjectAttributesDialog: (objectKeyId: string) => void;
  onOpenInstanceAttributesDialog: (
    objectKeyId: string,
    instanceId: number,
  ) => void;
  onToggleLwm2mInstanceBulk: (
    objectKeyId: string,
    instanceId: number,
    mode: "attribute" | "telemetry" | "observe",
    checked: boolean,
  ) => void;
  onToggleLwm2mResourceFlag: (
    objectKeyId: string,
    instanceId: number,
    resourceId: number,
    flag: "attribute" | "telemetry" | "observe",
    checked: boolean,
  ) => void;
  onLwm2mResourceKeyNameChange: (
    objectKeyId: string,
    instanceId: number,
    resourceId: number,
    value: string,
  ) => void;
  onToggleBootstrapServerUpdates: (checked: boolean) => void;
  onAddLwm2mBootstrapServer: () => void;
  onRemoveLwm2mBootstrapServer: (serverId: string) => void;
  onToggleLwm2mBootstrapServerExpanded: (serverId: string) => void;
  onUpdateLwm2mBootstrapServer: (
    serverId: string,
    field: keyof Lwm2mBootstrapServerConfig,
    value: string | boolean,
  ) => void;
  expandedLwm2mBootstrapServerIds: Set<string>;
  onPowerModeChange: (powerMode: PowerMode) => void;
  onLwm2mPsmActivityTimerChange: (value: string) => void;
  onLwm2mPsmActivityTimerTimeUnitChange: (unit: TimeUnit) => void;
  onLwm2mEdrxCycleChange: (value: string) => void;
  onLwm2mEdrxCycleTimeUnitChange: (unit: TimeUnit) => void;
  onLwm2mPagingTransmissionWindowChange: (value: string) => void;
  onLwm2mPagingTransmissionWindowTimeUnitChange: (unit: TimeUnit) => void;
  onLwm2mUseObject19ForOtaInfoChange: (checked: boolean) => void;
  onLwm2mFirmwareUpdateStrategyChange: (
    strategy: Lwm2mFirmwareUpdateStrategy,
  ) => void;
  onLwm2mFirmwareUpdateCoapResourceChange: (value: string) => void;
  onLwm2mSoftwareUpdateStrategyChange: (
    strategy: Lwm2mSoftwareUpdateStrategy,
  ) => void;
  onLwm2mSoftwareUpdateCoapResourceChange: (value: string) => void;
  onLwm2mDefaultObjectVersionChange: (
    version: Lwm2mDefaultObjectVersion,
  ) => void;
  onLwm2mJsonChange: (value: string) => void;
};

export function Lwm2mModelTab({
  formState,
  lwm2mTabOptions,
  powerModeOptions,
  timeUnitOptions,
  lwm2mFirmwareUpdateStrategyOptions,
  lwm2mSoftwareUpdateStrategyOptions,
  lwm2mDefaultObjectVersionOptions,
  lwm2mObjectOptions,
  lwm2mObjectSearch,
  isLoadingLwm2mObjects,
  isSaving,
  expandedLwm2mObjectKeys,
  editorTheme,
  onLwm2mTabChange,
  onLwm2mSearchChange,
  onAddLwm2mObject,
  onRemoveLwm2mObject,
  onObserveStrategyChange,
  onToggleLwm2mObjectExpanded,
  onOpenInstanceDialog,
  onOpenObjectAttributesDialog,
  onOpenInstanceAttributesDialog,
  onToggleLwm2mInstanceBulk,
  onToggleLwm2mResourceFlag,
  onLwm2mResourceKeyNameChange,
  onToggleBootstrapServerUpdates,
  onAddLwm2mBootstrapServer,
  onRemoveLwm2mBootstrapServer,
  onToggleLwm2mBootstrapServerExpanded,
  onUpdateLwm2mBootstrapServer,
  expandedLwm2mBootstrapServerIds,
  onPowerModeChange,
  onLwm2mPsmActivityTimerChange,
  onLwm2mPsmActivityTimerTimeUnitChange,
  onLwm2mEdrxCycleChange,
  onLwm2mEdrxCycleTimeUnitChange,
  onLwm2mPagingTransmissionWindowChange,
  onLwm2mPagingTransmissionWindowTimeUnitChange,
  onLwm2mUseObject19ForOtaInfoChange,
  onLwm2mFirmwareUpdateStrategyChange,
  onLwm2mFirmwareUpdateCoapResourceChange,
  onLwm2mSoftwareUpdateStrategyChange,
  onLwm2mSoftwareUpdateCoapResourceChange,
  onLwm2mDefaultObjectVersionChange,
  onLwm2mJsonChange,
}: Lwm2mModelTabProps) {
  const selectedFirmwareUpdateStrategy =
    lwm2mFirmwareUpdateStrategyOptions.find(
      (option) => option.value === formState.lwm2mFirmwareUpdateStrategy,
    );
  const selectedSoftwareUpdateStrategy =
    lwm2mSoftwareUpdateStrategyOptions.find(
      (option) => option.value === formState.lwm2mSoftwareUpdateStrategy,
    );

  return (
    <div className="space-y-4 rounded-lg border border-muted p-4">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {lwm2mTabOptions.map((tab) => {
          const isActive = formState.lwm2mActiveTab === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              className={[
                "rounded-md border-b-2 px-3 py-2 text-left text-sm",
                isActive
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              ].join(" ")}
              onClick={() => onLwm2mTabChange(tab.value)}
              disabled={isSaving}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {formState.lwm2mActiveTab === "model" && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Object list</label>
            <Lwm2mObjectListField
              options={lwm2mObjectOptions}
              selected={formState.lwm2mObjectList}
              searchValue={lwm2mObjectSearch}
              onSearchChange={onLwm2mSearchChange}
              onAdd={onAddLwm2mObject}
              onRemove={onRemoveLwm2mObject}
              isLoading={isLoadingLwm2mObjects}
              disabled={isSaving}
            />
          </div>

          {formState.lwm2mObjectList.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Observe strategy</label>
              <Select
                options={[
                  {
                    value: "SINGLE",
                    label: "Single",
                  },
                  {
                    value: "COMPOSITE_ALL",
                    label: "Composite all",
                  },
                  {
                    value: "COMPOSITE_BY_OBJECT",
                    label: "Composite by objects",
                  },
                ]}
                value={formState.lwm2mObserveStrategy}
                onValueChange={(value) =>
                  onObserveStrategyChange(
                    (value as Lwm2mObserveStrategy) ?? "SINGLE",
                  )
                }
                disabled={isSaving}
              />
              <p className="text-xs text-muted-foreground">
                {formState.lwm2mObserveStrategy === "SINGLE" &&
                  "One Observe request per resource (higher precision, more network traffic)"}
                {formState.lwm2mObserveStrategy === "COMPOSITE_ALL" &&
                  "All resources are observed with a single Composite Observe request (more efficient, less flexible)"}
                {formState.lwm2mObserveStrategy === "COMPOSITE_BY_OBJECT" &&
                  "Resources are grouped by object type and observed using separate Composite Observe requests (balanced approach)"}
              </p>
            </div>
          )}

          {formState.lwm2mObjectConfigs.length > 0 && (
            <div className="space-y-3">
              {formState.lwm2mObjectConfigs.map((objectConfig) => {
                const isExpanded = expandedLwm2mObjectKeys.has(
                  objectConfig.keyId,
                );
                const hasObjectAttributes =
                  Object.keys(objectConfig.objectAttributes ?? {}).length > 0;

                return (
                  <div
                    key={objectConfig.keyId}
                    className="rounded-lg border border-muted"
                  >
                    <div className="flex items-center justify-between gap-2 bg-muted/30 px-4 py-3">
                      <div className="text-sm font-semibold">{`${objectConfig.name} #${objectConfig.keyId}`}</div>

                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          title="Edit object attributes"
                          aria-label="Edit object attributes"
                          onClick={() =>
                            onOpenObjectAttributesDialog(objectConfig.keyId)
                          }
                          disabled={isSaving}
                        >
                          <Pencil
                            className={`h-4 w-4 ${
                              hasObjectAttributes
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          />
                        </Button>
                        {objectConfig.multiple && (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground"
                              title="Add instance"
                              aria-label="Add instance"
                              onClick={() =>
                                onOpenInstanceDialog(objectConfig.keyId)
                              }
                              disabled={isSaving}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() =>
                            onToggleLwm2mObjectExpanded(objectConfig.keyId)
                          }
                          disabled={isSaving}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="space-y-2 border-t border-muted p-4">
                        {objectConfig.instances.map((instanceId) => {
                          const instanceResources =
                            objectConfig.instanceResources?.[instanceId] ??
                            objectConfig.resources;
                          const hasInstanceSelectedResources =
                            instanceResources.some(
                              (resource) =>
                                resource.attribute || resource.telemetry,
                            );
                          const hasInstanceAttributes =
                            Object.keys(
                              objectConfig.instanceAttributes?.[instanceId] ??
                                {},
                            ).length > 0;
                          const allAttributesChecked =
                            instanceResources.length > 0 &&
                            instanceResources.every(
                              (resource) => resource.attribute,
                            );
                          const allTelemetryChecked =
                            instanceResources.length > 0 &&
                            instanceResources.every(
                              (resource) => resource.telemetry,
                            );
                          const allowAllObserve =
                            allAttributesChecked || allTelemetryChecked;
                          const allObserveChecked =
                            allowAllObserve &&
                            instanceResources.length > 0 &&
                            instanceResources.every((resource) =>
                              !resource.attribute && !resource.telemetry
                                ? true
                                : resource.observe,
                            );

                          return (
                            <div
                              key={`${objectConfig.keyId}-${instanceId}`}
                              className="rounded-md border"
                            >
                              <div className="flex items-center justify-between border-b bg-muted/20 px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <div className="text-sm font-medium">{`Instance #${instanceId}`}</div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    disabled={
                                      isSaving || !hasInstanceSelectedResources
                                    }
                                    title="Add/Edit instance attributes"
                                    aria-label="Add/Edit instance attributes"
                                    onClick={() =>
                                      onOpenInstanceAttributesDialog(
                                        objectConfig.keyId,
                                        instanceId,
                                      )
                                    }
                                  >
                                    <Plus
                                      className={`h-4 w-4 ${
                                        hasInstanceAttributes
                                          ? "text-foreground"
                                          : "text-muted-foreground"
                                      }`}
                                    />
                                  </Button>
                                </div>
                                <div className="flex items-center gap-6">
                                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Checkbox
                                      checked={allAttributesChecked}
                                      disabled={isSaving}
                                      onCheckedChange={(checked) =>
                                        onToggleLwm2mInstanceBulk(
                                          objectConfig.keyId,
                                          instanceId,
                                          "attribute",
                                          Boolean(checked),
                                        )
                                      }
                                    />
                                    All attributes
                                  </label>
                                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Checkbox
                                      checked={allTelemetryChecked}
                                      disabled={isSaving}
                                      onCheckedChange={(checked) =>
                                        onToggleLwm2mInstanceBulk(
                                          objectConfig.keyId,
                                          instanceId,
                                          "telemetry",
                                          Boolean(checked),
                                        )
                                      }
                                    />
                                    All telemetry
                                  </label>
                                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Checkbox
                                      checked={allObserveChecked}
                                      disabled={!allowAllObserve || isSaving}
                                      onCheckedChange={(checked) =>
                                        onToggleLwm2mInstanceBulk(
                                          objectConfig.keyId,
                                          instanceId,
                                          "observe",
                                          Boolean(checked),
                                        )
                                      }
                                    />
                                    All observe
                                  </label>
                                </div>
                              </div>

                              <div className="overflow-x-auto">
                                <table className="w-full min-w-170 text-sm">
                                  <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                      <th className="px-3 py-2 font-medium">
                                        #ID Resource name
                                      </th>
                                      <th className="px-3 py-2 font-medium">
                                        Attribute
                                      </th>
                                      <th className="px-3 py-2 font-medium">
                                        Telemetry
                                      </th>
                                      <th className="px-3 py-2 font-medium">
                                        Observe
                                      </th>
                                      <th className="px-3 py-2 font-medium">
                                        Key name
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {instanceResources.map((resource) => (
                                      <tr
                                        key={`${objectConfig.keyId}-${instanceId}-${resource.id}`}
                                        className="border-b last:border-b-0"
                                      >
                                        <td className="px-3 py-2">{`#${resource.id} ${resource.name}`}</td>
                                        <td className="px-3 py-2">
                                          <Checkbox
                                            checked={resource.attribute}
                                            disabled={isSaving}
                                            onCheckedChange={(checked) =>
                                              onToggleLwm2mResourceFlag(
                                                objectConfig.keyId,
                                                instanceId,
                                                resource.id,
                                                "attribute",
                                                Boolean(checked),
                                              )
                                            }
                                          />
                                        </td>
                                        <td className="px-3 py-2">
                                          <Checkbox
                                            checked={resource.telemetry}
                                            disabled={isSaving}
                                            onCheckedChange={(checked) =>
                                              onToggleLwm2mResourceFlag(
                                                objectConfig.keyId,
                                                instanceId,
                                                resource.id,
                                                "telemetry",
                                                Boolean(checked),
                                              )
                                            }
                                          />
                                        </td>
                                        <td className="px-3 py-2">
                                          <Checkbox
                                            checked={resource.observe}
                                            disabled={
                                              isSaving ||
                                              (!resource.attribute &&
                                                !resource.telemetry)
                                            }
                                            onCheckedChange={(checked) =>
                                              onToggleLwm2mResourceFlag(
                                                objectConfig.keyId,
                                                instanceId,
                                                resource.id,
                                                "observe",
                                                Boolean(checked),
                                              )
                                            }
                                          />
                                        </td>
                                        <td className="px-3 py-2">
                                          <Input
                                            value={resource.keyName}
                                            disabled={isSaving}
                                            onChange={(event) =>
                                              onLwm2mResourceKeyNameChange(
                                                objectConfig.keyId,
                                                instanceId,
                                                resource.id,
                                                event.target.value,
                                              )
                                            }
                                          />
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {formState.lwm2mActiveTab === "bootstrap" && (
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={formState.lwm2mBootstrapServerUpdateEnable}
              onCheckedChange={(checked) =>
                onToggleBootstrapServerUpdates(Boolean(checked))
              }
              disabled={isSaving}
            />
            Include Bootstrap Server updates
          </label>

          <div className="space-y-2">
            {formState.lwm2mBootstrapServers.map((server) => {
              const isExpanded = expandedLwm2mBootstrapServerIds.has(server.id);
              const serverTitle = server.bootstrapServerIs
                ? "Bootstrap Server"
                : "LwM2M Server";
              const securityModeLabel =
                server.securityMode === "NO_SEC"
                  ? "No Security"
                  : server.securityMode === "PSK"
                    ? "Pre-Shared Key"
                    : server.securityMode === "RPK"
                      ? "Raw Public Key"
                      : server.securityMode === "X509_CERT"
                        ? "X.509 Certificate"
                        : server.securityMode;
              const requiresServerPublicKey =
                server.securityMode === "RPK" ||
                server.securityMode === "X509_CERT";

              return (
                <div key={server.id} className="rounded-md border">
                  <div className="flex items-center justify-between gap-2 bg-muted/20 px-4 py-3">
                    <div className="flex items-center gap-8 text-sm">
                      <span className="font-semibold">{serverTitle}</span>
                      <span>{`Short server ID: ${server.shortServerId || "-"}`}</span>
                      <span>{`Security config mode: ${securityModeLabel}`}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => onRemoveLwm2mBootstrapServer(server.id)}
                        disabled={isSaving}
                        title="Delete server"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() =>
                          onToggleLwm2mBootstrapServerExpanded(server.id)
                        }
                        disabled={isSaving}
                        title={isExpanded ? "Collapse" : "Expand"}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="space-y-4 border-t px-4 py-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">
                            Security config mode
                          </label>
                          <Select
                            value={server.securityMode}
                            onValueChange={(value) =>
                              onUpdateLwm2mBootstrapServer(
                                server.id,
                                "securityMode",
                                value,
                              )
                            }
                            options={[
                              { value: "NO_SEC", label: "No Security" },
                              {
                                value: "PSK",
                                label: "Pre-Shared Key",
                              },
                              {
                                value: "RPK",
                                label: "Raw Public Key",
                              },
                              {
                                value: "X509_CERT",
                                label: "X.509 Certificate",
                              },
                            ]}
                            disabled={isSaving}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">
                            Short server ID*
                          </label>
                          <Input
                            value={server.shortServerId}
                            onChange={(event) =>
                              onUpdateLwm2mBootstrapServer(
                                server.id,
                                "shortServerId",
                                event.target.value,
                              )
                            }
                            inputMode="numeric"
                            pattern="[0-9]*"
                            disabled={isSaving}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">
                            Host*
                          </label>
                          <Input
                            value={server.host}
                            onChange={(event) =>
                              onUpdateLwm2mBootstrapServer(
                                server.id,
                                "host",
                                event.target.value,
                              )
                            }
                            inputMode="numeric"
                            pattern="[0-9.]*"
                            disabled={isSaving}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">
                            Port*
                          </label>
                          <Input
                            value={server.port}
                            onChange={(event) =>
                              onUpdateLwm2mBootstrapServer(
                                server.id,
                                "port",
                                event.target.value,
                              )
                            }
                            inputMode="numeric"
                            pattern="[0-9]*"
                            disabled={isSaving}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">
                            Hold Off Time*
                          </label>
                          <Input
                            value={server.clientHoldOffTime}
                            onChange={(event) =>
                              onUpdateLwm2mBootstrapServer(
                                server.id,
                                "clientHoldOffTime",
                                event.target.value,
                              )
                            }
                            inputMode="numeric"
                            pattern="[0-9]*"
                            disabled={isSaving}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">
                            Account after the timeout*
                          </label>
                          <Input
                            value={server.bootstrapServerAccountTimeout}
                            onChange={(event) =>
                              onUpdateLwm2mBootstrapServer(
                                server.id,
                                "bootstrapServerAccountTimeout",
                                event.target.value,
                              )
                            }
                            inputMode="numeric"
                            pattern="[0-9]*"
                            disabled={isSaving}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">
                            Client registration lifetime*
                          </label>
                          <Input
                            value={server.lifetime}
                            onChange={(event) =>
                              onUpdateLwm2mBootstrapServer(
                                server.id,
                                "lifetime",
                                event.target.value,
                              )
                            }
                            inputMode="numeric"
                            pattern="[0-9]*"
                            disabled={isSaving}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">
                            Min period between two notifications (s)*
                          </label>
                          <Input
                            value={server.defaultMinPeriod}
                            onChange={(event) =>
                              onUpdateLwm2mBootstrapServer(
                                server.id,
                                "defaultMinPeriod",
                                event.target.value,
                              )
                            }
                            inputMode="numeric"
                            pattern="[0-9]*"
                            disabled={isSaving}
                          />
                        </div>

                        {requiresServerPublicKey && (
                          <div className="space-y-1 md:col-span-2">
                            <label className="text-xs text-muted-foreground">
                              Server Public Key*
                            </label>
                            <Input
                              value={server.serverPublicKey}
                              onChange={(event) =>
                                onUpdateLwm2mBootstrapServer(
                                  server.id,
                                  "serverPublicKey",
                                  event.target.value,
                                )
                              }
                              disabled={isSaving}
                            />
                          </div>
                        )}

                        <div className="space-y-1 md:col-span-2">
                          <label className="text-xs text-muted-foreground">
                            Binding
                          </label>
                          <Select
                            value={server.binding}
                            onValueChange={(value) =>
                              onUpdateLwm2mBootstrapServer(
                                server.id,
                                "binding",
                                value,
                              )
                            }
                            options={[
                              {
                                value: "U",
                                label:
                                  "U: Client is reachable via the UDP binding at any time.",
                              },
                              {
                                value: "M",
                                label:
                                  "M: Client is reachable via the MQTT binding at any time.",
                              },
                              {
                                value: "H",
                                label:
                                  "H: Client is reachable via the HTTP binding at any time.",
                              },
                              {
                                value: "T",
                                label:
                                  "T: Client is reachable via the TCP binding at any time.",
                              },
                              {
                                value: "S",
                                label:
                                  "S: Client is reachable via the SMS binding at any time.",
                              },
                              {
                                value: "N",
                                label:
                                  "N: Client MUST send the response to such a request over the Non-IP binding (is supported since LWM2M v1.1).",
                              },
                              {
                                value: "UQ",
                                label:
                                  "UQ: UDP connection in queue mode (is not supported since LWM2M 1.1)",
                              },
                              {
                                value: "UQS",
                                label:
                                  "UQS: both UDP and SMS connections active; UDP in queue mode, SMS in standard mode (is not supported since LWM2M 1.1)",
                              },
                              {
                                value: "TQ",
                                label:
                                  "TQ: TCP connection in queue mode (is not supported since LWM2M 1.1)",
                              },
                              {
                                value: "TQS",
                                label:
                                  "TQS: both TCP and SMS connections active; TCP in queue mode, SMS in standard mode (is not supported since LWM2M 1.1)",
                              },
                              {
                                value: "SQ",
                                label:
                                  "SQ: SMS connection in queue mode (is not supported since LWM2M 1.1)",
                              },
                            ]}
                            disabled={isSaving}
                          />
                        </div>
                      </div>

                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={server.notifIfDisabled}
                          onCheckedChange={(checked) =>
                            onUpdateLwm2mBootstrapServer(
                              server.id,
                              "notifIfDisabled",
                              Boolean(checked),
                            )
                          }
                          disabled={isSaving}
                        />
                        Notification storing when disabled or offline
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Button
            type="button"
            onClick={onAddLwm2mBootstrapServer}
            disabled={isSaving}
          >
            Add LwM2M server
          </Button>
        </div>
      )}

      {formState.lwm2mActiveTab === "other" && (
        <div className="space-y-4">
          <div className="space-y-3 rounded-md border p-3">
            <div className="text-sm font-medium">OTA update</div>

            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={formState.lwm2mUseObject19ForOtaInfo}
                onCheckedChange={(checked) =>
                  onLwm2mUseObject19ForOtaInfoChange(Boolean(checked))
                }
                disabled={isSaving}
              />
              Use Object 19 for OTA file metadata (checksum, size, version,
              name)
            </label>

            <div className="space-y-3 rounded-md border p-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Firmware update</label>
                <Select
                  options={lwm2mFirmwareUpdateStrategyOptions}
                  value={formState.lwm2mFirmwareUpdateStrategy}
                  onValueChange={(value) =>
                    onLwm2mFirmwareUpdateStrategyChange(
                      (value as Lwm2mFirmwareUpdateStrategy) ?? "1",
                    )
                  }
                  disabled={isSaving}
                />
                {selectedFirmwareUpdateStrategy?.description && (
                  <p className="text-xs text-muted-foreground">
                    {selectedFirmwareUpdateStrategy.description}
                  </p>
                )}

                {formState.lwm2mFirmwareUpdateStrategy === "2" && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">
                      Firmware update CoAP resource*
                    </label>
                    <Input
                      value={formState.lwm2mFirmwareUpdateCoapResource}
                      onChange={(event) =>
                        onLwm2mFirmwareUpdateCoapResourceChange(
                          event.target.value,
                        )
                      }
                      placeholder="coap://localhost:5685"
                      disabled={isSaving}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 rounded-md border p-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Software update</label>
                <Select
                  options={lwm2mSoftwareUpdateStrategyOptions}
                  value={formState.lwm2mSoftwareUpdateStrategy}
                  onValueChange={(value) =>
                    onLwm2mSoftwareUpdateStrategyChange(
                      (value as Lwm2mSoftwareUpdateStrategy) ?? "1",
                    )
                  }
                  disabled={isSaving}
                />
                {selectedSoftwareUpdateStrategy?.description && (
                  <p className="text-xs text-muted-foreground">
                    {selectedSoftwareUpdateStrategy.description}
                  </p>
                )}

                {formState.lwm2mSoftwareUpdateStrategy === "2" && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">
                      Software update CoAP resource*
                    </label>
                    <Input
                      value={formState.lwm2mSoftwareUpdateCoapResource}
                      onChange={(event) =>
                        onLwm2mSoftwareUpdateCoapResourceChange(
                          event.target.value,
                        )
                      }
                      placeholder="coap://localhost:5685"
                      disabled={isSaving}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-md border p-3">
            <div className="text-sm font-medium">Power Saving Mode</div>
            <Select
              options={powerModeOptions}
              value={formState.lwm2mPowerMode}
              onValueChange={(value) =>
                onPowerModeChange((value as PowerMode) ?? "DRX")
              }
              disabled={isSaving}
            />

            {formState.lwm2mPowerMode === "PSM" && (
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">
                    PSM Activity Timer
                  </label>
                  <Input
                    value={formState.lwm2mPsmActivityTimer}
                    onChange={(event) =>
                      onLwm2mPsmActivityTimerChange(event.target.value)
                    }
                    inputMode="numeric"
                    pattern="[0-9]*"
                    disabled={isSaving}
                  />
                  {formState.lwm2mPsmActivityTimer === "1" && (
                    <p className="text-xs text-muted-foreground">
                      Minimum number of PSM activity timer is 1.28 seconds.
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">
                    Time unit
                  </label>
                  <Select
                    options={timeUnitOptions}
                    value={formState.lwm2mPsmActivityTimerTimeUnit}
                    onValueChange={(value) =>
                      onLwm2mPsmActivityTimerTimeUnitChange(
                        (value as TimeUnit) ?? "SECONDS",
                      )
                    }
                    disabled={isSaving}
                  />
                </div>
              </div>
            )}

            {formState.lwm2mPowerMode === "EDRX" && (
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">
                    eDRX cycle
                  </label>
                  <Input
                    value={formState.lwm2mEdrxCycle}
                    onChange={(event) =>
                      onLwm2mEdrxCycleChange(event.target.value)
                    }
                    inputMode="numeric"
                    pattern="[0-9]*"
                    disabled={isSaving}
                  />
                  {formState.lwm2mEdrxCycle === "1" && (
                    <p className="text-xs text-muted-foreground">
                      Minimum number of eDRX cycle is 5.12 seconds.
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">
                    Time unit
                  </label>
                  <Select
                    options={timeUnitOptions}
                    value={formState.lwm2mEdrxCycleTimeUnit}
                    onValueChange={(value) =>
                      onLwm2mEdrxCycleTimeUnitChange(
                        (value as TimeUnit) ?? "SECONDS",
                      )
                    }
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">
                    Paging Transmission Window
                  </label>
                  <Input
                    value={formState.lwm2mPagingTransmissionWindow}
                    onChange={(event) =>
                      onLwm2mPagingTransmissionWindowChange(event.target.value)
                    }
                    inputMode="numeric"
                    pattern="[0-9]*"
                    disabled={isSaving}
                  />
                  {formState.lwm2mPagingTransmissionWindow === "1" && (
                    <p className="text-xs text-muted-foreground">
                      Minimum number of Paging transmission window is 1.28
                      seconds.
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">
                    Time unit
                  </label>
                  <Select
                    options={timeUnitOptions}
                    value={formState.lwm2mPagingTransmissionWindowTimeUnit}
                    onValueChange={(value) =>
                      onLwm2mPagingTransmissionWindowTimeUnitChange(
                        (value as TimeUnit) ?? "SECONDS",
                      )
                    }
                    disabled={isSaving}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3 rounded-md border p-3">
            <div className="text-sm font-medium">
              Default Object Version (Attribute)
            </div>
            <Select
              options={lwm2mDefaultObjectVersionOptions}
              value={formState.lwm2mDefaultObjectVersion}
              onValueChange={(value) =>
                onLwm2mDefaultObjectVersionChange(
                  (value as Lwm2mDefaultObjectVersion) ?? "1.0",
                )
              }
              disabled={isSaving}
            />
          </div>
        </div>
      )}

      {formState.lwm2mActiveTab === "json" && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium">LWM2M</label>
          <div className="overflow-hidden rounded-md border">
            <Editor
              height="420px"
              defaultLanguage="json"
              language="json"
              value={formState.lwm2mJsonConfig}
              onChange={(value) => onLwm2mJsonChange(value ?? "")}
              theme={editorTheme}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: "on",
                glyphMargin: false,
                folding: true,
                scrollBeyondLastLine: false,
                wordWrap: "off",
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                formatOnPaste: true,
                formatOnType: true,
                readOnly: isSaving,
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
