"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DeviceService } from "@/lib/services/thingsboardServices/deviceService";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Select from "@/components/ui/select";

interface DeviceProfileTransportTabContentProps {
  profileId: string;
}

type TransportFormState = {
  transportType: "DEFAULT" | "MQTT" | "COAP" | "LWM2M" | "SNMP";
  mqttSparkplugB: boolean;
  mqttTelemetryTopicFilter: string;
  mqttAttributesPublishTopicFilter: string;
  mqttAttributesSubscribeTopicFilter: string;
  mqttPayloadType: "JSON" | "PROTOBUF";
  mqttSendPubackOnValidationFailure: boolean;
  coapDeviceType: "DEFAULT" | "EFENTO";
  coapPayloadType: "JSON" | "PROTOBUF";
  coapPowerMode: "DRX" | "EDRX" | "PSM";
  lwm2mActiveTab: "model" | "bootstrap" | "other" | "json";
  lwm2mObjectList: string;
  lwm2mObserveStrategy: "SINGLE" | "MULTIPLE";
  lwm2mPowerMode: "DRX" | "EDRX" | "PSM";
  snmpTimeoutMs: string;
  snmpRetries: string;
  snmpScope:
    | "CLIENT_ATTRIBUTES"
    | "SHARED_ATTRIBUTES"
    | "SERVER_ATTRIBUTES"
    | "TELEMETRY";
  snmpQueryingFrequencyMs: string;
  snmpDataType: "STRING" | "LONG" | "DOUBLE" | "BOOLEAN";
  snmpDataKey: string;
  snmpOid: string;
};

const MQTT_DEFAULTS = {
  telemetry: "v1/devices/me/telemetry",
  attributesPublish: "v1/devices/me/attributes",
  attributesSubscribe: "v1/devices/me/attributes",
} as const;

const POWER_MODE_OPTIONS = [
  { value: "DRX", label: "Discontinuous Reception (DRX)" },
  { value: "EDRX", label: "Extended Discontinuous Reception (eDRX)" },
  { value: "PSM", label: "Power Saving Mode (PSM)" },
];

const toFormState = (profile: any): TransportFormState => {
  const transportType =
    profile.transportType === "MQTT" ||
    profile.transportType === "COAP" ||
    profile.transportType === "LWM2M" ||
    profile.transportType === "SNMP"
      ? profile.transportType
      : "DEFAULT";
  const transportConfiguration =
    profile.profileData?.transportConfiguration ?? {};
  const isSparkplug = Boolean(transportConfiguration?.sparkplug);
  const firstSnmpConfig =
    transportConfiguration?.communicationConfigs?.[0] ?? {};
  const firstSnmpMapping = firstSnmpConfig?.mappings?.[0] ?? {};

  return {
    transportType,
    mqttSparkplugB: transportType === "MQTT" ? isSparkplug : false,
    mqttTelemetryTopicFilter:
      transportConfiguration?.deviceTelemetryTopic || MQTT_DEFAULTS.telemetry,
    mqttAttributesPublishTopicFilter:
      transportConfiguration?.deviceAttributesTopic ||
      MQTT_DEFAULTS.attributesPublish,
    mqttAttributesSubscribeTopicFilter:
      transportConfiguration?.deviceAttributesSubscribeTopic ||
      MQTT_DEFAULTS.attributesSubscribe,
    mqttPayloadType:
      transportConfiguration?.transportPayloadTypeConfiguration
        ?.transportPayloadType === "PROTOBUF"
        ? "PROTOBUF"
        : "JSON",
    mqttSendPubackOnValidationFailure: Boolean(
      transportConfiguration?.sendAckOnValidationException,
    ),
    coapDeviceType:
      transportConfiguration?.coapDeviceTypeConfiguration?.coapDeviceType ===
      "EFENTO"
        ? "EFENTO"
        : "DEFAULT",
    coapPayloadType:
      transportConfiguration?.coapDeviceTypeConfiguration
        ?.transportPayloadTypeConfiguration?.transportPayloadType === "PROTOBUF"
        ? "PROTOBUF"
        : "JSON",
    coapPowerMode: transportConfiguration?.clientSettings?.powerMode || "DRX",
    lwm2mActiveTab: "model",
    lwm2mObjectList: "",
    lwm2mObserveStrategy:
      transportConfiguration?.observeAttr?.observeStrategy || "SINGLE",
    lwm2mPowerMode:
      transportConfiguration?.clientLwM2mSettings?.powerMode || "DRX",
    snmpTimeoutMs: String(transportConfiguration?.timeoutMs ?? 500),
    snmpRetries: String(transportConfiguration?.retries ?? 0),
    snmpScope: firstSnmpConfig?.spec || "CLIENT_ATTRIBUTES",
    snmpQueryingFrequencyMs: String(
      firstSnmpConfig?.queryingFrequencyMs ?? 5000,
    ),
    snmpDataType: firstSnmpMapping?.dataType || "STRING",
    snmpDataKey: firstSnmpMapping?.key || "",
    snmpOid: firstSnmpMapping?.oid || "",
  };
};

export function DeviceProfileTransportTabContent({
  profileId,
}: DeviceProfileTransportTabContentProps) {
  const {
    data: profile,
    isLoading,
    mutate,
  } = useSWR(
    profileId ? ["deviceProfileTransportConfig", profileId] : null,
    async () => DeviceService.fetchDeviceProfile(profileId),
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<TransportFormState | null>(null);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setForm(toFormState(profile));
    setIsEditing(false);
  }, [profile]);

  const handleCancel = () => {
    if (!profile) {
      return;
    }

    setForm(toFormState(profile));
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!profile || !form) {
      return;
    }

    let transportConfiguration: any = { type: "DEFAULT" };

    if (form.transportType === "MQTT") {
      const existingTransportConfig =
        profile.profileData?.transportConfiguration ?? {};
      transportConfiguration = {
        ...existingTransportConfig,
        type: "MQTT",
        deviceTelemetryTopic:
          form.mqttTelemetryTopicFilter || MQTT_DEFAULTS.telemetry,
        deviceAttributesTopic:
          form.mqttAttributesPublishTopicFilter ||
          MQTT_DEFAULTS.attributesPublish,
        deviceAttributesSubscribeTopic:
          form.mqttAttributesSubscribeTopicFilter ||
          MQTT_DEFAULTS.attributesSubscribe,
        sparkplug: false,
        sendAckOnValidationException: form.mqttSendPubackOnValidationFailure,
        transportPayloadTypeConfiguration: {
          ...((existingTransportConfig as any)
            ?.transportPayloadTypeConfiguration ?? {}),
          transportPayloadType: form.mqttPayloadType,
        },
      };
    } else if (form.transportType === "COAP") {
      transportConfiguration = {
        type: "COAP",
        coapDeviceTypeConfiguration: {
          coapDeviceType: form.coapDeviceType,
          transportPayloadTypeConfiguration: {
            transportPayloadType: form.coapPayloadType,
          },
        },
        clientSettings: {
          powerMode: form.coapPowerMode,
        },
      };
    } else if (form.transportType === "LWM2M") {
      transportConfiguration = {
        type: "LWM2M",
        observeAttr: {
          observeStrategy: form.lwm2mObserveStrategy,
        },
        bootstrap: [],
        clientLwM2mSettings: {
          powerMode: form.lwm2mPowerMode,
        },
      };
    } else if (form.transportType === "SNMP") {
      transportConfiguration = {
        type: "SNMP",
        timeoutMs: Math.max(0, Number(form.snmpTimeoutMs) || 0),
        retries: Math.max(0, Number(form.snmpRetries) || 0),
        communicationConfigs: [
          {
            spec: form.snmpScope,
            queryingFrequencyMs: Math.max(
              0,
              Number(form.snmpQueryingFrequencyMs) || 0,
            ),
            mappings:
              form.snmpDataKey.trim() && form.snmpOid.trim()
                ? [
                    {
                      dataType: form.snmpDataType,
                      key: form.snmpDataKey.trim(),
                      oid: form.snmpOid.trim(),
                    },
                  ]
                : [],
          },
        ],
      };
    }

    const payload = {
      ...profile,
      transportType: form.transportType,
      profileData: {
        ...profile.profileData,
        transportConfiguration,
      },
    };

    setIsSaving(true);
    try {
      await DeviceService.updateDeviceProfile(payload);
      await mutate();
      toast.success("Transport configuration updated");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to update transport configuration",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!profile || !form) {
    return (
      <div className="p-4 text-center text-slate-500">
        Transport configuration not found.
      </div>
    );
  }

  const isFormDisabled = !isEditing || isSaving;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        {!isEditing ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Transport Type
          </label>
          <Select
            value={form.transportType}
            onValueChange={(value) =>
              setForm((prev) =>
                prev
                  ? {
                      ...prev,
                      transportType:
                        (value as
                          | "DEFAULT"
                          | "MQTT"
                          | "COAP"
                          | "LWM2M"
                          | "SNMP") ?? "DEFAULT",
                    }
                  : prev,
              )
            }
            options={[
              { value: "DEFAULT", label: "Default" },
              { value: "MQTT", label: "MQTT" },
              { value: "COAP", label: "CoAP" },
              { value: "LWM2M", label: "LWM2M" },
              { value: "SNMP", label: "SNMP" },
            ]}
            placeholder="Select transport type"
            disabled={isFormDisabled}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {form.transportType === "DEFAULT"
              ? "Uses default ThingsBoard transport configuration."
              : form.transportType === "MQTT"
                ? "Uses MQTT protocol for device communication."
                : form.transportType === "COAP"
                  ? "Enables advanced CoAP transport settings."
                  : form.transportType === "LWM2M"
                    ? "Configure LWM2M model, bootstrap and client settings."
                    : "Specify SNMP transport configuration and communication mappings."}
          </p>
        </div>

        {form.transportType === "MQTT" && (
          <>
            <div className="flex items-center gap-2">
              <Checkbox
                id="profile-transport-sparkplug-b"
                checked={form.mqttSparkplugB}
                onCheckedChange={(checked) =>
                  setForm((prev) =>
                    prev ? { ...prev, mqttSparkplugB: Boolean(checked) } : prev,
                  )
                }
                disabled
              />
              <label
                htmlFor="profile-transport-sparkplug-b"
                className="cursor-not-allowed text-sm opacity-50"
              >
                MQTT Sparkplug B Edge of Network (EoN) node
              </label>
            </div>

            {!form.mqttSparkplugB && (
              <div className="space-y-4 rounded-lg border border-muted bg-muted/30 p-4">
                <h3 className="text-sm font-medium">
                  MQTT device topic filters
                </h3>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Telemetry Topic Filter
                  </label>
                  <Input
                    value={form.mqttTelemetryTopicFilter}
                    onChange={(event) =>
                      setForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              mqttTelemetryTopicFilter: event.target.value,
                            }
                          : prev,
                      )
                    }
                    disabled={isFormDisabled}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Attributes Publish Topic Filter
                  </label>
                  <Input
                    value={form.mqttAttributesPublishTopicFilter}
                    onChange={(event) =>
                      setForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              mqttAttributesPublishTopicFilter:
                                event.target.value,
                            }
                          : prev,
                      )
                    }
                    disabled={isFormDisabled}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Attributes Subscribe Topic Filter
                  </label>
                  <Input
                    value={form.mqttAttributesSubscribeTopicFilter}
                    onChange={(event) =>
                      setForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              mqttAttributesSubscribeTopicFilter:
                                event.target.value,
                            }
                          : prev,
                      )
                    }
                    disabled={isFormDisabled}
                  />
                </div>
              </div>
            )}

            {!form.mqttSparkplugB && (
              <>
                <div className="space-y-4 rounded-lg border border-muted bg-muted/30 p-4">
                  <h3 className="text-sm font-medium">MQTT Payload Type</h3>
                  <Select
                    value={form.mqttPayloadType}
                    onValueChange={(value) =>
                      setForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              mqttPayloadType:
                                (value as "JSON" | "Protobuf") ?? "JSON",
                            }
                          : prev,
                      )
                    }
                    options={[
                      { value: "JSON", label: "JSON" },
                      { value: "PROTOBUF", label: "Protobuf" },
                    ]}
                    placeholder="Select payload type"
                    disabled={isFormDisabled}
                  />
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="profile-transport-puback"
                    checked={form.mqttSendPubackOnValidationFailure}
                    onCheckedChange={(checked) =>
                      setForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              mqttSendPubackOnValidationFailure:
                                Boolean(checked),
                            }
                          : prev,
                      )
                    }
                    className="mt-1"
                    disabled={isFormDisabled}
                  />
                  <div className="flex-1 space-y-1">
                    <label
                      htmlFor="profile-transport-puback"
                      className="text-sm"
                    >
                      Send PUBACK on PUBLISH message validation failure
                    </label>
                    <p className="text-xs text-muted-foreground">
                      By default, the platform will close the MQTT session on
                      message validation failure. When enabled, the platform
                      will send publish acknowledgment instead of closing the
                      session.
                    </p>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {form.transportType === "COAP" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-muted p-4">
              <label className="mb-1 block text-sm font-medium">
                CoAP device type
              </label>
              <Select
                value={form.coapDeviceType}
                onValueChange={(value) =>
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          coapDeviceType:
                            (value as "DEFAULT" | "EFENTO") ?? "DEFAULT",
                        }
                      : prev,
                  )
                }
                options={[
                  { value: "DEFAULT", label: "Default" },
                  { value: "EFENTO", label: "Efento" },
                ]}
                disabled={isFormDisabled}
              />
            </div>

            <div className="rounded-lg border border-muted p-4">
              <label className="mb-1 block text-sm font-medium">
                CoAP device payload
              </label>
              <Select
                value={form.coapPayloadType}
                onValueChange={(value) =>
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          coapPayloadType:
                            (value as "JSON" | "PROTOBUF") ?? "JSON",
                        }
                      : prev,
                  )
                }
                options={[
                  { value: "JSON", label: "JSON" },
                  { value: "PROTOBUF", label: "Protobuf" },
                ]}
                disabled={isFormDisabled}
              />
            </div>

            <div className="rounded-lg border border-muted p-4">
              <label className="mb-1 block text-sm font-medium">
                Power Saving Mode
              </label>
              <Select
                value={form.coapPowerMode}
                onValueChange={(value) =>
                  setForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          coapPowerMode:
                            (value as "DRX" | "EDRX" | "PSM") ?? "DRX",
                        }
                      : prev,
                  )
                }
                options={POWER_MODE_OPTIONS}
                disabled={isFormDisabled}
              />
            </div>
          </div>
        )}

        {form.transportType === "LWM2M" && (
          <div className="space-y-4 rounded-lg border border-muted p-4">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { value: "model", label: "LWM2M Model" },
                { value: "bootstrap", label: "Bootstrap" },
                { value: "other", label: "Other settings" },
                { value: "json", label: "Json Config Profile Device" },
              ].map((tab) => {
                const isActive = form.lwm2mActiveTab === tab.value;

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
                    onClick={() =>
                      setForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              lwm2mActiveTab: tab.value as
                                | "model"
                                | "bootstrap"
                                | "other"
                                | "json",
                            }
                          : prev,
                      )
                    }
                    disabled={isFormDisabled}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {form.lwm2mActiveTab === "model" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Object list</label>
                  <Textarea
                    value={form.lwm2mObjectList}
                    onChange={(event) =>
                      setForm((prev) =>
                        prev
                          ? { ...prev, lwm2mObjectList: event.target.value }
                          : prev,
                      )
                    }
                    placeholder="Object list"
                    className="min-h-24"
                    disabled={isFormDisabled}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    Observe strategy
                  </label>
                  <Select
                    value={form.lwm2mObserveStrategy}
                    onValueChange={(value) =>
                      setForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              lwm2mObserveStrategy:
                                (value as "SINGLE" | "MULTIPLE") ?? "SINGLE",
                            }
                          : prev,
                      )
                    }
                    options={[
                      { value: "SINGLE", label: "Single" },
                      { value: "MULTIPLE", label: "Multiple" },
                    ]}
                    disabled={isFormDisabled}
                  />
                </div>
              </div>
            )}

            {form.lwm2mActiveTab === "other" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Power Saving Mode</label>
                <Select
                  value={form.lwm2mPowerMode}
                  onValueChange={(value) =>
                    setForm((prev) =>
                      prev
                        ? {
                            ...prev,
                            lwm2mPowerMode:
                              (value as "DRX" | "EDRX" | "PSM") ?? "DRX",
                          }
                        : prev,
                    )
                  }
                  options={POWER_MODE_OPTIONS}
                  disabled={isFormDisabled}
                />
              </div>
            )}

            {(form.lwm2mActiveTab === "bootstrap" ||
              form.lwm2mActiveTab === "json") && (
              <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                This section is read-only for now and will be available in next
                iteration.
              </div>
            )}
          </div>
        )}

        {form.transportType === "SNMP" && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Timeout, ms*</label>
                <Input
                  type="number"
                  min={0}
                  value={form.snmpTimeoutMs}
                  onChange={(event) =>
                    setForm((prev) =>
                      prev
                        ? { ...prev, snmpTimeoutMs: event.target.value }
                        : prev,
                    )
                  }
                  disabled={isFormDisabled}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Retries*</label>
                <Input
                  type="number"
                  min={0}
                  value={form.snmpRetries}
                  onChange={(event) =>
                    setForm((prev) =>
                      prev
                        ? { ...prev, snmpRetries: event.target.value }
                        : prev,
                    )
                  }
                  disabled={isFormDisabled}
                />
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-muted p-3">
              <label className="text-sm font-medium">
                Communication config
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Scope</label>
                  <Select
                    value={form.snmpScope}
                    onValueChange={(value) =>
                      setForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              snmpScope:
                                (value as
                                  | "CLIENT_ATTRIBUTES"
                                  | "SHARED_ATTRIBUTES"
                                  | "SERVER_ATTRIBUTES"
                                  | "TELEMETRY") ?? "CLIENT_ATTRIBUTES",
                            }
                          : prev,
                      )
                    }
                    options={[
                      {
                        value: "CLIENT_ATTRIBUTES",
                        label: "Client attributes (SNMP GET)",
                      },
                      {
                        value: "SHARED_ATTRIBUTES",
                        label: "Shared attributes (SNMP SET)",
                      },
                      {
                        value: "SERVER_ATTRIBUTES",
                        label: "Server attributes (SNMP GET)",
                      },
                      { value: "TELEMETRY", label: "Telemetry (SNMP GET)" },
                    ]}
                    disabled={isFormDisabled}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">
                    Querying frequency, ms*
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={form.snmpQueryingFrequencyMs}
                    onChange={(event) =>
                      setForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              snmpQueryingFrequencyMs: event.target.value,
                            }
                          : prev,
                      )
                    }
                    disabled={isFormDisabled}
                  />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Data type</label>
                  <Select
                    value={form.snmpDataType}
                    onValueChange={(value) =>
                      setForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              snmpDataType:
                                (value as
                                  | "STRING"
                                  | "LONG"
                                  | "DOUBLE"
                                  | "BOOLEAN") ?? "STRING",
                            }
                          : prev,
                      )
                    }
                    options={[
                      { value: "STRING", label: "String" },
                      { value: "LONG", label: "Long" },
                      { value: "DOUBLE", label: "Double" },
                      { value: "BOOLEAN", label: "Boolean" },
                    ]}
                    disabled={isFormDisabled}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Data key *</label>
                  <Input
                    value={form.snmpDataKey}
                    onChange={(event) =>
                      setForm((prev) =>
                        prev
                          ? { ...prev, snmpDataKey: event.target.value }
                          : prev,
                      )
                    }
                    placeholder="Data key"
                    disabled={isFormDisabled}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">OID *</label>
                  <Input
                    value={form.snmpOid}
                    onChange={(event) =>
                      setForm((prev) =>
                        prev ? { ...prev, snmpOid: event.target.value } : prev,
                      )
                    }
                    placeholder="OID"
                    disabled={isFormDisabled}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
