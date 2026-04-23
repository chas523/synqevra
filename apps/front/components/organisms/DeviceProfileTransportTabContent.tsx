"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DeviceService } from "@/lib/services/thingsboardServices/deviceService";
import {
  ResourceService,
  type Lwm2mObjectResource,
} from "@/lib/services/thingsboardServices/resourceService";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Select from "@/components/ui/select";
import { useTheme } from "next-themes";
import { CoapTransportSection } from "@/components/organisms/CoapTransportSection";
import { SnmpTransportSection } from "@/components/organisms/SnmpTransportSection";
import { MqttSparkplugSection } from "./MqttSparkplugSection";
import { TransportProtobufSchemasSection } from "./TransportProtobufSchemasSection";
import { Lwm2mModelTab } from "@/components/organisms/Lwm2mModelTab";
import { Lwm2mInstanceDialog } from "@/components/organisms/Lwm2mInstanceDialog";
import { Lwm2mInstanceAttributesDialog } from "@/components/organisms/Lwm2mInstanceAttributesDialog";
import { type Lwm2mObjectOption } from "@/components/molecules/Lwm2mObjectListField";
import { useDeviceProfileReferenceData } from "@/hooks/thingsboard/device-profile/useDeviceProfileReferenceData";
import { useLwm2mJsonSync } from "@/hooks/thingsboard/device-profile/useLwm2mJsonSync";
import { useLwm2mTransportForm } from "@/hooks/thingsboard/device-profile/useLwm2mTransportForm";
import { useCoapTransportForm } from "@/hooks/thingsboard/device-profile/useCoapTransportForm";
import {
  isValidSnmpOid,
  requiresSnmpQueryingFrequency,
  useSnmpTransportForm,
} from "@/hooks/thingsboard/device-profile/useSnmpTransportForm";
import { useMqttTransportForm } from "@/hooks/thingsboard/device-profile/useMqttTransportForm";
import {
  buildLwm2mTransportConfigurationFromForm,
  DEFAULT_LWM2M_COAP_RESOURCE,
} from "@/lib/services/thingsboardServices/lwm2mTransportConfigService";
import {
  DEFAULT_SPARKPLUG_ATTRIBUTES_METRIC_NAMES,
  ensureSparkplugDefaultMetrics,
} from "@/lib/constants/mqttSparkplug";

interface DeviceProfileTransportTabContentProps {
  profileId: string;
}

type TimeUnit = "MILLISECONDS" | "SECONDS" | "MINUTES" | "HOURS";
type PowerMode = "DRX" | "EDRX" | "PSM";
type Lwm2mTab = "model" | "bootstrap" | "other" | "json";
type Lwm2mObserveStrategy = "SINGLE" | "COMPOSITE_ALL" | "COMPOSITE_BY_OBJECT";
type Lwm2mSecurityMode = "NO_SEC" | "PSK" | "RPK" | "X509_CERT";
type Lwm2mFirmwareUpdateStrategy = "1" | "2" | "3";
type Lwm2mSoftwareUpdateStrategy = "1" | "2";
type Lwm2mDefaultObjectVersion = "1.0" | "1.1" | "1.2";
type SnmpScope =
  | "CLIENT_ATTRIBUTES_QUERYING"
  | "SHARED_ATTRIBUTES_SETTING"
  | "TELEMETRY_QUERYING"
  | "TO_DEVICE_RPC_REQUEST"
  | "TO_SERVER_RPC_REQUEST";
type SnmpDataType = "STRING" | "LONG" | "DOUBLE" | "BOOLEAN";

type Lwm2mObjectListItem = {
  keyId: string;
  name: string;
};

type Lwm2mResourceConfig = {
  id: number;
  name: string;
  keyName: string;
  attribute: boolean;
  telemetry: boolean;
  observe: boolean;
};

type Lwm2mInstanceAttributeKey = "minimumPeriod" | "maximumPeriod";
type Lwm2mInstanceAttributes = Partial<
  Record<Lwm2mInstanceAttributeKey, number>
>;
type Lwm2mAttributeScope = "OBJECT" | "INSTANCE";

type Lwm2mObjectConfig = {
  keyId: string;
  name: string;
  multiple: boolean;
  instances: number[];
  resources: Lwm2mResourceConfig[];
  instanceResources: Record<number, Lwm2mResourceConfig[]>;
  objectAttributes: Lwm2mInstanceAttributes;
  instanceAttributes: Record<number, Lwm2mInstanceAttributes>;
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
  securityMode: Lwm2mSecurityMode;
};

type SnmpMappingForm = {
  id: string;
  dataType: SnmpDataType;
  key: string;
  oid: string;
};

type SnmpCommunicationConfigForm = {
  id: string;
  spec: SnmpScope;
  queryingFrequencyMs: string;
  mappings: SnmpMappingForm[];
};

type TransportFormState = {
  transportType: "DEFAULT" | "MQTT" | "COAP" | "LWM2M" | "SNMP";
  mqttSparkplugB: boolean;
  mqttSparkplugAttributesMetricNames: string[];
  mqttTelemetryTopicFilter: string;
  mqttAttributesPublishTopicFilter: string;
  mqttAttributesSubscribeTopicFilter: string;
  mqttPayloadType: "JSON" | "PROTOBUF";
  mqttTelemetryProtoSchema: string;
  mqttAttributesProtoSchema: string;
  mqttRpcRequestProtoSchema: string;
  mqttRpcResponseProtoSchema: string;
  mqttEnableCompatibilityWithJsonPayloadFormat: boolean;
  mqttUseJsonPayloadFormatForDefaultDownlinkTopics: boolean;
  mqttSendPubackOnValidationFailure: boolean;
  coapDeviceType: "DEFAULT" | "EFENTO";
  coapPayloadType: "JSON" | "PROTOBUF";
  coapPowerMode: "DRX" | "EDRX" | "PSM";
  coapTelemetryProtoSchema: string;
  coapAttributesProtoSchema: string;
  coapRpcRequestProtoSchema: string;
  coapRpcResponseProtoSchema: string;
  coapPsmActivityTimer: string;
  coapPsmActivityTimerTimeUnit: TimeUnit;
  coapEdrxCycle: string;
  coapEdrxCycleTimeUnit: TimeUnit;
  coapPagingTransmissionWindow: string;
  coapPagingTransmissionWindowTimeUnit: TimeUnit;
  lwm2mActiveTab: Lwm2mTab;
  lwm2mObjectList: Lwm2mObjectListItem[];
  lwm2mObjectConfigs: Lwm2mObjectConfig[];
  lwm2mObserveStrategy: Lwm2mObserveStrategy;
  lwm2mPowerMode: "DRX" | "EDRX" | "PSM";
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
  snmpTimeoutMs: string;
  snmpRetries: string;
  snmpCommunicationConfigs: SnmpCommunicationConfigForm[];
};

const MQTT_DEFAULTS = {
  telemetry: "v1/devices/me/telemetry",
  attributesPublish: "v1/devices/me/attributes",
  attributesSubscribe: "v1/devices/me/attributes",
} as const;

const POWER_MODE_OPTIONS: Array<{ value: PowerMode; label: string }> = [
  { value: "DRX", label: "Discontinuous Reception (DRX)" },
  { value: "EDRX", label: "Extended Discontinuous Reception (eDRX)" },
  { value: "PSM", label: "Power Saving Mode (PSM)" },
];

const PAYLOAD_TYPE_OPTIONS = [
  { value: "JSON", label: "JSON" },
  { value: "PROTOBUF", label: "Protobuf" },
] as const;

const LWM2M_TAB_OPTIONS: Array<{ value: Lwm2mTab; label: string }> = [
  { value: "model", label: "LWM2M Model" },
  { value: "bootstrap", label: "Bootstrap" },
  { value: "other", label: "Other settings" },
  { value: "json", label: "Json Config Profile Device" },
];

const LWM2M_FIRMWARE_UPDATE_STRATEGY_OPTIONS: Array<{
  value: Lwm2mFirmwareUpdateStrategy;
  label: string;
  description?: string;
}> = [
  {
    value: "1",
    label: "Push via Object 5 / Resource 0",
    description:
      "Push firmware update as binary file using Object 5 and Resource 0 (Package).",
  },
  {
    value: "2",
    label: "Auto-generate CoAP URL (Obj 5 / Res 1)",
    description:
      "Auto-generate unique CoAP URL to download the package and push firmware update as Object 5 and Resource 1 (Package URI).",
  },
  {
    value: "3",
    label: "Push via Object 19 / Resource 0",
    description:
      "Push firmware update as binary file using Object 19 and Resource 0 (Data).",
  },
];

const LWM2M_SOFTWARE_UPDATE_STRATEGY_OPTIONS: Array<{
  value: Lwm2mSoftwareUpdateStrategy;
  label: string;
  description?: string;
}> = [
  {
    value: "1",
    label: "Push via Object 9 / Resource 2",
    description: "Push binary file using Object 9 and Resource 2 (Package).",
  },
  {
    value: "2",
    label: "Auto-generate CoAP URL (Obj 9 / Res 3)",
    description:
      "Auto-generate unique CoAP URL to download the package and push software update using Object 9 and Resource 3 (Package URI).",
  },
];

const LWM2M_DEFAULT_OBJECT_VERSION_OPTIONS: Array<{
  value: Lwm2mDefaultObjectVersion;
  label: string;
}> = [
  { value: "1.0", label: "1.0" },
  { value: "1.1", label: "1.1" },
  { value: "1.2", label: "1.2" },
];

const LWM2M_ATTRIBUTE_OPTIONS: Array<{
  value: Lwm2mInstanceAttributeKey;
  label: string;
}> = [
  { value: "minimumPeriod", label: "Minimum period" },
  { value: "maximumPeriod", label: "Maximum period" },
];

const TIME_UNIT_OPTIONS: Array<{ value: TimeUnit; label: string }> = [
  { value: "MILLISECONDS", label: "Milliseconds" },
  { value: "SECONDS", label: "Seconds" },
  { value: "MINUTES", label: "Minutes" },
  { value: "HOURS", label: "Hours" },
];

const SNMP_SCOPE_OPTIONS: Array<{ value: SnmpScope; label: string }> = [
  {
    value: "TELEMETRY_QUERYING",
    label: "Telemetry (SNMP GET)",
  },
  {
    value: "CLIENT_ATTRIBUTES_QUERYING",
    label: "Client attributes (SNMP GET)",
  },
  {
    value: "SHARED_ATTRIBUTES_SETTING",
    label: "Shared attributes (SNMP SET)",
  },
  {
    value: "TO_DEVICE_RPC_REQUEST",
    label: "To-device RPC request (SNMP GET/SET)",
  },
  {
    value: "TO_SERVER_RPC_REQUEST",
    label: "From-device RPC request (SNMP TRAP)",
  },
];

const SNMP_DATA_TYPE_OPTIONS: Array<{ value: SnmpDataType; label: string }> = [
  { value: "STRING", label: "String" },
  { value: "LONG", label: "Long" },
  { value: "DOUBLE", label: "Double" },
  { value: "BOOLEAN", label: "Boolean" },
];

const COAP_TELEMETRY_PROTO_SCHEMA_DEFAULT = `syntax ="proto3";
package telemetry;

message SensorDataReading {

  optional double temperature = 1;
  optional double humidity = 2;
  InnerObject innerObject = 3;

  message InnerObject {
    optional string key1 = 1;
    optional bool key2 = 2;
    optional double key3 = 3;
    optional int32 key4 = 4;
    optional string key5 = 5;
  }
}`;

const COAP_ATTRIBUTES_PROTO_SCHEMA_DEFAULT = `syntax ="proto3";
package attributes;

message SensorConfiguration {
  optional string firmwareVersion = 1;
  optional string serialNumber = 2;
}`;

const COAP_RPC_REQUEST_PROTO_SCHEMA_DEFAULT = `syntax ="proto3";
package rpc;

message RpcRequestMsg {
  optional string method = 1;
  optional int32 requestId = 2;
  optional string params = 3;
}`;

const COAP_RPC_RESPONSE_PROTO_SCHEMA_DEFAULT = `syntax ="proto3";
package rpc;

message RpcResponseMsg {
  optional string payload = 1;
}`;

const LWM2M_POSITIVE_INT_FIELDS: Array<
  keyof Pick<
    Lwm2mBootstrapServerConfig,
    | "clientHoldOffTime"
    | "bootstrapServerAccountTimeout"
    | "lifetime"
    | "defaultMinPeriod"
  >
> = [
  "clientHoldOffTime",
  "bootstrapServerAccountTimeout",
  "lifetime",
  "defaultMinPeriod",
];

const LWM2M_POSITIVE_INT_FIELD_LABELS: Record<string, string> = {
  clientHoldOffTime: "Hold Off Time",
  bootstrapServerAccountTimeout: "Account after the timeout",
  lifetime: "Client registration lifetime",
  defaultMinPeriod: "Min period between two notifications",
};

const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const cloneLwm2mResources = (resources: Lwm2mResourceConfig[]) =>
  resources.map((resource) => ({ ...resource }));

const isStrictPositiveInteger = (value: string) => /^[1-9][0-9]*$/.test(value);

const sanitizeIpv4Input = (value: string) => {
  const filtered = value.replace(/[^0-9.]/g, "");
  const parts = filtered.split(".").slice(0, 4);

  return parts
    .map((part) => {
      const next = part.replace(/\D+/g, "").slice(0, 3);
      if (!next) {
        return "";
      }

      return String(Math.min(255, Number(next) || 0));
    })
    .join(".");
};

const isValidIpv4Host = (value: string) => {
  const parts = value.trim().split(".");
  if (parts.length !== 4) {
    return false;
  }

  return parts.every((part) => {
    if (!/^\d+$/.test(part)) {
      return false;
    }

    const octet = Number(part);
    return Number.isInteger(octet) && octet >= 0 && octet <= 255;
  });
};

const isValidPort = (value: string) => {
  if (!/^\d+$/.test(value)) {
    return false;
  }

  const port = Number(value);
  return Number.isInteger(port) && port >= 1 && port <= 65535;
};

const requiresServerPublicKey = (mode: Lwm2mSecurityMode) =>
  mode === "RPK" || mode === "X509_CERT";

const normalizeLwm2mSecurityMode = (mode: unknown): Lwm2mSecurityMode => {
  if (mode === "PSK" || mode === "RPK" || mode === "X509_CERT") {
    return mode;
  }

  if (mode === "X509") {
    return "X509_CERT";
  }

  return "NO_SEC";
};

const createLwm2mBootstrapServerConfig = (
  values: {
    shortServerId: number;
    bootstrapServerIs: boolean;
    host: string;
    port: number;
    clientHoldOffTime: number;
    serverPublicKey: string;
    serverCertificate: string;
    bootstrapServerAccountTimeout: number;
    lifetime: number;
    defaultMinPeriod: number;
    notifIfDisabled: boolean;
    binding: string;
    securityMode: Lwm2mSecurityMode;
  },
  prefix: string,
): Lwm2mBootstrapServerConfig => ({
  id: createId(prefix),
  shortServerId: String(values.shortServerId),
  bootstrapServerIs: values.bootstrapServerIs,
  host: values.host,
  port: String(values.port),
  clientHoldOffTime: String(values.clientHoldOffTime),
  serverPublicKey: values.serverPublicKey,
  serverCertificate: values.serverCertificate,
  bootstrapServerAccountTimeout: String(values.bootstrapServerAccountTimeout),
  lifetime: String(values.lifetime),
  defaultMinPeriod: String(values.defaultMinPeriod),
  notifIfDisabled: values.notifIfDisabled,
  binding: values.binding,
  securityMode: values.securityMode,
});

const createDefaultLwm2mServerConfig = () =>
  createLwm2mBootstrapServerConfig(
    {
      shortServerId: 123,
      bootstrapServerIs: false,
      host: "0.0.0.0",
      port: 5685,
      clientHoldOffTime: 1,
      serverPublicKey: "",
      serverCertificate: "",
      bootstrapServerAccountTimeout: 1,
      lifetime: 300,
      defaultMinPeriod: 1,
      notifIfDisabled: true,
      binding: "U",
      securityMode: "NO_SEC",
    },
    "lwm2m-server",
  );

const createDefaultLwm2mBootstrapUpdateServerConfig = () =>
  createLwm2mBootstrapServerConfig(
    {
      shortServerId: 111,
      bootstrapServerIs: true,
      host: "0.0.0.0",
      port: 5687,
      clientHoldOffTime: 1,
      serverPublicKey: "",
      serverCertificate: "",
      bootstrapServerAccountTimeout: 1,
      lifetime: 300,
      defaultMinPeriod: 1,
      notifIfDisabled: true,
      binding: "U",
      securityMode: "NO_SEC",
    },
    "bootstrap-server",
  );

const createDefaultLwm2mTransportConfiguration = (
  observeStrategy: Lwm2mObserveStrategy,
  powerMode: TransportFormState["lwm2mPowerMode"],
  hasSelectedObjects: boolean,
) => ({
  observeAttr: {
    observe: [],
    attribute: [],
    telemetry: [],
    keyName: {},
    attributeLwm2m: {},
    observeStrategy,
  },
  bootstrap: [
    {
      shortServerId: 123,
      bootstrapServerIs: false,
      host: "0.0.0.0",
      port: 5685,
      clientHoldOffTime: 1,
      serverPublicKey: "",
      serverCertificate: "",
      bootstrapServerAccountTimeout: 1,
      lifetime: 300,
      defaultMinPeriod: 1,
      notifIfDisabled: true,
      binding: "U",
      securityMode: "NO_SEC",
    },
  ],
  clientLwM2mSettings: {
    clientOnlyObserveAfterConnect: 1,
    useObject19ForOtaInfo: false,
    fwUpdateStrategy: 1,
    swUpdateStrategy: 1,
    powerMode,
    edrxCycle: hasSelectedObjects ? 81000 : 0,
    psmActivityTimer: hasSelectedObjects ? 10000 : 0,
    pagingTransmissionWindow: hasSelectedObjects ? 10000 : 0,
    defaultObjectIDVer: "1.0",
  },
  type: "LWM2M",
  bootstrapServerUpdateEnable: false,
});

const parseLwm2mResourcePath = (value: string) => {
  const match = /^\/([^/]+)\/(\d+)\/(\d+)$/.exec(value.trim());
  if (!match) {
    return null;
  }

  return {
    objectKeyId: match[1],
    instanceId: Number(match[2]),
    resourceId: Number(match[3]),
  };
};

const parseLwm2mAttributePath = (value: string) => {
  const match = /^\/([^/]+)(?:\/(\d+))?$/.exec(value.trim());
  if (!match) {
    return null;
  }

  return {
    objectKeyId: match[1],
    instanceId: typeof match[2] === "string" ? Number(match[2]) : null,
  };
};

const getLwm2mReferencedObjectIds = (transportConfiguration: any) => {
  const ids = new Set<string>();
  const observeAttr = transportConfiguration?.observeAttr ?? {};
  const resourcePaths = [
    ...(Array.isArray(observeAttr.observe) ? observeAttr.observe : []),
    ...(Array.isArray(observeAttr.attribute) ? observeAttr.attribute : []),
    ...(Array.isArray(observeAttr.telemetry) ? observeAttr.telemetry : []),
    ...Object.keys(observeAttr?.keyName ?? {}),
  ];

  resourcePaths.forEach((path) => {
    const parsed = parseLwm2mResourcePath(String(path));
    if (parsed?.objectKeyId) {
      ids.add(parsed.objectKeyId);
    }
  });

  Object.keys(observeAttr?.attributeLwm2m ?? {}).forEach((path) => {
    const parsed = parseLwm2mAttributePath(path);
    if (parsed?.objectKeyId) {
      ids.add(parsed.objectKeyId);
    }
  });

  return Array.from(ids).sort((left, right) =>
    left.localeCompare(right, undefined, { numeric: true }),
  );
};

const loadLwm2mObjectDetails = async (objectIds: string[]) => {
  const entries = await Promise.all(
    objectIds.map(async (objectId) => {
      try {
        const result = await ResourceService.getLwm2mObjectsPage(
          0,
          50,
          objectId,
          "resourceKey",
          "ASC",
        );
        const match =
          result.find((item) => item.keyId === objectId) ?? result[0];
        return match ? ([objectId, match] as const) : null;
      } catch {
        return null;
      }
    }),
  );

  return entries.reduce<Record<string, Lwm2mObjectResource>>((acc, entry) => {
    if (entry) {
      acc[entry[0]] = entry[1];
    }
    return acc;
  }, {});
};

const buildLwm2mObjectState = (
  transportConfiguration: any,
  details: Record<string, Lwm2mObjectResource>,
) => {
  const objectIds = getLwm2mReferencedObjectIds(transportConfiguration);
  const observeAttr = transportConfiguration?.observeAttr ?? {};
  const observeSet = new Set<string>(
    Array.isArray(observeAttr.observe) ? observeAttr.observe : [],
  );
  const attributeSet = new Set<string>(
    Array.isArray(observeAttr.attribute) ? observeAttr.attribute : [],
  );
  const telemetrySet = new Set<string>(
    Array.isArray(observeAttr.telemetry) ? observeAttr.telemetry : [],
  );
  const keyNameMap = observeAttr?.keyName ?? {};
  const attributeLwm2m = observeAttr?.attributeLwm2m ?? {};

  const lwm2mObjectConfigs = objectIds.map((objectId) => {
    const detail = details[objectId];
    const baseResources: Lwm2mResourceConfig[] =
      detail?.instances?.[0]?.resources?.map((resource) => ({
        id: resource.id,
        name: resource.name,
        keyName: resource.keyName ?? "",
        attribute: false,
        telemetry: false,
        observe: false,
      })) ?? [];

    const instanceIds = new Set<number>();

    [
      ...Array.from(observeSet),
      ...Array.from(attributeSet),
      ...Array.from(telemetrySet),
      ...Object.keys(keyNameMap),
    ].forEach((path) => {
      const parsed = parseLwm2mResourcePath(path);
      if (parsed?.objectKeyId === objectId) {
        instanceIds.add(parsed.instanceId);
      }
    });

    Object.keys(attributeLwm2m).forEach((path) => {
      const parsed = parseLwm2mAttributePath(path);
      if (parsed?.objectKeyId === objectId && parsed.instanceId !== null) {
        instanceIds.add(parsed.instanceId);
      }
    });

    if (instanceIds.size === 0) {
      instanceIds.add(0);
    }

    const sortedInstanceIds = Array.from(instanceIds).sort(
      (left, right) => left - right,
    );
    const objectAttributesSource = attributeLwm2m[`/${objectId}`] ?? {};

    return {
      keyId: objectId,
      name: detail?.name ?? `Object ${objectId}`,
      multiple: Boolean(detail?.multiple),
      instances: sortedInstanceIds,
      resources: baseResources,
      instanceResources: sortedInstanceIds.reduce<
        Record<number, Lwm2mResourceConfig[]>
      >((acc, instanceId) => {
        acc[instanceId] = baseResources.map((resource) => {
          const path = `/${objectId}/${instanceId}/${resource.id}`;
          const attribute = attributeSet.has(path);
          const telemetry = telemetrySet.has(path);

          return {
            ...resource,
            keyName:
              typeof keyNameMap[path] === "string" && keyNameMap[path].trim()
                ? keyNameMap[path]
                : resource.keyName,
            attribute,
            telemetry,
            observe: (attribute || telemetry) && observeSet.has(path),
          };
        });
        return acc;
      }, {}),
      objectAttributes: {
        ...(typeof objectAttributesSource?.pmin === "number"
          ? { minimumPeriod: objectAttributesSource.pmin }
          : {}),
        ...(typeof objectAttributesSource?.pmax === "number"
          ? { maximumPeriod: objectAttributesSource.pmax }
          : {}),
      },
      instanceAttributes: sortedInstanceIds.reduce<
        Record<number, Lwm2mInstanceAttributes>
      >((acc, instanceId) => {
        const current = attributeLwm2m[`/${objectId}/${instanceId}`] ?? {};
        acc[instanceId] = {
          ...(typeof current?.pmin === "number"
            ? { minimumPeriod: current.pmin }
            : {}),
          ...(typeof current?.pmax === "number"
            ? { maximumPeriod: current.pmax }
            : {}),
        };
        return acc;
      }, {}),
    };
  });

  return {
    lwm2mObjectList: lwm2mObjectConfigs.map((config) => ({
      keyId: config.keyId,
      name: config.name,
    })),
    lwm2mObjectConfigs,
  };
};

const buildLwm2mBootstrapServersFromTransportConfiguration = (
  transportConfiguration: any,
) => {
  const bootstrapServers = Array.isArray(transportConfiguration?.bootstrap)
    ? transportConfiguration.bootstrap
    : [];

  if (bootstrapServers.length === 0) {
    return [createDefaultLwm2mServerConfig()];
  }

  return bootstrapServers.map((server: any, index: number) =>
    createLwm2mBootstrapServerConfig(
      {
        shortServerId: Math.max(0, Number(server?.shortServerId) || 0),
        bootstrapServerIs: Boolean(server?.bootstrapServerIs),
        host:
          typeof server?.host === "string" && server.host.trim()
            ? server.host
            : "0.0.0.0",
        port: Math.max(0, Number(server?.port) || 0),
        clientHoldOffTime: Math.max(0, Number(server?.clientHoldOffTime) || 0),
        serverPublicKey: server?.serverPublicKey ?? "",
        serverCertificate: server?.serverCertificate ?? "",
        bootstrapServerAccountTimeout: Math.max(
          0,
          Number(server?.bootstrapServerAccountTimeout) || 0,
        ),
        lifetime: Math.max(0, Number(server?.lifetime) || 0),
        defaultMinPeriod: Math.max(0, Number(server?.defaultMinPeriod) || 0),
        notifIfDisabled: Boolean(server?.notifIfDisabled),
        binding: server?.binding ?? "U",
        securityMode: normalizeLwm2mSecurityMode(server?.securityMode),
      },
      server?.bootstrapServerIs
        ? `bootstrap-server-${index}`
        : `lwm2m-server-${index}`,
    ),
  );
};

const buildFormState = async (profile: any) => {
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
  const lwm2mObserveStrategy: Lwm2mObserveStrategy =
    transportConfiguration?.observeAttr?.observeStrategy === "COMPOSITE_ALL" ||
    transportConfiguration?.observeAttr?.observeStrategy ===
      "COMPOSITE_BY_OBJECT"
      ? transportConfiguration.observeAttr.observeStrategy
      : "SINGLE";
  const firstSnmpConfig =
    transportConfiguration?.communicationConfigs?.[0] ?? {};
  const referencedLwm2mObjectIds = getLwm2mReferencedObjectIds(
    transportConfiguration,
  );
  const resolvedLwm2mObjectDetails =
    transportType === "LWM2M" && referencedLwm2mObjectIds.length > 0
      ? await loadLwm2mObjectDetails(referencedLwm2mObjectIds)
      : {};
  const lwm2mObjectState =
    transportType === "LWM2M"
      ? buildLwm2mObjectState(
          transportConfiguration,
          resolvedLwm2mObjectDetails,
        )
      : {
          lwm2mObjectList: [] as Lwm2mObjectListItem[],
          lwm2mObjectConfigs: [] as Lwm2mObjectConfig[],
        };
  const defaultLwm2mJson = JSON.stringify(
    createDefaultLwm2mTransportConfiguration("SINGLE", "DRX", false),
    null,
    2,
  );

  const form: TransportFormState = {
    transportType,
    mqttSparkplugB: transportType === "MQTT" ? isSparkplug : false,
    mqttSparkplugAttributesMetricNames: ensureSparkplugDefaultMetrics(
      Array.isArray(transportConfiguration?.sparkplugAttributesMetricNames)
        ? transportConfiguration.sparkplugAttributesMetricNames
        : [...DEFAULT_SPARKPLUG_ATTRIBUTES_METRIC_NAMES],
    ),
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
    mqttTelemetryProtoSchema:
      transportConfiguration?.transportPayloadTypeConfiguration
        ?.deviceTelemetryProtoSchema || COAP_TELEMETRY_PROTO_SCHEMA_DEFAULT,
    mqttAttributesProtoSchema:
      transportConfiguration?.transportPayloadTypeConfiguration
        ?.deviceAttributesProtoSchema || COAP_ATTRIBUTES_PROTO_SCHEMA_DEFAULT,
    mqttRpcRequestProtoSchema:
      transportConfiguration?.transportPayloadTypeConfiguration
        ?.deviceRpcRequestProtoSchema || COAP_RPC_REQUEST_PROTO_SCHEMA_DEFAULT,
    mqttRpcResponseProtoSchema:
      transportConfiguration?.transportPayloadTypeConfiguration
        ?.deviceRpcResponseProtoSchema ||
      COAP_RPC_RESPONSE_PROTO_SCHEMA_DEFAULT,
    mqttEnableCompatibilityWithJsonPayloadFormat: Boolean(
      transportConfiguration?.transportPayloadTypeConfiguration
        ?.enableCompatibilityWithJsonPayloadFormat,
    ),
    mqttUseJsonPayloadFormatForDefaultDownlinkTopics: Boolean(
      transportConfiguration?.transportPayloadTypeConfiguration
        ?.useJsonPayloadFormatForDefaultDownlinkTopics,
    ),
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
    coapTelemetryProtoSchema:
      transportConfiguration?.coapDeviceTypeConfiguration
        ?.transportPayloadTypeConfiguration?.deviceTelemetryProtoSchema ||
      COAP_TELEMETRY_PROTO_SCHEMA_DEFAULT,
    coapAttributesProtoSchema:
      transportConfiguration?.coapDeviceTypeConfiguration
        ?.transportPayloadTypeConfiguration?.deviceAttributesProtoSchema ||
      COAP_ATTRIBUTES_PROTO_SCHEMA_DEFAULT,
    coapRpcRequestProtoSchema:
      transportConfiguration?.coapDeviceTypeConfiguration
        ?.transportPayloadTypeConfiguration?.deviceRpcRequestProtoSchema ||
      COAP_RPC_REQUEST_PROTO_SCHEMA_DEFAULT,
    coapRpcResponseProtoSchema:
      transportConfiguration?.coapDeviceTypeConfiguration
        ?.transportPayloadTypeConfiguration?.deviceRpcResponseProtoSchema ||
      COAP_RPC_RESPONSE_PROTO_SCHEMA_DEFAULT,
    coapPsmActivityTimer: String(
      transportConfiguration?.clientSettings?.psmActivityTimer ?? 10,
    ),
    coapPsmActivityTimerTimeUnit:
      transportConfiguration?.clientSettings?.psmActivityTimerTimeUnit ||
      "SECONDS",
    coapEdrxCycle: String(
      transportConfiguration?.clientSettings?.edrxCycle ?? 81,
    ),
    coapEdrxCycleTimeUnit:
      transportConfiguration?.clientSettings?.edrxCycleTimeUnit || "SECONDS",
    coapPagingTransmissionWindow: String(
      transportConfiguration?.clientSettings?.pagingTransmissionWindow ?? 10,
    ),
    coapPagingTransmissionWindowTimeUnit:
      transportConfiguration?.clientSettings
        ?.pagingTransmissionWindowTimeUnit || "SECONDS",
    lwm2mActiveTab: "model",
    lwm2mObjectList: lwm2mObjectState.lwm2mObjectList,
    lwm2mObjectConfigs: lwm2mObjectState.lwm2mObjectConfigs,
    lwm2mObserveStrategy,
    lwm2mPowerMode:
      transportConfiguration?.clientLwM2mSettings?.powerMode || "DRX",
    lwm2mPsmActivityTimer: String(
      transportConfiguration?.clientLwM2mSettings?.psmActivityTimer ?? 10,
    ),
    lwm2mPsmActivityTimerTimeUnit:
      transportConfiguration?.clientLwM2mSettings?.psmActivityTimerTimeUnit ||
      "SECONDS",
    lwm2mEdrxCycle: String(
      transportConfiguration?.clientLwM2mSettings?.edrxCycle ?? 81,
    ),
    lwm2mEdrxCycleTimeUnit:
      transportConfiguration?.clientLwM2mSettings?.edrxCycleTimeUnit ||
      "SECONDS",
    lwm2mPagingTransmissionWindow: String(
      transportConfiguration?.clientLwM2mSettings?.pagingTransmissionWindow ??
        10,
    ),
    lwm2mPagingTransmissionWindowTimeUnit:
      transportConfiguration?.clientLwM2mSettings
        ?.pagingTransmissionWindowTimeUnit || "SECONDS",
    lwm2mUseObject19ForOtaInfo: Boolean(
      transportConfiguration?.clientLwM2mSettings?.useObject19ForOtaInfo,
    ),
    lwm2mFirmwareUpdateStrategy: String(
      Math.max(
        1,
        Math.min(
          3,
          Number(
            transportConfiguration?.clientLwM2mSettings?.fwUpdateStrategy,
          ) || 1,
        ),
      ),
    ) as Lwm2mFirmwareUpdateStrategy,
    lwm2mFirmwareUpdateCoapResource:
      transportConfiguration?.clientLwM2mSettings?.fwUpdateResource ||
      DEFAULT_LWM2M_COAP_RESOURCE,
    lwm2mSoftwareUpdateStrategy: String(
      Math.max(
        1,
        Math.min(
          2,
          Number(
            transportConfiguration?.clientLwM2mSettings?.swUpdateStrategy,
          ) || 1,
        ),
      ),
    ) as Lwm2mSoftwareUpdateStrategy,
    lwm2mSoftwareUpdateCoapResource:
      transportConfiguration?.clientLwM2mSettings?.swUpdateResource ||
      DEFAULT_LWM2M_COAP_RESOURCE,
    lwm2mDefaultObjectVersion:
      transportConfiguration?.clientLwM2mSettings?.defaultObjectIDVer ===
        "1.1" ||
      transportConfiguration?.clientLwM2mSettings?.defaultObjectIDVer === "1.2"
        ? transportConfiguration.clientLwM2mSettings.defaultObjectIDVer
        : "1.0",
    lwm2mBootstrapServerUpdateEnable: Boolean(
      transportConfiguration?.bootstrapServerUpdateEnable,
    ),
    lwm2mBootstrapServers:
      transportType === "LWM2M"
        ? buildLwm2mBootstrapServersFromTransportConfiguration(
            transportConfiguration,
          )
        : [createDefaultLwm2mServerConfig()],
    lwm2mJsonConfig:
      transportType === "LWM2M"
        ? JSON.stringify(transportConfiguration ?? { type: "LWM2M" }, null, 2)
        : defaultLwm2mJson,
    snmpTimeoutMs: String(transportConfiguration?.timeoutMs ?? 500),
    snmpRetries: String(transportConfiguration?.retries ?? 0),
    snmpCommunicationConfigs:
      Array.isArray(transportConfiguration?.communicationConfigs) &&
      transportConfiguration.communicationConfigs.length > 0
        ? transportConfiguration.communicationConfigs.map((config: any) =>
            createSnmpCommunicationConfig(config),
          )
        : [createSnmpCommunicationConfig(firstSnmpConfig)],
  };

  return { form, resolvedLwm2mObjectDetails };
};

const createSnmpMapping = (mapping?: any): SnmpMappingForm => ({
  id: createId("snmp-mapping"),
  dataType:
    mapping?.dataType === "LONG" ||
    mapping?.dataType === "DOUBLE" ||
    mapping?.dataType === "BOOLEAN"
      ? mapping.dataType
      : "STRING",
  key: mapping?.key ?? "",
  oid: mapping?.oid ?? "",
});

const createSnmpCommunicationConfig = (
  config?: any,
): SnmpCommunicationConfigForm => ({
  id: createId("snmp-comm-config"),
  spec:
    config?.spec === "CLIENT_ATTRIBUTES_QUERYING" ||
    config?.spec === "SHARED_ATTRIBUTES_SETTING" ||
    config?.spec === "TELEMETRY_QUERYING" ||
    config?.spec === "TO_DEVICE_RPC_REQUEST" ||
    config?.spec === "TO_SERVER_RPC_REQUEST"
      ? config.spec
      : config?.spec === "CLIENT_ATTRIBUTES"
        ? "CLIENT_ATTRIBUTES_QUERYING"
        : config?.spec === "SHARED_ATTRIBUTES"
          ? "SHARED_ATTRIBUTES_SETTING"
          : config?.spec === "TELEMETRY"
            ? "TELEMETRY_QUERYING"
            : config?.spec === "FROM_DEVICE_RPC_REQUEST"
              ? "TO_SERVER_RPC_REQUEST"
              : "CLIENT_ATTRIBUTES_QUERYING",
  queryingFrequencyMs: String(config?.queryingFrequencyMs ?? 5000),
  mappings:
    Array.isArray(config?.mappings) && config.mappings.length > 0
      ? config.mappings.map((mapping: any) => createSnmpMapping(mapping))
      : [createSnmpMapping()],
});

export function DeviceProfileTransportTabContent({
  profileId,
}: DeviceProfileTransportTabContentProps) {
  const { resolvedTheme } = useTheme();
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
  const [lwm2mObjectSearch, setLwm2mObjectSearch] = useState("");
  const [isLwm2mJsonTouched, setIsLwm2mJsonTouched] = useState(false);
  const [resolvedLwm2mObjectDetails, setResolvedLwm2mObjectDetails] = useState<
    Record<string, Lwm2mObjectResource>
  >({});
  const editorTheme = resolvedTheme === "dark" ? "vs-dark" : "light";
  const { lwm2mObjectOptions, lwm2mObjectDetails, isLoadingLwm2mObjects } =
    useDeviceProfileReferenceData({
      open: true,
      transportType: form?.transportType ?? profile?.transportType ?? "DEFAULT",
      lwm2mActiveTab: form?.lwm2mActiveTab ?? "model",
      lwm2mObjectSearch,
    });
  const combinedLwm2mObjectDetails = useMemo(
    () => ({
      ...lwm2mObjectDetails,
      ...resolvedLwm2mObjectDetails,
    }),
    [lwm2mObjectDetails, resolvedLwm2mObjectDetails],
  );
  const {
    expandedLwm2mObjectKeys,
    expandedLwm2mBootstrapServerIds,
    instanceDialogObjectKey,
    instanceDraftInput,
    setInstanceDraftInput,
    instanceDraftValues,
    attributeDialogObjectKey,
    attributeDialogScope,
    attributeDialogInstanceId,
    attributeDraftValues,
    attributeDraftName,
    setAttributeDraftName,
    attributeDraftValue,
    setAttributeDraftValue,
    resetLwm2mUiState,
    addLwm2mObject,
    removeLwm2mObject,
    toggleLwm2mObjectExpanded,
    toggleLwm2mResourceFlag,
    toggleLwm2mInstanceBulk,
    handleLwm2mResourceKeyNameChange,
    openInstanceDialog,
    appendInstanceDraftValue,
    removeInstanceDraftValue,
    closeInstanceDialog,
    saveInstanceDraftValues,
    closeAttributeDialog,
    openObjectAttributeDialog,
    openInstanceAttributeDialog,
    appendAttributeDraftValue,
    removeAttributeDraftValue,
    saveAttributeDraftValues,
    toggleBootstrapServerUpdates,
    addLwm2mBootstrapServer,
    removeLwm2mBootstrapServer,
    toggleLwm2mBootstrapServerExpanded,
    updateLwm2mBootstrapServer,
  } = useLwm2mTransportForm({
    formState: form,
    setFormState: setForm,
    lwm2mObjectDetails: combinedLwm2mObjectDetails,
    lwm2mObjectSearch,
    setLwm2mObjectSearch,
    createDefaultLwm2mServerConfig,
    createDefaultLwm2mBootstrapUpdateServerConfig,
    sanitizeIpv4Input,
    attributeOptions: LWM2M_ATTRIBUTE_OPTIONS,
  });
  const {
    expandedCoapProtoSections,
    toggleCoapProtoSection,
    updateCoapField,
    resetCoapUiState,
  } = useCoapTransportForm<TransportFormState>({
    setFormState: setForm,
  });
  const {
    onTimeoutChange,
    onRetriesChange,
    onUpdateCommunicationConfig,
    onRemoveCommunicationConfig,
    onAddMapping,
    onUpdateMapping,
    onRemoveMapping,
    onAddCommunicationConfig,
  } = useSnmpTransportForm<TransportFormState>({
    setFormState: setForm,
    createCommunicationConfig: createSnmpCommunicationConfig,
    createMapping: createSnmpMapping,
    allScopes: SNMP_SCOPE_OPTIONS.map((option) => option.value),
    sanitizeNumeric: true,
  });
  const {
    updateMqttField,
    setMqttPayloadType,
    setMqttSparkplugB,
    addMqttSparkplugMetric,
    removeMqttSparkplugMetric,
  } = useMqttTransportForm<TransportFormState>({
    setFormState: setForm,
  });

  useEffect(() => {
    if (!profile) {
      return;
    }

    let isActive = true;

    const hydrate = async () => {
      const result = await buildFormState(profile);
      if (!isActive) {
        return;
      }

      setResolvedLwm2mObjectDetails(result.resolvedLwm2mObjectDetails);
      setForm(result.form);
      setIsEditing(false);
      resetLwm2mUiState();
      resetCoapUiState();
      setIsLwm2mJsonTouched(false);
    };

    void hydrate();

    return () => {
      isActive = false;
    };
  }, [profile]);

  useLwm2mJsonSync({
    enabled: Boolean(form && form.transportType === "LWM2M"),
    isJsonTouched: isLwm2mJsonTouched,
    state: form,
    currentJson: form?.lwm2mJsonConfig ?? "",
    buildConfig: (nextForm) =>
      nextForm ? buildLwm2mTransportConfigurationFromForm(nextForm) : {},
    onSyncJson: (nextJson) =>
      setForm((prev) =>
        prev && prev.lwm2mJsonConfig !== nextJson
          ? { ...prev, lwm2mJsonConfig: nextJson }
          : prev,
      ),
    deps: [form, isLwm2mJsonTouched],
  });

  const handleCancel = () => {
    if (!profile) {
      return;
    }

    void (async () => {
      const result = await buildFormState(profile);
      setResolvedLwm2mObjectDetails(result.resolvedLwm2mObjectDetails);
      setForm(result.form);
      setIsEditing(false);
      resetLwm2mUiState();
      resetCoapUiState();
      setIsLwm2mJsonTouched(false);
    })();
  };

  const validateLwm2mForm = (nextForm: TransportFormState) => {
    if (
      nextForm.lwm2mFirmwareUpdateStrategy === "2" &&
      !nextForm.lwm2mFirmwareUpdateCoapResource.trim()
    ) {
      return "Firmware update CoAP resource is required";
    }

    if (
      nextForm.lwm2mSoftwareUpdateStrategy === "2" &&
      !nextForm.lwm2mSoftwareUpdateCoapResource.trim()
    ) {
      return "Software update CoAP resource is required";
    }

    for (
      let index = 0;
      index < nextForm.lwm2mBootstrapServers.length;
      index += 1
    ) {
      const server = nextForm.lwm2mBootstrapServers[index];
      const serverLabel = server.bootstrapServerIs
        ? "Bootstrap server"
        : "LwM2M server";

      if (
        !/^\d+$/.test(server.shortServerId) ||
        Number(server.shortServerId) < 0
      ) {
        return `${serverLabel} #${index + 1}: Short server ID must be 0 or greater`;
      }

      if (!isValidIpv4Host(server.host)) {
        return `${serverLabel} #${index + 1}: Host must be a valid IPv4 address`;
      }

      if (!isValidPort(server.port)) {
        return `${serverLabel} #${index + 1}: Port must be between 1 and 65535`;
      }

      for (const field of LWM2M_POSITIVE_INT_FIELDS) {
        if (!isStrictPositiveInteger(server[field])) {
          return `${serverLabel} #${index + 1}: ${LWM2M_POSITIVE_INT_FIELD_LABELS[field]} must be greater than 0`;
        }
      }

      if (
        requiresServerPublicKey(server.securityMode) &&
        !server.serverPublicKey.trim()
      ) {
        return `${serverLabel} #${index + 1}: Server Public Key is required for selected security mode`;
      }
    }

    return null;
  };

  const validateSnmpForm = (nextForm: TransportFormState) => {
    if (!isStrictPositiveInteger(nextForm.snmpTimeoutMs.trim())) {
      return "Timeout, ms must be a positive integer";
    }

    const seenScopes = new Set<string>();

    for (
      let index = 0;
      index < nextForm.snmpCommunicationConfigs.length;
      index += 1
    ) {
      const config = nextForm.snmpCommunicationConfigs[index];

      if (seenScopes.has(config.spec)) {
        return `Communication config #${index + 1}: Scope must be unique`;
      }

      seenScopes.add(config.spec);

      if (
        requiresSnmpQueryingFrequency(config.spec) &&
        !isStrictPositiveInteger(config.queryingFrequencyMs.trim())
      ) {
        return `Communication config #${index + 1}: Querying frequency, ms must be a positive integer`;
      }

      for (
        let mappingIndex = 0;
        mappingIndex < config.mappings.length;
        mappingIndex += 1
      ) {
        const mapping = config.mappings[mappingIndex];

        if (mapping.oid.trim() && !isValidSnmpOid(mapping.oid)) {
          return `Communication config #${index + 1}, mapping #${mappingIndex + 1}: Invalid OID format`;
        }
      }
    }

    return null;
  };

  const handleSave = async () => {
    if (!profile || !form) {
      return;
    }

    let transportConfiguration: any = { type: "DEFAULT" };

    if (form.transportType === "MQTT") {
      const existingTransportConfig =
        profile.profileData?.transportConfiguration ?? {};
      const transportPayloadTypeConfiguration: Record<string, unknown> = {
        transportPayloadType: form.mqttPayloadType,
      };

      if (form.mqttPayloadType === "PROTOBUF") {
        transportPayloadTypeConfiguration.deviceTelemetryProtoSchema =
          form.mqttTelemetryProtoSchema;
        transportPayloadTypeConfiguration.deviceAttributesProtoSchema =
          form.mqttAttributesProtoSchema;
        transportPayloadTypeConfiguration.deviceRpcRequestProtoSchema =
          form.mqttRpcRequestProtoSchema;
        transportPayloadTypeConfiguration.deviceRpcResponseProtoSchema =
          form.mqttRpcResponseProtoSchema;
        transportPayloadTypeConfiguration.enableCompatibilityWithJsonPayloadFormat =
          form.mqttEnableCompatibilityWithJsonPayloadFormat;
        transportPayloadTypeConfiguration.useJsonPayloadFormatForDefaultDownlinkTopics =
          form.mqttEnableCompatibilityWithJsonPayloadFormat &&
          form.mqttUseJsonPayloadFormatForDefaultDownlinkTopics;
      }

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
        sparkplug: form.mqttSparkplugB,
        sparkplugAttributesMetricNames: form.mqttSparkplugB
          ? ensureSparkplugDefaultMetrics(
              form.mqttSparkplugAttributesMetricNames,
            )
          : undefined,
        sendAckOnValidationException: form.mqttSendPubackOnValidationFailure,
        transportPayloadTypeConfiguration,
      };
    } else if (form.transportType === "COAP") {
      const transportPayloadTypeConfiguration: Record<string, unknown> = {
        transportPayloadType: form.coapPayloadType,
      };

      if (
        form.coapDeviceType === "DEFAULT" &&
        form.coapPayloadType === "PROTOBUF"
      ) {
        transportPayloadTypeConfiguration.deviceTelemetryProtoSchema =
          form.coapTelemetryProtoSchema;
        transportPayloadTypeConfiguration.deviceAttributesProtoSchema =
          form.coapAttributesProtoSchema;
        transportPayloadTypeConfiguration.deviceRpcRequestProtoSchema =
          form.coapRpcRequestProtoSchema;
        transportPayloadTypeConfiguration.deviceRpcResponseProtoSchema =
          form.coapRpcResponseProtoSchema;
      }

      const clientSettings: Record<string, unknown> = {
        powerMode: form.coapPowerMode,
      };

      if (form.coapPowerMode === "PSM") {
        clientSettings.psmActivityTimer = Math.max(
          0,
          Number(form.coapPsmActivityTimer) || 0,
        );
        clientSettings.psmActivityTimerTimeUnit =
          form.coapPsmActivityTimerTimeUnit;
      }

      if (form.coapPowerMode === "EDRX") {
        clientSettings.edrxCycle = Math.max(0, Number(form.coapEdrxCycle) || 0);
        clientSettings.edrxCycleTimeUnit = form.coapEdrxCycleTimeUnit;
        clientSettings.pagingTransmissionWindow = Math.max(
          0,
          Number(form.coapPagingTransmissionWindow) || 0,
        );
        clientSettings.pagingTransmissionWindowTimeUnit =
          form.coapPagingTransmissionWindowTimeUnit;
      }

      transportConfiguration = {
        type: "COAP",
        coapDeviceTypeConfiguration: {
          coapDeviceType: form.coapDeviceType,
          transportPayloadTypeConfiguration,
        },
        clientSettings,
      };
    } else if (form.transportType === "LWM2M") {
      if (isLwm2mJsonTouched) {
        if (form.lwm2mJsonConfig.trim()) {
          try {
            const parsed = JSON.parse(form.lwm2mJsonConfig);
            if (
              parsed &&
              typeof parsed === "object" &&
              !Array.isArray(parsed)
            ) {
              transportConfiguration = parsed;
            }
          } catch {
            toast.error("Invalid LWM2M JSON config");
            return;
          }
        }
      } else {
        const validationError = validateLwm2mForm(form);
        if (validationError) {
          toast.error(validationError);
          return;
        }

        transportConfiguration = buildLwm2mTransportConfigurationFromForm(form);
      }

      if (!transportConfiguration || transportConfiguration.type !== "LWM2M") {
        try {
          transportConfiguration = JSON.parse(
            JSON.stringify(buildLwm2mTransportConfigurationFromForm(form)),
          );
        } catch {
          toast.error("Invalid LWM2M configuration");
          return;
        }
      }
    } else if (form.transportType === "SNMP") {
      const validationError = validateSnmpForm(form);
      if (validationError) {
        toast.error(validationError);
        return;
      }

      transportConfiguration = {
        type: "SNMP",
        timeoutMs: Math.max(1, Number(form.snmpTimeoutMs) || 1),
        retries: Math.max(0, Number(form.snmpRetries) || 0),
        communicationConfigs: form.snmpCommunicationConfigs.map((config) => ({
          spec: config.spec,
          ...(requiresSnmpQueryingFrequency(config.spec)
            ? {
                queryingFrequencyMs: Math.max(
                  1,
                  Number(config.queryingFrequencyMs) || 1,
                ),
              }
            : {}),
          mappings: config.mappings
            .filter((mapping) => mapping.key.trim() && mapping.oid.trim())
            .map((mapping) => ({
              dataType: mapping.dataType,
              key: mapping.key.trim(),
              oid: mapping.oid.trim(),
            })),
        })),
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
            <MqttSparkplugSection
              checkboxId="profile-transport-sparkplug-b"
              metricsInputId="profile-transport-sparkplug-metrics"
              checked={form.mqttSparkplugB}
              metrics={form.mqttSparkplugAttributesMetricNames}
              onCheckedChangeAction={setMqttSparkplugB}
              onAddMetricAction={addMqttSparkplugMetric}
              onRemoveMetricAction={removeMqttSparkplugMetric}
              disabled={isFormDisabled}
            />

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
                      updateMqttField(
                        "mqttTelemetryTopicFilter",
                        event.target.value,
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
                      updateMqttField(
                        "mqttAttributesPublishTopicFilter",
                        event.target.value,
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
                      updateMqttField(
                        "mqttAttributesSubscribeTopicFilter",
                        event.target.value,
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
                    onValueChange={setMqttPayloadType}
                    options={[
                      { value: "JSON", label: "JSON" },
                      { value: "PROTOBUF", label: "Protobuf" },
                    ]}
                    placeholder="Select payload type"
                    disabled={isFormDisabled}
                  />
                </div>

                {form.mqttPayloadType === "PROTOBUF" && (
                  <>
                    <div className="space-y-4 rounded-lg border border-muted bg-muted/30 p-4">
                      <div className="flex items-start gap-2">
                        <Checkbox
                          id="profile-transport-mqtt-json-compatibility"
                          checked={
                            form.mqttEnableCompatibilityWithJsonPayloadFormat
                          }
                          onCheckedChange={(checked) => {
                            const enabled = Boolean(checked);
                            updateMqttField(
                              "mqttEnableCompatibilityWithJsonPayloadFormat",
                              enabled,
                            );
                            if (!enabled) {
                              updateMqttField(
                                "mqttUseJsonPayloadFormatForDefaultDownlinkTopics",
                                false,
                              );
                            }
                          }}
                          className="mt-1"
                          disabled={isFormDisabled}
                        />
                        <div className="flex-1 space-y-1">
                          <label
                            htmlFor="profile-transport-mqtt-json-compatibility"
                            className="text-sm"
                          >
                            Enable compatibility with other payload formats.
                          </label>
                          <p className="text-xs text-muted-foreground">
                            When enabled, the platform will use a Protobuf
                            payload format by default. If parsing fails, the
                            platform will attempt to use JSON payload format.
                            Useful for backward compatibility during firmware
                            updates. For example, the initial release of the
                            firmware uses Json, while the new release uses
                            Protobuf. During the process of firmware update for
                            the fleet of devices, it is required to support both
                            Protobuf and JSON simultaneously. The compatibility
                            mode introduces slight performance degradation, so
                            it is recommended to disable this mode once all
                            devices are updated.
                          </p>
                        </div>
                      </div>

                      {form.mqttEnableCompatibilityWithJsonPayloadFormat && (
                        <div className="flex items-start gap-2">
                          <Checkbox
                            id="profile-transport-mqtt-json-downlinks"
                            checked={
                              form.mqttUseJsonPayloadFormatForDefaultDownlinkTopics
                            }
                            onCheckedChange={(checked) =>
                              updateMqttField(
                                "mqttUseJsonPayloadFormatForDefaultDownlinkTopics",
                                Boolean(checked),
                              )
                            }
                            className="mt-1"
                            disabled={isFormDisabled}
                          />
                          <div className="flex-1 space-y-1">
                            <label
                              htmlFor="profile-transport-mqtt-json-downlinks"
                              className="text-sm"
                            >
                              Use Json format for default downlink topics
                            </label>
                            <p className="text-xs text-muted-foreground">
                              When enabled, the platform will use Json payload
                              format to push attributes and RPC via the
                              following topics:
                              v1/devices/me/attributes/response/$request_id,
                              v1/devices/me/attributes,
                              v1/devices/me/rpc/request/$request_id,
                              v1/devices/me/rpc/response/$request_id. This
                              setting does not impact attribute and rpc
                              subscriptions sent using new (v2) topics:
                              v2/a/res/$request_id, v2/a, v2/r/req/$request_id,
                              v2/r/res/$request_id. Where $request_id is an
                              integer request identifier.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <TransportProtobufSchemasSection
                      title="MQTT Protobuf schemas"
                      telemetrySchema={form.mqttTelemetryProtoSchema}
                      attributesSchema={form.mqttAttributesProtoSchema}
                      rpcRequestSchema={form.mqttRpcRequestProtoSchema}
                      rpcResponseSchema={form.mqttRpcResponseProtoSchema}
                      expandedSections={expandedCoapProtoSections}
                      editorTheme={editorTheme}
                      disabled={isFormDisabled}
                      toggleDisabled={isSaving}
                      onToggleSectionAction={toggleCoapProtoSection}
                      onSchemaChangeAction={(field, value) => {
                        if (field === "telemetrySchema") {
                          updateMqttField("mqttTelemetryProtoSchema", value);
                          return;
                        }

                        if (field === "attributesSchema") {
                          updateMqttField("mqttAttributesProtoSchema", value);
                          return;
                        }

                        if (field === "rpcRequestSchema") {
                          updateMqttField("mqttRpcRequestProtoSchema", value);
                          return;
                        }

                        updateMqttField("mqttRpcResponseProtoSchema", value);
                      }}
                    />
                  </>
                )}

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="profile-transport-puback"
                    checked={form.mqttSendPubackOnValidationFailure}
                    onCheckedChange={(checked) =>
                      updateMqttField(
                        "mqttSendPubackOnValidationFailure",
                        Boolean(checked),
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
          <CoapTransportSection
            formState={form}
            payloadTypeOptions={[...PAYLOAD_TYPE_OPTIONS]}
            powerModeOptions={POWER_MODE_OPTIONS}
            timeUnitOptions={TIME_UNIT_OPTIONS}
            expandedCoapProtoSections={expandedCoapProtoSections}
            editorTheme={editorTheme}
            isSaving={isSaving}
            disabled={isFormDisabled}
            onToggleCoapProtoSection={toggleCoapProtoSection}
            onUpdateField={updateCoapField}
          />
        )}

        {form.transportType === "LWM2M" && (
          <Lwm2mModelTab
            formState={form}
            lwm2mTabOptions={LWM2M_TAB_OPTIONS}
            powerModeOptions={POWER_MODE_OPTIONS}
            timeUnitOptions={TIME_UNIT_OPTIONS}
            lwm2mFirmwareUpdateStrategyOptions={
              LWM2M_FIRMWARE_UPDATE_STRATEGY_OPTIONS
            }
            lwm2mSoftwareUpdateStrategyOptions={
              LWM2M_SOFTWARE_UPDATE_STRATEGY_OPTIONS
            }
            lwm2mDefaultObjectVersionOptions={
              LWM2M_DEFAULT_OBJECT_VERSION_OPTIONS
            }
            lwm2mObjectOptions={lwm2mObjectOptions}
            lwm2mObjectSearch={lwm2mObjectSearch}
            isLoadingLwm2mObjects={isLoadingLwm2mObjects}
            isSaving={isFormDisabled}
            expandedLwm2mObjectKeys={expandedLwm2mObjectKeys}
            editorTheme={editorTheme}
            onLwm2mTabChange={(tab) =>
              setForm((prev) =>
                prev ? { ...prev, lwm2mActiveTab: tab } : prev,
              )
            }
            onLwm2mSearchChange={setLwm2mObjectSearch}
            onAddLwm2mObject={addLwm2mObject}
            onRemoveLwm2mObject={removeLwm2mObject}
            onObserveStrategyChange={(strategy) =>
              setForm((prev) =>
                prev ? { ...prev, lwm2mObserveStrategy: strategy } : prev,
              )
            }
            onToggleLwm2mObjectExpanded={toggleLwm2mObjectExpanded}
            onOpenInstanceDialog={openInstanceDialog}
            onOpenObjectAttributesDialog={openObjectAttributeDialog}
            onOpenInstanceAttributesDialog={openInstanceAttributeDialog}
            onToggleLwm2mInstanceBulk={toggleLwm2mInstanceBulk}
            onToggleLwm2mResourceFlag={toggleLwm2mResourceFlag}
            onLwm2mResourceKeyNameChange={handleLwm2mResourceKeyNameChange}
            onToggleBootstrapServerUpdates={toggleBootstrapServerUpdates}
            onAddLwm2mBootstrapServer={addLwm2mBootstrapServer}
            onRemoveLwm2mBootstrapServer={removeLwm2mBootstrapServer}
            onToggleLwm2mBootstrapServerExpanded={
              toggleLwm2mBootstrapServerExpanded
            }
            onUpdateLwm2mBootstrapServer={updateLwm2mBootstrapServer}
            expandedLwm2mBootstrapServerIds={expandedLwm2mBootstrapServerIds}
            onPowerModeChange={(powerMode) =>
              setForm((prev) =>
                prev ? { ...prev, lwm2mPowerMode: powerMode } : prev,
              )
            }
            onLwm2mPsmActivityTimerChange={(value) =>
              setForm((prev) =>
                prev
                  ? {
                      ...prev,
                      lwm2mPsmActivityTimer: value.replace(/\D+/g, ""),
                    }
                  : prev,
              )
            }
            onLwm2mPsmActivityTimerTimeUnitChange={(unit) =>
              setForm((prev) =>
                prev ? { ...prev, lwm2mPsmActivityTimerTimeUnit: unit } : prev,
              )
            }
            onLwm2mEdrxCycleChange={(value) =>
              setForm((prev) =>
                prev
                  ? { ...prev, lwm2mEdrxCycle: value.replace(/\D+/g, "") }
                  : prev,
              )
            }
            onLwm2mEdrxCycleTimeUnitChange={(unit) =>
              setForm((prev) =>
                prev ? { ...prev, lwm2mEdrxCycleTimeUnit: unit } : prev,
              )
            }
            onLwm2mPagingTransmissionWindowChange={(value) =>
              setForm((prev) =>
                prev
                  ? {
                      ...prev,
                      lwm2mPagingTransmissionWindow: value.replace(/\D+/g, ""),
                    }
                  : prev,
              )
            }
            onLwm2mPagingTransmissionWindowTimeUnitChange={(unit) =>
              setForm((prev) =>
                prev
                  ? { ...prev, lwm2mPagingTransmissionWindowTimeUnit: unit }
                  : prev,
              )
            }
            onLwm2mUseObject19ForOtaInfoChange={(checked) =>
              setForm((prev) =>
                prev ? { ...prev, lwm2mUseObject19ForOtaInfo: checked } : prev,
              )
            }
            onLwm2mFirmwareUpdateStrategyChange={(strategy) =>
              setForm((prev) =>
                prev
                  ? { ...prev, lwm2mFirmwareUpdateStrategy: strategy }
                  : prev,
              )
            }
            onLwm2mFirmwareUpdateCoapResourceChange={(value) =>
              setForm((prev) =>
                prev
                  ? { ...prev, lwm2mFirmwareUpdateCoapResource: value }
                  : prev,
              )
            }
            onLwm2mSoftwareUpdateStrategyChange={(strategy) =>
              setForm((prev) =>
                prev
                  ? { ...prev, lwm2mSoftwareUpdateStrategy: strategy }
                  : prev,
              )
            }
            onLwm2mSoftwareUpdateCoapResourceChange={(value) =>
              setForm((prev) =>
                prev
                  ? { ...prev, lwm2mSoftwareUpdateCoapResource: value }
                  : prev,
              )
            }
            onLwm2mDefaultObjectVersionChange={(version) =>
              setForm((prev) =>
                prev ? { ...prev, lwm2mDefaultObjectVersion: version } : prev,
              )
            }
            onLwm2mJsonChange={(value) =>
              setForm((prev) => {
                if (!prev) {
                  return prev;
                }

                setIsLwm2mJsonTouched(true);
                return { ...prev, lwm2mJsonConfig: value };
              })
            }
          />
        )}

        {form.transportType === "SNMP" && (
          <SnmpTransportSection
            timeoutMs={form.snmpTimeoutMs}
            retries={form.snmpRetries}
            communicationConfigs={form.snmpCommunicationConfigs}
            scopeOptions={SNMP_SCOPE_OPTIONS}
            dataTypeOptions={SNMP_DATA_TYPE_OPTIONS}
            disabled={isFormDisabled}
            onTimeoutChange={onTimeoutChange}
            onRetriesChange={onRetriesChange}
            onUpdateCommunicationConfig={onUpdateCommunicationConfig}
            onRemoveCommunicationConfig={onRemoveCommunicationConfig}
            onAddMapping={onAddMapping}
            onUpdateMapping={onUpdateMapping}
            onRemoveMapping={onRemoveMapping}
            onAddCommunicationConfig={onAddCommunicationConfig}
          />
        )}
      </div>

      <Lwm2mInstanceDialog
        open={Boolean(instanceDialogObjectKey)}
        title="Manage object instances"
        instanceDraftValues={instanceDraftValues}
        instanceDraftInput={instanceDraftInput}
        onInputChange={setInstanceDraftInput}
        onAddDraftValue={appendInstanceDraftValue}
        onRemoveDraftValue={removeInstanceDraftValue}
        onCancel={closeInstanceDialog}
        onSave={saveInstanceDraftValues}
        disableSave={
          instanceDraftValues.length === 0 && !instanceDraftInput.trim()
        }
      />

      <Lwm2mInstanceAttributesDialog
        open={Boolean(attributeDialogObjectKey && attributeDialogScope)}
        title={
          attributeDialogScope === "INSTANCE" &&
          attributeDialogInstanceId !== null
            ? `Instance attributes #${attributeDialogInstanceId}`
            : "Object attributes"
        }
        rows={Object.entries(attributeDraftValues).map(([key, value]) => ({
          key: key as Lwm2mInstanceAttributeKey,
          label:
            LWM2M_ATTRIBUTE_OPTIONS.find((option) => option.value === key)
              ?.label ?? key,
          value: Number(value),
        }))}
        attributeOptions={LWM2M_ATTRIBUTE_OPTIONS.map((option) => ({
          ...option,
          disabled: typeof attributeDraftValues[option.value] !== "undefined",
        }))}
        selectedAttribute={attributeDraftName}
        attributeValue={attributeDraftValue}
        onSelectedAttributeChange={setAttributeDraftName}
        onAttributeValueChange={setAttributeDraftValue}
        onAdd={appendAttributeDraftValue}
        onRemove={removeAttributeDraftValue}
        onCancel={closeAttributeDialog}
        onSave={saveAttributeDraftValues}
        disableAdd={!attributeDraftValue.trim()}
      />
    </div>
  );
}
