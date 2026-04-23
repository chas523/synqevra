"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import Select from "@/components/molecules/PortalSelect";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  CreateDeviceProfileRequest,
  type DeviceProfileProvisionConfiguration,
  type DeviceProfileProvisionType,
} from "@/lib/services/thingsboardServices/deviceService";
import { DeviceProfileImageGalleryDialog } from "@/components/organisms/DeviceProfileImageGalleryDialog";
import { useTheme } from "next-themes";
import { type Lwm2mObjectOption } from "@/components/molecules/Lwm2mObjectListField";
import { DeviceProfileImagePreview } from "@/components/organisms/DeviceProfileImagePreview";
import { Lwm2mModelTab } from "@/components/organisms/Lwm2mModelTab";
import { Lwm2mInstanceDialog } from "@/components/organisms/Lwm2mInstanceDialog";
import { Lwm2mInstanceAttributesDialog } from "./Lwm2mInstanceAttributesDialog";
import { AlarmRulesTab } from "@/components/organisms/AlarmRulesTab";
import { ProvisioningTab } from "@/components/organisms/ProvisioningTab";
import { CoapTransportSection } from "@/components/organisms/CoapTransportSection";
import { SnmpTransportSection } from "@/components/organisms/SnmpTransportSection";
import { MqttSparkplugSection } from "./MqttSparkplugSection";
import { TransportProtobufSchemasSection } from "./TransportProtobufSchemasSection";
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
  ACTIVE_ALL_TIME,
  generateToken,
  toThingsBoardCondition,
  toThingsBoardSchedule,
} from "@/lib/services/thingsboardServices/deviceProfilePayloadUtils";
import {
  buildLwm2mTransportConfigurationFromForm,
  DEFAULT_LWM2M_COAP_RESOURCE,
} from "@/lib/services/thingsboardServices/lwm2mTransportConfigService";
import {
  DEFAULT_SPARKPLUG_ATTRIBUTES_METRIC_NAMES,
  ensureSparkplugDefaultMetrics,
} from "@/lib/constants/mqttSparkplug";

type TabKey = "details" | "transport" | "alarms" | "provisioning";
type AlarmSeverity =
  | "CRITICAL"
  | "MAJOR"
  | "MINOR"
  | "WARNING"
  | "INDETERMINATE";

type CreateRuleCondition = {
  id: string;
  severity: AlarmSeverity;
  condition: string;
  schedule: string;
  additionalInfo: string;
};

type ClearRuleCondition = {
  id: string;
  condition: string;
  schedule: string;
  additionalInfo: string;
};

type AlarmRule = {
  id: string;
  name: string;
  createRuleConditions: CreateRuleCondition[];
  clearRuleConditions: ClearRuleCondition[];
};

type TransportType = "DEFAULT" | "MQTT" | "COAP" | "LWM2M" | "SNMP";
type TransportPayloadType = "JSON" | "PROTOBUF";
type PowerMode = "DRX" | "EDRX" | "PSM";
type Lwm2mSecurityMode = "NO_SEC" | "PSK" | "RPK" | "X509_CERT";
type Lwm2mFirmwareUpdateStrategy = "1" | "2" | "3";
type Lwm2mSoftwareUpdateStrategy = "1" | "2";
type Lwm2mDefaultObjectVersion = "1.0" | "1.1" | "1.2";
type TimeUnit = "MILLISECONDS" | "SECONDS" | "MINUTES" | "HOURS";
type Lwm2mTab = "model" | "bootstrap" | "other" | "json";
type Lwm2mObserveStrategy = "SINGLE" | "COMPOSITE_ALL" | "COMPOSITE_BY_OBJECT";
type SnmpScope =
  | "CLIENT_ATTRIBUTES_QUERYING"
  | "SHARED_ATTRIBUTES_SETTING"
  | "TELEMETRY_QUERYING"
  | "TO_DEVICE_RPC_REQUEST"
  | "TO_SERVER_RPC_REQUEST";
type SnmpDataType = "STRING" | "LONG" | "DOUBLE" | "BOOLEAN";
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

type DeviceProfileFormState = {
  name: string;
  image: string;
  defaultRuleChainId: string;
  defaultQueueName: string;
  defaultEdgeRuleChainId: string;
  description: string;
  transportType: TransportType;
  mqttSparkplugB: boolean;
  mqttSparkplugAttributesMetricNames: string[];
  mqttTelemetryTopicFilter: string;
  mqttAttributesPublishTopicFilter: string;
  mqttAttributesSubscribeTopicFilter: string;
  mqttPayloadType: TransportPayloadType;
  mqttTelemetryProtoSchema: string;
  mqttAttributesProtoSchema: string;
  mqttRpcRequestProtoSchema: string;
  mqttRpcResponseProtoSchema: string;
  mqttEnableCompatibilityWithJsonPayloadFormat: boolean;
  mqttUseJsonPayloadFormatForDefaultDownlinkTopics: boolean;
  mqttSendPubackOnValidationFailure: boolean;
  coapDeviceType: "DEFAULT" | "EFENTO";
  coapPayloadType: TransportPayloadType;
  coapTelemetryProtoSchema: string;
  coapAttributesProtoSchema: string;
  coapRpcRequestProtoSchema: string;
  coapRpcResponseProtoSchema: string;
  coapPowerMode: PowerMode;
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
  snmpTimeoutMs: string;
  snmpRetries: string;
  snmpCommunicationConfigs: SnmpCommunicationConfigForm[];
  provisionType: DeviceProfileProvisionType;
  provisionDeviceKey: string;
  provisionDeviceSecret: string;
  provisionCertificateValue: string;
  provisionCertificateRegExPattern: string;
  provisionAllowCreateNewDevicesByX509Certificate: boolean;
  alarmRules: AlarmRule[];
};

const TABS: Array<{
  key: TabKey;
  step: number;
  label: string;
  optional?: boolean;
}> = [
  { key: "details", step: 1, label: "Device profile details" },
  {
    key: "transport",
    step: 2,
    label: "Transport configuration",
    optional: true,
  },
  { key: "alarms", step: 3, label: "Alarm rules", optional: true },
  {
    key: "provisioning",
    step: 4,
    label: "Device provisioning",
    optional: true,
  },
];

const SEVERITY_OPTIONS: Array<{ value: AlarmSeverity; label: string }> = [
  { value: "CRITICAL", label: "Critical" },
  { value: "MAJOR", label: "Major" },
  { value: "MINOR", label: "Minor" },
  { value: "WARNING", label: "Warning" },
  { value: "INDETERMINATE", label: "Indeterminate" },
];

const MQTT_DEFAULTS = {
  telemetry: "v1/devices/me/telemetry",
  attributesPublish: "v1/devices/me/attributes",
  attributesSubscribe: "v1/devices/me/attributes",
} as const;

const DEFAULT_SNMP_MAPPING = (): SnmpMappingForm => ({
  id: `snmp-mapping-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  dataType: "STRING",
  key: "",
  oid: "",
});

const DEFAULT_SNMP_COMMUNICATION_CONFIG = (): SnmpCommunicationConfigForm => ({
  id: `snmp-comm-config-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  spec: "CLIENT_ATTRIBUTES_QUERYING",
  queryingFrequencyMs: "5000",
  mappings: [DEFAULT_SNMP_MAPPING()],
});

const cloneLwm2mResources = (resources: Lwm2mResourceConfig[]) =>
  resources.map((resource) => ({ ...resource }));

const LWM2M_ATTRIBUTE_OPTIONS: Array<{
  value: Lwm2mInstanceAttributeKey;
  label: string;
}> = [
  { value: "minimumPeriod", label: "Minimum period" },
  { value: "maximumPeriod", label: "Maximum period" },
];

const X509_DEFAULT_REGEX = "(.*)";

const PROVISION_TYPE_OPTIONS: Array<{
  value: DeviceProfileProvisionType;
  label: string;
}> = [
  { value: "DISABLED", label: "Disabled" },
  {
    value: "ALLOW_CREATE_NEW_DEVICES",
    label: "Allow to create new devices",
  },
  {
    value: "CHECK_PRE_PROVISIONED_DEVICES",
    label: "Check for pre-provisioned devices",
  },
  {
    value: "X509_CERTIFICATE_CHAIN",
    label: "X509 Certificates Chain",
  },
];

const CREDENTIAL_PROVISION_TYPES: DeviceProfileProvisionType[] = [
  "ALLOW_CREATE_NEW_DEVICES",
  "CHECK_PRE_PROVISIONED_DEVICES",
];

const TRANSPORT_TYPE_OPTIONS: Array<{ value: TransportType; label: string }> = [
  { value: "DEFAULT", label: "Default" },
  { value: "MQTT", label: "MQTT" },
  { value: "COAP", label: "CoAP" },
  { value: "LWM2M", label: "LWM2M" },
  { value: "SNMP", label: "SNMP" },
];

const POWER_MODE_OPTIONS: Array<{ value: PowerMode; label: string }> = [
  { value: "PSM", label: "Power Saving Mode (PSM)" },
  { value: "DRX", label: "Discontinuous Reception (DRX)" },
  { value: "EDRX", label: "Extended Discontinuous Reception (eDRX)" },
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

const PAYLOAD_TYPE_OPTIONS: Array<{
  value: TransportPayloadType;
  label: string;
}> = [
  { value: "JSON", label: "JSON" },
  { value: "PROTOBUF", label: "Protobuf" },
];

const TIME_UNIT_OPTIONS: Array<{ value: TimeUnit; label: string }> = [
  { value: "MILLISECONDS", label: "Milliseconds" },
  { value: "SECONDS", label: "Seconds" },
  { value: "MINUTES", label: "Minutes" },
  { value: "HOURS", label: "Hours" },
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

const createDefaultLwm2mTransportConfiguration = (
  observeStrategy: Lwm2mObserveStrategy,
  powerMode: PowerMode,
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

const LWM2M_TAB_OPTIONS: Array<{ value: Lwm2mTab; label: string }> = [
  { value: "model", label: "LWM2M Model" },
  { value: "bootstrap", label: "Bootstrap" },
  { value: "other", label: "Other settings" },
  { value: "json", label: "Json Config Profile Device" },
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

const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

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

const INITIAL_FORM: DeviceProfileFormState = {
  name: "",
  image: "",
  defaultRuleChainId: "",
  defaultQueueName: "",
  defaultEdgeRuleChainId: "",
  description: "",
  transportType: "DEFAULT",
  mqttSparkplugB: false,
  mqttSparkplugAttributesMetricNames: [
    ...DEFAULT_SPARKPLUG_ATTRIBUTES_METRIC_NAMES,
  ],
  mqttTelemetryTopicFilter: MQTT_DEFAULTS.telemetry,
  mqttAttributesPublishTopicFilter: MQTT_DEFAULTS.attributesPublish,
  mqttAttributesSubscribeTopicFilter: MQTT_DEFAULTS.attributesSubscribe,
  mqttPayloadType: "JSON",
  mqttTelemetryProtoSchema: COAP_TELEMETRY_PROTO_SCHEMA_DEFAULT,
  mqttAttributesProtoSchema: COAP_ATTRIBUTES_PROTO_SCHEMA_DEFAULT,
  mqttRpcRequestProtoSchema: COAP_RPC_REQUEST_PROTO_SCHEMA_DEFAULT,
  mqttRpcResponseProtoSchema: COAP_RPC_RESPONSE_PROTO_SCHEMA_DEFAULT,
  mqttEnableCompatibilityWithJsonPayloadFormat: false,
  mqttUseJsonPayloadFormatForDefaultDownlinkTopics: false,
  mqttSendPubackOnValidationFailure: false,
  coapDeviceType: "DEFAULT",
  coapPayloadType: "JSON",
  coapTelemetryProtoSchema: COAP_TELEMETRY_PROTO_SCHEMA_DEFAULT,
  coapAttributesProtoSchema: COAP_ATTRIBUTES_PROTO_SCHEMA_DEFAULT,
  coapRpcRequestProtoSchema: COAP_RPC_REQUEST_PROTO_SCHEMA_DEFAULT,
  coapRpcResponseProtoSchema: COAP_RPC_RESPONSE_PROTO_SCHEMA_DEFAULT,
  coapPowerMode: "DRX",
  coapPsmActivityTimer: "10",
  coapPsmActivityTimerTimeUnit: "SECONDS",
  coapEdrxCycle: "81",
  coapEdrxCycleTimeUnit: "SECONDS",
  coapPagingTransmissionWindow: "10",
  coapPagingTransmissionWindowTimeUnit: "SECONDS",
  lwm2mActiveTab: "model",
  lwm2mObjectList: [],
  lwm2mObjectConfigs: [],
  lwm2mObserveStrategy: "SINGLE",
  lwm2mPowerMode: "DRX",
  lwm2mPsmActivityTimer: "10",
  lwm2mPsmActivityTimerTimeUnit: "SECONDS",
  lwm2mEdrxCycle: "81",
  lwm2mEdrxCycleTimeUnit: "SECONDS",
  lwm2mPagingTransmissionWindow: "10",
  lwm2mPagingTransmissionWindowTimeUnit: "SECONDS",
  lwm2mUseObject19ForOtaInfo: false,
  lwm2mFirmwareUpdateStrategy: "1",
  lwm2mFirmwareUpdateCoapResource: DEFAULT_LWM2M_COAP_RESOURCE,
  lwm2mSoftwareUpdateStrategy: "1",
  lwm2mSoftwareUpdateCoapResource: DEFAULT_LWM2M_COAP_RESOURCE,
  lwm2mDefaultObjectVersion: "1.0",
  lwm2mBootstrapServerUpdateEnable: false,
  lwm2mBootstrapServers: [createDefaultLwm2mServerConfig()],
  lwm2mJsonConfig: JSON.stringify(
    createDefaultLwm2mTransportConfiguration("SINGLE", "DRX", false),
    null,
    2,
  ),
  snmpTimeoutMs: "500",
  snmpRetries: "0",
  snmpCommunicationConfigs: [DEFAULT_SNMP_COMMUNICATION_CONFIG()],
  provisionType: "DISABLED",
  provisionDeviceKey: "",
  provisionDeviceSecret: "",
  provisionCertificateValue: "",
  provisionCertificateRegExPattern: X509_DEFAULT_REGEX,
  provisionAllowCreateNewDevicesByX509Certificate: true,
  alarmRules: [],
};

export interface AddDeviceProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateDeviceProfileRequest) => Promise<void>;
}

export function AddDeviceProfileDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddDeviceProfileDialogProps) {
  const { resolvedTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabKey>("details");
  const [formState, setFormState] =
    useState<DeviceProfileFormState>(INITIAL_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<"none" | "link">("none");
  const [expandedAlarmIds, setExpandedAlarmIds] = useState<Set<string>>(
    new Set(),
  );
  const [expandedCreateConditionIds, setExpandedCreateConditionIds] = useState<
    Set<string>
  >(new Set());
  const [lwm2mObjectSearch, setLwm2mObjectSearch] = useState("");
  const [isLwm2mJsonTouched, setIsLwm2mJsonTouched] = useState(false);
  const {
    coreRuleChains,
    edgeRuleChains,
    queues,
    isLoadingCoreRuleChains,
    isLoadingEdgeRuleChains,
    isLoadingQueues,
    lwm2mObjectOptions,
    lwm2mObjectDetails,
    isLoadingLwm2mObjects,
    loadCoreRuleChains,
    loadEdgeRuleChains,
    loadQueues,
    resetReferenceData,
    clearLwm2mObjects,
  } = useDeviceProfileReferenceData({
    open,
    transportType: formState.transportType,
    lwm2mActiveTab: formState.lwm2mActiveTab,
    lwm2mObjectSearch,
  });
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
    appendAttributeDraftValue: appendAttributeDraftValueRaw,
    removeAttributeDraftValue: removeAttributeDraftValueRaw,
    saveAttributeDraftValues,
    toggleBootstrapServerUpdates,
    addLwm2mBootstrapServer,
    removeLwm2mBootstrapServer,
    toggleLwm2mBootstrapServerExpanded,
    updateLwm2mBootstrapServer,
  } = useLwm2mTransportForm({
    formState,
    setFormState,
    lwm2mObjectDetails,
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
  } = useCoapTransportForm<DeviceProfileFormState>({
    setFormState,
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
  } = useSnmpTransportForm<DeviceProfileFormState>({
    setFormState,
    createCommunicationConfig: DEFAULT_SNMP_COMMUNICATION_CONFIG,
    createMapping: DEFAULT_SNMP_MAPPING,
    allScopes: SNMP_SCOPE_OPTIONS.map((option) => option.value),
  });
  const {
    updateMqttField,
    setMqttPayloadType,
    setMqttSparkplugB,
    addMqttSparkplugMetric,
    removeMqttSparkplugMetric,
  } = useMqttTransportForm<DeviceProfileFormState>({
    setFormState,
  });
  const editorTheme = resolvedTheme === "dark" ? "vs-dark" : "light";

  useEffect(() => {
    if (!open) {
      setActiveTab("details");
      setFormState(INITIAL_FORM);
      resetReferenceData();
      setIsSaving(false);
      setGalleryOpen(false);
      setImageInputMode("none");
      setExpandedAlarmIds(new Set());
      setExpandedCreateConditionIds(new Set());
      resetLwm2mUiState();
      setIsLwm2mJsonTouched(false);
      resetCoapUiState();
      return;
    }
  }, [open, resetReferenceData]);

  const coreRuleChainOptions = useMemo(
    () =>
      coreRuleChains.map((ruleChain) => ({
        value: ruleChain.id.id,
        label: ruleChain.name,
      })),
    [coreRuleChains],
  );

  const edgeRuleChainOptions = useMemo(
    () =>
      edgeRuleChains.map((ruleChain) => ({
        value: ruleChain.id.id,
        label: ruleChain.name,
      })),
    [edgeRuleChains],
  );

  const queueOptions = useMemo(
    () =>
      queues.map((queue) => ({
        value: queue.name,
        label: queue.name,
        description: `Submit Strategy: ${queue.submitStrategy.type}, Processing Strategy: ${queue.processingStrategy.type}`,
      })),
    [queues],
  );

  const updateField = <K extends keyof DeviceProfileFormState>(
    field: K,
    value: DeviceProfileFormState[K],
  ) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleTransportTypeChange = (value: string) => {
    const nextType = (value as TransportType) || "DEFAULT";

    setLwm2mObjectSearch("");
    clearLwm2mObjects();
    resetLwm2mUiState();

    setFormState((prev) => ({
      ...prev,
      transportType: nextType,
      mqttSparkplugB: false,
      mqttSparkplugAttributesMetricNames: [
        ...DEFAULT_SPARKPLUG_ATTRIBUTES_METRIC_NAMES,
      ],
      mqttTelemetryTopicFilter: MQTT_DEFAULTS.telemetry,
      mqttAttributesPublishTopicFilter: MQTT_DEFAULTS.attributesPublish,
      mqttAttributesSubscribeTopicFilter: MQTT_DEFAULTS.attributesSubscribe,
      mqttPayloadType: "JSON",
      mqttTelemetryProtoSchema: COAP_TELEMETRY_PROTO_SCHEMA_DEFAULT,
      mqttAttributesProtoSchema: COAP_ATTRIBUTES_PROTO_SCHEMA_DEFAULT,
      mqttRpcRequestProtoSchema: COAP_RPC_REQUEST_PROTO_SCHEMA_DEFAULT,
      mqttRpcResponseProtoSchema: COAP_RPC_RESPONSE_PROTO_SCHEMA_DEFAULT,
      mqttEnableCompatibilityWithJsonPayloadFormat: false,
      mqttUseJsonPayloadFormatForDefaultDownlinkTopics: false,
      mqttSendPubackOnValidationFailure: false,
      coapDeviceType: "DEFAULT",
      coapPayloadType: "JSON",
      coapTelemetryProtoSchema: COAP_TELEMETRY_PROTO_SCHEMA_DEFAULT,
      coapAttributesProtoSchema: COAP_ATTRIBUTES_PROTO_SCHEMA_DEFAULT,
      coapRpcRequestProtoSchema: COAP_RPC_REQUEST_PROTO_SCHEMA_DEFAULT,
      coapRpcResponseProtoSchema: COAP_RPC_RESPONSE_PROTO_SCHEMA_DEFAULT,
      coapPowerMode: "DRX",
      coapPsmActivityTimer: "10",
      coapPsmActivityTimerTimeUnit: "SECONDS",
      coapEdrxCycle: "81",
      coapEdrxCycleTimeUnit: "SECONDS",
      coapPagingTransmissionWindow: "10",
      coapPagingTransmissionWindowTimeUnit: "SECONDS",
      lwm2mActiveTab: "model",
      lwm2mObjectList: [],
      lwm2mObjectConfigs: [],
      lwm2mObserveStrategy: "SINGLE",
      lwm2mPowerMode: "DRX",
      lwm2mPsmActivityTimer: "10",
      lwm2mPsmActivityTimerTimeUnit: "SECONDS",
      lwm2mEdrxCycle: "81",
      lwm2mEdrxCycleTimeUnit: "SECONDS",
      lwm2mPagingTransmissionWindow: "10",
      lwm2mPagingTransmissionWindowTimeUnit: "SECONDS",
      lwm2mUseObject19ForOtaInfo: false,
      lwm2mFirmwareUpdateStrategy: "1",
      lwm2mFirmwareUpdateCoapResource: DEFAULT_LWM2M_COAP_RESOURCE,
      lwm2mSoftwareUpdateStrategy: "1",
      lwm2mSoftwareUpdateCoapResource: DEFAULT_LWM2M_COAP_RESOURCE,
      lwm2mDefaultObjectVersion: "1.0",
      lwm2mBootstrapServerUpdateEnable: false,
      lwm2mBootstrapServers: [createDefaultLwm2mServerConfig()],
      lwm2mJsonConfig: JSON.stringify(
        createDefaultLwm2mTransportConfiguration("SINGLE", "DRX", false),
        null,
        2,
      ),
      snmpTimeoutMs: "500",
      snmpRetries: "0",
      snmpCommunicationConfigs: [DEFAULT_SNMP_COMMUNICATION_CONFIG()],
    }));

    resetCoapUiState();
    setIsLwm2mJsonTouched(false);
  };

  const usesCredentialProvisioning = CREDENTIAL_PROVISION_TYPES.includes(
    formState.provisionType,
  );
  const usesX509Provisioning =
    formState.provisionType === "X509_CERTIFICATE_CHAIN";

  const ensureProvisionCredential = (
    field: "provisionDeviceKey" | "provisionDeviceSecret",
  ) => {
    setFormState((current) => {
      if (current[field].trim()) {
        return current;
      }

      return {
        ...current,
        [field]: generateToken(),
      };
    });
  };

  const handleProvisionTypeChange = (nextType: DeviceProfileProvisionType) => {
    setFormState((current) => ({
      ...current,
      provisionType: nextType,
      provisionDeviceKey:
        CREDENTIAL_PROVISION_TYPES.includes(nextType) &&
        !current.provisionDeviceKey.trim()
          ? generateToken()
          : current.provisionDeviceKey,
      provisionDeviceSecret:
        CREDENTIAL_PROVISION_TYPES.includes(nextType) &&
        !current.provisionDeviceSecret.trim()
          ? generateToken()
          : current.provisionDeviceSecret,
      provisionCertificateRegExPattern:
        nextType === "X509_CERTIFICATE_CHAIN" &&
        !current.provisionCertificateRegExPattern.trim()
          ? X509_DEFAULT_REGEX
          : current.provisionCertificateRegExPattern,
    }));
  };

  const getNextAvailableSeverity = (alarm: AlarmRule): AlarmSeverity | null => {
    const used = new Set(
      alarm.createRuleConditions.map((item) => item.severity),
    );
    const available = SEVERITY_OPTIONS.find(
      (option) => !used.has(option.value),
    );
    return available?.value ?? null;
  };

  const hasAvailableCreateSeverity = (alarm: AlarmRule) =>
    getNextAvailableSeverity(alarm) !== null;

  const getCreateSeverityOptions = (
    alarm: AlarmRule,
    currentConditionId: string,
  ) => {
    const usedByOther = new Set(
      alarm.createRuleConditions
        .filter((condition) => condition.id !== currentConditionId)
        .map((condition) => condition.severity),
    );

    return SEVERITY_OPTIONS.map((option) => ({
      value: option.value,
      label: option.label,
      disabled: usedByOther.has(option.value),
    }));
  };

  const addAlarmRule = () => {
    const newAlarm: AlarmRule = {
      id: createId("alarm"),
      name: "",
      createRuleConditions: [],
      clearRuleConditions: [],
    };

    setFormState((prev) => ({
      ...prev,
      alarmRules: [...prev.alarmRules, newAlarm],
    }));

    setExpandedAlarmIds((prev) => new Set([...prev, newAlarm.id]));
  };

  const deleteAlarmRule = (alarmId: string) => {
    setFormState((prev) => ({
      ...prev,
      alarmRules: prev.alarmRules.filter((alarm) => alarm.id !== alarmId),
    }));

    setExpandedAlarmIds((prev) => {
      const next = new Set(prev);
      next.delete(alarmId);
      return next;
    });
  };

  const toggleAlarmExpanded = (alarmId: string) => {
    setExpandedAlarmIds((prev) => {
      const next = new Set(prev);
      if (next.has(alarmId)) {
        next.delete(alarmId);
      } else {
        next.add(alarmId);
      }
      return next;
    });
  };

  const updateAlarmRule = <K extends keyof AlarmRule>(
    alarmId: string,
    field: K,
    value: AlarmRule[K],
  ) => {
    setFormState((prev) => ({
      ...prev,
      alarmRules: prev.alarmRules.map((alarm) =>
        alarm.id === alarmId ? { ...alarm, [field]: value } : alarm,
      ),
    }));
  };

  const addCreateCondition = (alarmId: string) => {
    const newConditionId = createId("create-condition");

    setFormState((prev) => ({
      ...prev,
      alarmRules: prev.alarmRules.map((alarm) => {
        if (alarm.id !== alarmId) {
          return alarm;
        }

        const nextSeverity = getNextAvailableSeverity(alarm);
        if (!nextSeverity) {
          return alarm;
        }

        const newCondition: CreateRuleCondition = {
          id: newConditionId,
          severity: nextSeverity,
          condition: "",
          schedule: "Active all the time",
          additionalInfo: "",
        };

        return {
          ...alarm,
          createRuleConditions: [...alarm.createRuleConditions, newCondition],
        };
      }),
    }));

    setExpandedCreateConditionIds((prev) => new Set([...prev, newConditionId]));
  };

  const deleteCreateCondition = (alarmId: string, conditionId: string) => {
    setFormState((prev) => ({
      ...prev,
      alarmRules: prev.alarmRules.map((alarm) =>
        alarm.id === alarmId
          ? {
              ...alarm,
              createRuleConditions: alarm.createRuleConditions.filter(
                (condition) => condition.id !== conditionId,
              ),
            }
          : alarm,
      ),
    }));

    setExpandedCreateConditionIds((prev) => {
      const next = new Set(prev);
      next.delete(conditionId);
      return next;
    });
  };

  const toggleCreateConditionExpanded = (conditionId: string) => {
    setExpandedCreateConditionIds((prev) => {
      const next = new Set(prev);
      if (next.has(conditionId)) {
        next.delete(conditionId);
      } else {
        next.add(conditionId);
      }
      return next;
    });
  };

  const updateCreateCondition = <K extends keyof CreateRuleCondition>(
    alarmId: string,
    conditionId: string,
    field: K,
    value: CreateRuleCondition[K],
  ) => {
    setFormState((prev) => ({
      ...prev,
      alarmRules: prev.alarmRules.map((alarm) =>
        alarm.id === alarmId
          ? {
              ...alarm,
              createRuleConditions: alarm.createRuleConditions.map(
                (condition) =>
                  condition.id === conditionId
                    ? { ...condition, [field]: value }
                    : condition,
              ),
            }
          : alarm,
      ),
    }));
  };

  const addClearCondition = (alarmId: string) => {
    const newCondition: ClearRuleCondition = {
      id: createId("clear-condition"),
      condition: "",
      schedule: "Active all the time",
      additionalInfo: "",
    };

    setFormState((prev) => ({
      ...prev,
      alarmRules: prev.alarmRules.map((alarm) =>
        alarm.id === alarmId
          ? {
              ...alarm,
              clearRuleConditions:
                alarm.clearRuleConditions.length === 0
                  ? [...alarm.clearRuleConditions, newCondition]
                  : alarm.clearRuleConditions,
            }
          : alarm,
      ),
    }));
  };

  const deleteClearCondition = (alarmId: string, conditionId: string) => {
    setFormState((prev) => ({
      ...prev,
      alarmRules: prev.alarmRules.map((alarm) =>
        alarm.id === alarmId
          ? {
              ...alarm,
              clearRuleConditions: alarm.clearRuleConditions.filter(
                (condition) => condition.id !== conditionId,
              ),
            }
          : alarm,
      ),
    }));
  };

  const updateClearCondition = <K extends keyof ClearRuleCondition>(
    alarmId: string,
    conditionId: string,
    field: K,
    value: ClearRuleCondition[K],
  ) => {
    setFormState((prev) => ({
      ...prev,
      alarmRules: prev.alarmRules.map((alarm) =>
        alarm.id === alarmId
          ? {
              ...alarm,
              clearRuleConditions: alarm.clearRuleConditions.map((condition) =>
                condition.id === conditionId
                  ? { ...condition, [field]: value }
                  : condition,
              ),
            }
          : alarm,
      ),
    }));
  };

  const getPayload = (
    overrides?: Partial<
      Pick<
        DeviceProfileFormState,
        "provisionDeviceKey" | "provisionDeviceSecret"
      >
    >,
  ): CreateDeviceProfileRequest => {
    let transportConfiguration: any = { type: "DEFAULT" };

    if (formState.transportType === "MQTT") {
      const transportPayloadTypeConfiguration: Record<string, unknown> = {
        transportPayloadType: formState.mqttPayloadType,
      };

      if (formState.mqttPayloadType === "PROTOBUF") {
        transportPayloadTypeConfiguration.deviceTelemetryProtoSchema =
          formState.mqttTelemetryProtoSchema;
        transportPayloadTypeConfiguration.deviceAttributesProtoSchema =
          formState.mqttAttributesProtoSchema;
        transportPayloadTypeConfiguration.deviceRpcRequestProtoSchema =
          formState.mqttRpcRequestProtoSchema;
        transportPayloadTypeConfiguration.deviceRpcResponseProtoSchema =
          formState.mqttRpcResponseProtoSchema;
        transportPayloadTypeConfiguration.enableCompatibilityWithJsonPayloadFormat =
          formState.mqttEnableCompatibilityWithJsonPayloadFormat;
        transportPayloadTypeConfiguration.useJsonPayloadFormatForDefaultDownlinkTopics =
          formState.mqttEnableCompatibilityWithJsonPayloadFormat &&
          formState.mqttUseJsonPayloadFormatForDefaultDownlinkTopics;
      }

      transportConfiguration = {
        type: "MQTT",
        deviceTelemetryTopic:
          formState.mqttTelemetryTopicFilter || MQTT_DEFAULTS.telemetry,
        deviceAttributesTopic:
          formState.mqttAttributesPublishTopicFilter ||
          MQTT_DEFAULTS.attributesPublish,
        deviceAttributesSubscribeTopic:
          formState.mqttAttributesSubscribeTopicFilter ||
          MQTT_DEFAULTS.attributesSubscribe,
        sparkplug: formState.mqttSparkplugB,
        ...(formState.mqttSparkplugB
          ? {
              sparkplugAttributesMetricNames: ensureSparkplugDefaultMetrics(
                formState.mqttSparkplugAttributesMetricNames,
              ),
            }
          : {}),
        sendAckOnValidationException:
          formState.mqttSendPubackOnValidationFailure,
        transportPayloadTypeConfiguration,
      };
    } else if (formState.transportType === "COAP") {
      const transportPayloadTypeConfiguration: Record<string, unknown> = {
        transportPayloadType: formState.coapPayloadType,
      };

      if (
        formState.coapDeviceType === "DEFAULT" &&
        formState.coapPayloadType === "PROTOBUF"
      ) {
        transportPayloadTypeConfiguration.deviceTelemetryProtoSchema =
          formState.coapTelemetryProtoSchema;
        transportPayloadTypeConfiguration.deviceAttributesProtoSchema =
          formState.coapAttributesProtoSchema;
        transportPayloadTypeConfiguration.deviceRpcRequestProtoSchema =
          formState.coapRpcRequestProtoSchema;
        transportPayloadTypeConfiguration.deviceRpcResponseProtoSchema =
          formState.coapRpcResponseProtoSchema;
      }

      const clientSettings: Record<string, unknown> = {
        powerMode: formState.coapPowerMode,
      };

      if (formState.coapPowerMode === "PSM") {
        clientSettings.psmActivityTimer = Math.max(
          0,
          Number(formState.coapPsmActivityTimer) || 0,
        );
        clientSettings.psmActivityTimerTimeUnit =
          formState.coapPsmActivityTimerTimeUnit;
      }

      if (formState.coapPowerMode === "EDRX") {
        clientSettings.edrxCycle = Math.max(
          0,
          Number(formState.coapEdrxCycle) || 0,
        );
        clientSettings.edrxCycleTimeUnit = formState.coapEdrxCycleTimeUnit;
        clientSettings.pagingTransmissionWindow = Math.max(
          0,
          Number(formState.coapPagingTransmissionWindow) || 0,
        );
        clientSettings.pagingTransmissionWindowTimeUnit =
          formState.coapPagingTransmissionWindowTimeUnit;
      }

      transportConfiguration = {
        type: "COAP",
        coapDeviceTypeConfiguration: {
          coapDeviceType: formState.coapDeviceType,
          transportPayloadTypeConfiguration,
        },
        clientSettings,
      };
    } else if (formState.transportType === "LWM2M") {
      if (isLwm2mJsonTouched && formState.lwm2mJsonConfig.trim()) {
        try {
          const parsed = JSON.parse(formState.lwm2mJsonConfig);
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            transportConfiguration = parsed;
          } else {
            transportConfiguration =
              buildLwm2mTransportConfigurationFromForm(formState);
          }
        } catch {
          transportConfiguration =
            buildLwm2mTransportConfigurationFromForm(formState);
        }
      } else {
        transportConfiguration =
          buildLwm2mTransportConfigurationFromForm(formState);
      }
    } else if (formState.transportType === "SNMP") {
      transportConfiguration = {
        type: "SNMP",
        timeoutMs: Math.max(1, Number(formState.snmpTimeoutMs) || 1),
        retries: Math.max(0, Number(formState.snmpRetries) || 0),
        communicationConfigs: formState.snmpCommunicationConfigs.map(
          (config) => ({
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
          }),
        ),
      };
    }

    const provisionDeviceKey = usesCredentialProvisioning
      ? (overrides?.provisionDeviceKey ?? formState.provisionDeviceKey).trim()
      : null;

    const provisionDeviceSecret = usesCredentialProvisioning
      ? (
          overrides?.provisionDeviceSecret ?? formState.provisionDeviceSecret
        ).trim()
      : usesX509Provisioning
        ? formState.provisionCertificateValue.trim() || null
        : null;

    let provisionConfiguration: DeviceProfileProvisionConfiguration = {
      type: "DISABLED",
      provisionDeviceSecret: null,
    };

    if (usesCredentialProvisioning && provisionDeviceSecret) {
      provisionConfiguration = {
        type: formState.provisionType as
          | "ALLOW_CREATE_NEW_DEVICES"
          | "CHECK_PRE_PROVISIONED_DEVICES",
        provisionDeviceSecret,
      };
    } else if (usesX509Provisioning && provisionDeviceSecret) {
      provisionConfiguration = {
        type: "X509_CERTIFICATE_CHAIN",
        provisionDeviceSecret,
        certificateRegExPattern:
          formState.provisionCertificateRegExPattern.trim() ||
          X509_DEFAULT_REGEX,
        allowCreateNewDevicesByX509Certificate:
          formState.provisionAllowCreateNewDevicesByX509Certificate,
      };
    }

    return {
      name: formState.name.trim(),
      type: "DEFAULT",
      image: formState.image.trim() || null,
      defaultQueueName: formState.defaultQueueName || null,
      transportType: formState.transportType,
      provisionType: provisionConfiguration.type,
      provisionDeviceKey,
      description: formState.description.trim() || null,
      profileData: {
        configuration: { type: "DEFAULT" },
        transportConfiguration,
        alarms: formState.alarmRules.map(
          ({ id, name, createRuleConditions, clearRuleConditions }) => {
            const createRules = createRuleConditions.reduce(
              (acc, condition) => {
                acc[condition.severity] = {
                  condition: toThingsBoardCondition(condition.condition),
                  schedule: toThingsBoardSchedule(condition.schedule),
                  alarmDetails: condition.additionalInfo.trim()
                    ? { info: condition.additionalInfo.trim() }
                    : null,
                  dashboardId: null,
                };
                return acc;
              },
              {} as Record<string, unknown>,
            );

            const firstClearRule = clearRuleConditions[0];

            return {
              id: null,
              alarmType: name,
              createRules,
              clearRule: firstClearRule
                ? {
                    condition: toThingsBoardCondition(firstClearRule.condition),
                    schedule: toThingsBoardSchedule(firstClearRule.schedule),
                    alarmDetails: firstClearRule.additionalInfo.trim()
                      ? { info: firstClearRule.additionalInfo.trim() }
                      : null,
                    dashboardId: null,
                  }
                : null,
              propagate: false,
              propagateToOwner: false,
              propagateToTenant: false,
              propagateRelationTypes: null,
            };
          },
        ),
        provisionConfiguration,
      },
      defaultRuleChainId: formState.defaultRuleChainId
        ? {
            entityType: "RULE_CHAIN",
            id: formState.defaultRuleChainId,
          }
        : null,
      defaultEdgeRuleChainId: formState.defaultEdgeRuleChainId
        ? {
            entityType: "RULE_CHAIN",
            id: formState.defaultEdgeRuleChainId,
          }
        : null,
    };
  };

  const handleSubmit = async () => {
    if (!formState.name.trim()) {
      return;
    }

    if (
      formState.transportType === "LWM2M" &&
      formState.lwm2mJsonConfig.trim()
    ) {
      try {
        JSON.parse(formState.lwm2mJsonConfig);
      } catch {
        toast.error("LWM2M JSON config is invalid");
        setActiveTab("transport");
        setFormState((prev) => ({ ...prev, lwm2mActiveTab: "json" }));
        return;
      }
    }

    if (formState.transportType === "LWM2M") {
      if (
        formState.lwm2mPowerMode === "PSM" &&
        !isStrictPositiveInteger(formState.lwm2mPsmActivityTimer.trim())
      ) {
        toast.error("PSM Activity Timer must be a positive integer");
        setActiveTab("transport");
        setFormState((prev) => ({ ...prev, lwm2mActiveTab: "other" }));
        return;
      }

      if (formState.lwm2mPowerMode === "EDRX") {
        if (!isStrictPositiveInteger(formState.lwm2mEdrxCycle.trim())) {
          toast.error("eDRX cycle must be a positive integer");
          setActiveTab("transport");
          setFormState((prev) => ({ ...prev, lwm2mActiveTab: "other" }));
          return;
        }

        if (
          !isStrictPositiveInteger(
            formState.lwm2mPagingTransmissionWindow.trim(),
          )
        ) {
          toast.error("Paging Transmission Window must be a positive integer");
          setActiveTab("transport");
          setFormState((prev) => ({ ...prev, lwm2mActiveTab: "other" }));
          return;
        }
      }

      if (
        formState.lwm2mFirmwareUpdateStrategy === "2" &&
        !formState.lwm2mFirmwareUpdateCoapResource.trim()
      ) {
        toast.error(
          "Firmware update CoAP resource is required for auto-generate strategy",
        );
        setActiveTab("transport");
        setFormState((prev) => ({ ...prev, lwm2mActiveTab: "other" }));
        return;
      }

      if (
        formState.lwm2mSoftwareUpdateStrategy === "2" &&
        !formState.lwm2mSoftwareUpdateCoapResource.trim()
      ) {
        toast.error(
          "Software update CoAP resource is required for auto-generate strategy",
        );
        setActiveTab("transport");
        setFormState((prev) => ({ ...prev, lwm2mActiveTab: "other" }));
        return;
      }

      for (let i = 0; i < formState.lwm2mBootstrapServers.length; i += 1) {
        const server = formState.lwm2mBootstrapServers[i];
        const serverLabel = server.bootstrapServerIs
          ? `Bootstrap Server #${i + 1}`
          : `LwM2M Server #${i + 1}`;

        if (!isValidIpv4Host(server.host.trim())) {
          toast.error(
            `${serverLabel}: Host must be an IPv4 address in format x.x.x.x with each value 0-255`,
          );
          setActiveTab("transport");
          setFormState((prev) => ({ ...prev, lwm2mActiveTab: "bootstrap" }));
          return;
        }

        if (!isValidPort(server.port.trim())) {
          toast.error(`${serverLabel}: Port must be a number in range 1-65535`);
          setActiveTab("transport");
          setFormState((prev) => ({ ...prev, lwm2mActiveTab: "bootstrap" }));
          return;
        }

        for (const field of LWM2M_POSITIVE_INT_FIELDS) {
          const rawValue = String(server[field] ?? "").trim();
          if (!isStrictPositiveInteger(rawValue)) {
            toast.error(
              `${serverLabel}: ${LWM2M_POSITIVE_INT_FIELD_LABELS[field]} must be a positive integer`,
            );
            setActiveTab("transport");
            setFormState((prev) => ({
              ...prev,
              lwm2mActiveTab: "bootstrap",
            }));
            return;
          }
        }

        if (
          requiresServerPublicKey(server.securityMode) &&
          !server.serverPublicKey.trim()
        ) {
          toast.error(
            `${serverLabel}: Server PubMQTT device payloadlic Key is required`,
          );
          setActiveTab("transport");
          setFormState((prev) => ({ ...prev, lwm2mActiveTab: "bootstrap" }));
          return;
        }
      }
    }

    if (formState.transportType === "SNMP") {
      if (!isStrictPositiveInteger(formState.snmpTimeoutMs.trim())) {
        toast.error("Timeout, ms must be a positive integer");
        setActiveTab("transport");
        return;
      }

      const seenScopes = new Set<string>();

      for (
        let index = 0;
        index < formState.snmpCommunicationConfigs.length;
        index += 1
      ) {
        const config = formState.snmpCommunicationConfigs[index];

        if (seenScopes.has(config.spec)) {
          toast.error(
            `Communication config #${index + 1}: Scope must be unique`,
          );
          setActiveTab("transport");
          return;
        }

        seenScopes.add(config.spec);

        if (
          requiresSnmpQueryingFrequency(config.spec) &&
          !isStrictPositiveInteger(config.queryingFrequencyMs.trim())
        ) {
          toast.error(
            `Communication config #${index + 1}: Querying frequency, ms must be a positive integer`,
          );
          setActiveTab("transport");
          return;
        }

        for (
          let mappingIndex = 0;
          mappingIndex < config.mappings.length;
          mappingIndex += 1
        ) {
          const mapping = config.mappings[mappingIndex];

          if (mapping.oid.trim() && !isValidSnmpOid(mapping.oid)) {
            toast.error(
              `Communication config #${index + 1}, mapping #${mappingIndex + 1}: Invalid OID format`,
            );
            setActiveTab("transport");
            return;
          }
        }
      }
    }

    let provisioningOverrides:
      | Partial<
          Pick<
            DeviceProfileFormState,
            "provisionDeviceKey" | "provisionDeviceSecret"
          >
        >
      | undefined;

    if (usesX509Provisioning && !formState.provisionCertificateValue.trim()) {
      toast.error("PEM certificate is required for X509 provisioning");
      return;
    }

    if (
      usesX509Provisioning &&
      !formState.provisionCertificateRegExPattern.trim()
    ) {
      toast.error(
        "CN Regular Expression variable is required for X509 provisioning",
      );
      return;
    }

    if (usesCredentialProvisioning) {
      const nextProvisionDeviceKey = formState.provisionDeviceKey.trim();
      const nextProvisionDeviceSecret = formState.provisionDeviceSecret.trim();

      if (!nextProvisionDeviceKey) {
        toast.error("Provision device key is required");
        return;
      }

      if (!nextProvisionDeviceSecret) {
        toast.error("Provision device secret is required");
        return;
      }

      if (
        nextProvisionDeviceKey !== formState.provisionDeviceKey ||
        nextProvisionDeviceSecret !== formState.provisionDeviceSecret
      ) {
        provisioningOverrides = {
          provisionDeviceKey: nextProvisionDeviceKey,
          provisionDeviceSecret: nextProvisionDeviceSecret,
        };

        setFormState((current) => ({
          ...current,
          provisionDeviceKey: nextProvisionDeviceKey,
          provisionDeviceSecret: nextProvisionDeviceSecret,
        }));
      }
    }

    try {
      setIsSaving(true);
      await onSubmit(getPayload(provisioningOverrides));
      onOpenChange(false);
    } catch {
      // error already handled by onSubmit (toast shown); keep dialog open
    } finally {
      setIsSaving(false);
    }
  };

  const handleLwm2mObserveStrategyChange = (
    nextObserveStrategy: Lwm2mObserveStrategy,
  ) => {
    setFormState((prev) => {
      if (prev.lwm2mObserveStrategy === nextObserveStrategy) {
        return prev;
      }

      if (!isLwm2mJsonTouched) {
        return {
          ...prev,
          lwm2mObserveStrategy: nextObserveStrategy,
          lwm2mJsonConfig: JSON.stringify(
            createDefaultLwm2mTransportConfiguration(
              nextObserveStrategy,
              prev.lwm2mPowerMode,
              prev.lwm2mObjectList.length > 0,
            ),
            null,
            2,
          ),
        };
      }

      return {
        ...prev,
        lwm2mObserveStrategy: nextObserveStrategy,
      };
    });
  };

  const handleLwm2mPowerModeChange = (nextPowerMode: PowerMode) => {
    setFormState((prev) => {
      if (prev.lwm2mPowerMode === nextPowerMode) {
        return prev;
      }

      if (!isLwm2mJsonTouched) {
        return {
          ...prev,
          lwm2mPowerMode: nextPowerMode,
          lwm2mJsonConfig: JSON.stringify(
            createDefaultLwm2mTransportConfiguration(
              prev.lwm2mObserveStrategy,
              nextPowerMode,
              prev.lwm2mObjectList.length > 0,
            ),
            null,
            2,
          ),
        };
      }

      return {
        ...prev,
        lwm2mPowerMode: nextPowerMode,
      };
    });
  };

  const handleLwm2mPsmActivityTimerChange = (value: string) => {
    updateField("lwm2mPsmActivityTimer", value.replace(/\D+/g, ""));
  };

  const handleLwm2mPsmActivityTimerTimeUnitChange = (unit: TimeUnit) => {
    updateField("lwm2mPsmActivityTimerTimeUnit", unit);
  };

  const handleLwm2mEdrxCycleChange = (value: string) => {
    updateField("lwm2mEdrxCycle", value.replace(/\D+/g, ""));
  };

  const handleLwm2mEdrxCycleTimeUnitChange = (unit: TimeUnit) => {
    updateField("lwm2mEdrxCycleTimeUnit", unit);
  };

  const handleLwm2mPagingTransmissionWindowChange = (value: string) => {
    updateField("lwm2mPagingTransmissionWindow", value.replace(/\D+/g, ""));
  };

  const handleLwm2mPagingTransmissionWindowTimeUnitChange = (
    unit: TimeUnit,
  ) => {
    updateField("lwm2mPagingTransmissionWindowTimeUnit", unit);
  };

  const handleLwm2mUseObject19ForOtaInfoChange = (checked: boolean) => {
    updateField("lwm2mUseObject19ForOtaInfo", checked);
  };

  const handleLwm2mFirmwareUpdateStrategyChange = (
    nextStrategy: Lwm2mFirmwareUpdateStrategy,
  ) => {
    updateField("lwm2mFirmwareUpdateStrategy", nextStrategy);
  };

  const handleLwm2mFirmwareUpdateCoapResourceChange = (value: string) => {
    updateField("lwm2mFirmwareUpdateCoapResource", value);
  };

  const handleLwm2mSoftwareUpdateStrategyChange = (
    nextStrategy: Lwm2mSoftwareUpdateStrategy,
  ) => {
    updateField("lwm2mSoftwareUpdateStrategy", nextStrategy);
  };

  const handleLwm2mSoftwareUpdateCoapResourceChange = (value: string) => {
    updateField("lwm2mSoftwareUpdateCoapResource", value);
  };

  const handleLwm2mDefaultObjectVersionChange = (
    nextVersion: Lwm2mDefaultObjectVersion,
  ) => {
    updateField("lwm2mDefaultObjectVersion", nextVersion);
  };

  useLwm2mJsonSync({
    enabled: formState.transportType === "LWM2M",
    isJsonTouched: isLwm2mJsonTouched,
    state: formState,
    currentJson: formState.lwm2mJsonConfig,
    buildConfig: buildLwm2mTransportConfigurationFromForm,
    onSyncJson: (nextJson) =>
      setFormState((prev) =>
        prev.lwm2mJsonConfig === nextJson
          ? prev
          : { ...prev, lwm2mJsonConfig: nextJson },
      ),
    deps: [
      formState.transportType,
      formState.lwm2mObjectConfigs,
      formState.lwm2mObserveStrategy,
      formState.lwm2mBootstrapServers,
      formState.lwm2mBootstrapServerUpdateEnable,
      formState.lwm2mUseObject19ForOtaInfo,
      formState.lwm2mFirmwareUpdateStrategy,
      formState.lwm2mFirmwareUpdateCoapResource,
      formState.lwm2mSoftwareUpdateStrategy,
      formState.lwm2mSoftwareUpdateCoapResource,
      formState.lwm2mPowerMode,
      formState.lwm2mPsmActivityTimer,
      formState.lwm2mPsmActivityTimerTimeUnit,
      formState.lwm2mEdrxCycle,
      formState.lwm2mEdrxCycleTimeUnit,
      formState.lwm2mPagingTransmissionWindow,
      formState.lwm2mPagingTransmissionWindowTimeUnit,
      formState.lwm2mDefaultObjectVersion,
    ],
  });

  const appendAttributeDraftValue = () => {
    const raw = attributeDraftValue.trim();
    if (!raw) {
      return;
    }

    if (typeof attributeDraftValues[attributeDraftName] !== "undefined") {
      toast.error("This attribute is already added for this instance");
      return;
    }

    if (!/^[0-9]+$/.test(raw)) {
      toast.error("Attribute value must be a positive integer");
      return;
    }

    const parsed = Number.parseInt(raw, 10);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      toast.error("Attribute value must be a positive integer");
      return;
    }

    appendAttributeDraftValueRaw();
  };

  const removeAttributeDraftValue = (key: Lwm2mInstanceAttributeKey) => {
    removeAttributeDraftValueRaw(key);
    setAttributeDraftName(key);
  };

  const attributeRows = LWM2M_ATTRIBUTE_OPTIONS.filter(
    ({ value }) => typeof attributeDraftValues[value] !== "undefined",
  ).map(({ value, label }) => ({
    key: value,
    label,
    value: attributeDraftValues[value] as number,
  }));
  const availableAttributeOptions = LWM2M_ATTRIBUTE_OPTIONS.map((option) => ({
    ...option,
    disabled: typeof attributeDraftValues[option.value] !== "undefined",
  }));
  const canAddAttribute =
    /^[0-9]+$/.test(attributeDraftValue.trim()) &&
    Number.parseInt(attributeDraftValue.trim() || "0", 10) > 0 &&
    typeof attributeDraftValues[attributeDraftName] === "undefined";

  const currentTabIndex = TABS.findIndex((tab) => tab.key === activeTab);
  const nextTab = TABS[currentTabIndex + 1];
  const prevTab = TABS[currentTabIndex - 1];
  const instanceDialogObject = instanceDialogObjectKey
    ? formState.lwm2mObjectConfigs.find(
        (item) => item.keyId === instanceDialogObjectKey,
      )
    : null;
  const attributeDialogObject = attributeDialogObjectKey
    ? formState.lwm2mObjectConfigs.find(
        (item) => item.keyId === attributeDialogObjectKey,
      )
    : null;
  const hasMissingProvisioningFields =
    (usesCredentialProvisioning &&
      (!formState.provisionDeviceKey.trim() ||
        !formState.provisionDeviceSecret.trim())) ||
    (usesX509Provisioning &&
      (!formState.provisionCertificateValue.trim() ||
        !formState.provisionCertificateRegExPattern.trim()));

  const clearImage = () => {
    updateField("image", "");
    setImageInputMode("none");
  };

  return (
    <>
      <Dialog open={open} modal={false} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto sm:max-w-4xl"
          onInteractOutside={(event) => {
            if (instanceDialogObjectKey || attributeDialogObjectKey) {
              event.preventDefault();
            }
          }}
          onEscapeKeyDown={(event) => {
            if (instanceDialogObjectKey || attributeDialogObjectKey) {
              event.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Add device profile</DialogTitle>
            <DialogDescription>
              Create a new device profile and configure its default behavior.
            </DialogDescription>
          </DialogHeader>

          <div className="border-b">
            <nav
              className="flex flex-wrap gap-2 pb-3"
              aria-label="Device profile tabs"
            >
              {TABS.map((tab) => {
                const isActive = tab.key === activeTab;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={[
                      "flex min-w-45 items-start gap-3 rounded-md border-b-2 px-2 py-2 text-left transition-colors",
                      isActive
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                        isActive
                          ? "bg-blue-600 text-white"
                          : "bg-muted text-muted-foreground",
                      ].join(" ")}
                    >
                      {tab.step}
                    </span>
                    <span className="flex flex-col">
                      <span className="text-sm font-medium">{tab.label}</span>
                      {tab.optional && (
                        <span className="text-xs text-muted-foreground">
                          Optional
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="space-y-5 pt-2">
            {activeTab === "details" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium"
                    htmlFor="device-profile-name"
                  >
                    Name*
                  </label>
                  <Input
                    id="device-profile-name"
                    value={formState.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    placeholder="Enter device profile name"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Default rule chain
                  </label>
                  <Select
                    options={coreRuleChainOptions}
                    value={formState.defaultRuleChainId}
                    onValueChange={(value) =>
                      updateField("defaultRuleChainId", value)
                    }
                    onOpenChange={(nextOpen) => {
                      if (nextOpen) {
                        void loadCoreRuleChains();
                      }
                    }}
                    placeholder={
                      isLoadingCoreRuleChains
                        ? "Loading rule chains..."
                        : "Select rule chain"
                    }
                    emptyMessage={
                      isLoadingCoreRuleChains
                        ? "Loading rule chains..."
                        : "No rule chains found"
                    }
                    allowClear
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Queue</label>
                  <Select
                    options={queueOptions}
                    value={formState.defaultQueueName}
                    onValueChange={(value) =>
                      updateField("defaultQueueName", value)
                    }
                    onOpenChange={(nextOpen) => {
                      if (nextOpen) {
                        void loadQueues();
                      }
                    }}
                    placeholder={
                      isLoadingQueues ? "Loading queues..." : "Select queue"
                    }
                    emptyMessage={
                      isLoadingQueues ? "Loading queues..." : "No queues found"
                    }
                    allowClear
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Default edge rule chain
                  </label>
                  <Select
                    options={edgeRuleChainOptions}
                    value={formState.defaultEdgeRuleChainId}
                    onValueChange={(value) =>
                      updateField("defaultEdgeRuleChainId", value)
                    }
                    onOpenChange={(nextOpen) => {
                      if (nextOpen) {
                        void loadEdgeRuleChains();
                      }
                    }}
                    placeholder={
                      isLoadingEdgeRuleChains
                        ? "Loading edge rule chains..."
                        : "Select edge rule chain"
                    }
                    emptyMessage={
                      isLoadingEdgeRuleChains
                        ? "Loading edge rule chains..."
                        : "No edge rule chains found"
                    }
                    allowClear
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Device profile image
                  </label>
                  <div
                    className={cn(
                      "rounded-lg border p-2",
                      imageInputMode === "link" && "pt-3",
                    )}
                  >
                    <DeviceProfileImagePreview
                      image={formState.image}
                      imageInputMode={imageInputMode}
                      isSaving={isSaving}
                      onOpenGallery={() => setGalleryOpen(true)}
                      onSwitchToLink={() => setImageInputMode("link")}
                      onClearImage={clearImage}
                      onImageChange={(value) => updateField("image", value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    className="text-sm font-medium"
                    htmlFor="device-profile-description"
                  >
                    Description
                  </label>
                  <Textarea
                    id="device-profile-description"
                    value={formState.description}
                    onChange={(event) =>
                      updateField("description", event.target.value)
                    }
                    placeholder="Add a short description"
                    disabled={isSaving}
                  />
                </div>
              </div>
            )}

            {activeTab === "transport" && (
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Transport Type
                  </label>
                  <Select
                    options={TRANSPORT_TYPE_OPTIONS}
                    value={formState.transportType}
                    onValueChange={handleTransportTypeChange}
                    placeholder="Select transport type"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formState.transportType === "DEFAULT" &&
                      "Uses default ThingsBoard transport configuration."}
                    {formState.transportType === "MQTT" &&
                      "Uses MQTT protocol for device communication."}
                    {formState.transportType === "COAP" &&
                      "Enables advanced CoAP transport settings."}
                    {formState.transportType === "LWM2M" &&
                      "Configure LWM2M model, bootstrap and client settings."}
                    {formState.transportType === "SNMP" &&
                      "Specify SNMP transport configuration and communication mappings."}
                  </p>
                </div>

                {formState.transportType === "MQTT" && (
                  <>
                    <MqttSparkplugSection
                      checkboxId="sparkplug-b"
                      metricsInputId="sparkplug-attribute-metrics"
                      checked={formState.mqttSparkplugB}
                      metrics={formState.mqttSparkplugAttributesMetricNames}
                      onCheckedChangeAction={setMqttSparkplugB}
                      onAddMetricAction={addMqttSparkplugMetric}
                      onRemoveMetricAction={removeMqttSparkplugMetric}
                      disabled={isSaving}
                    />

                    {!formState.mqttSparkplugB && (
                      <div className="space-y-4 rounded-lg border border-muted bg-muted/30 p-4">
                        <h3 className="text-sm font-medium">
                          MQTT device topic filters
                        </h3>

                        <div>
                          <label className="mb-1 block text-sm font-medium">
                            Telemetry Topic Filter
                          </label>
                          <Input
                            type="text"
                            value={formState.mqttTelemetryTopicFilter}
                            onChange={(e) =>
                              updateMqttField(
                                "mqttTelemetryTopicFilter",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium">
                            Attributes Publish Topic Filter
                          </label>
                          <Input
                            type="text"
                            value={formState.mqttAttributesPublishTopicFilter}
                            onChange={(e) =>
                              updateMqttField(
                                "mqttAttributesPublishTopicFilter",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium">
                            Attributes Subscribe Topic Filter
                          </label>
                          <Input
                            type="text"
                            value={formState.mqttAttributesSubscribeTopicFilter}
                            onChange={(e) =>
                              updateMqttField(
                                "mqttAttributesSubscribeTopicFilter",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    )}

                    {!formState.mqttSparkplugB && (
                      <>
                        <div className="space-y-4 rounded-lg border border-muted bg-muted/30 p-4">
                          <h3 className="text-sm font-medium">
                            MQTT Payload Type
                          </h3>
                          <Select
                            options={PAYLOAD_TYPE_OPTIONS}
                            value={formState.mqttPayloadType}
                            onValueChange={setMqttPayloadType}
                            placeholder="Select payload type"
                          />
                        </div>

                        {formState.mqttPayloadType === "PROTOBUF" && (
                          <>
                            <div className="space-y-4 rounded-lg border border-muted bg-muted/30 p-4">
                              <div className="flex items-start gap-2">
                                <Checkbox
                                  id="mqtt-json-compatibility"
                                  checked={
                                    formState.mqttEnableCompatibilityWithJsonPayloadFormat
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
                                  disabled={isSaving}
                                />
                                <div className="flex-1 space-y-1">
                                  <label
                                    htmlFor="mqtt-json-compatibility"
                                    className="cursor-pointer text-sm"
                                  >
                                    Enable compatibility with other payload
                                    formats.
                                  </label>
                                  <p className="text-xs text-muted-foreground">
                                    When enabled, the platform will use a
                                    Protobuf payload format by default. If
                                    parsing fails, the platform will attempt to
                                    use JSON payload format. Useful for backward
                                    compatibility during firmware updates. For
                                    example, the initial release of the firmware
                                    uses Json, while the new release uses
                                    Protobuf. During the process of firmware
                                    update for the fleet of devices, it is
                                    required to support both Protobuf and JSON
                                    simultaneously. The compatibility mode
                                    introduces slight performance degradation,
                                    so it is recommended to disable this mode
                                    once all devices are updated.
                                  </p>
                                </div>
                              </div>

                              {formState.mqttEnableCompatibilityWithJsonPayloadFormat && (
                                <div className="flex items-start gap-2">
                                  <Checkbox
                                    id="mqtt-json-downlinks"
                                    checked={
                                      formState.mqttUseJsonPayloadFormatForDefaultDownlinkTopics
                                    }
                                    onCheckedChange={(checked) =>
                                      updateMqttField(
                                        "mqttUseJsonPayloadFormatForDefaultDownlinkTopics",
                                        Boolean(checked),
                                      )
                                    }
                                    className="mt-1"
                                    disabled={isSaving}
                                  />
                                  <div className="flex-1 space-y-1">
                                    <label
                                      htmlFor="mqtt-json-downlinks"
                                      className="cursor-pointer text-sm"
                                    >
                                      Use Json format for default downlink
                                      topics
                                    </label>
                                    <p className="text-xs text-muted-foreground">
                                      When enabled, the platform will use Json
                                      payload format to push attributes and RPC
                                      via the following topics:
                                      v1/devices/me/attributes/response/$request_id,
                                      v1/devices/me/attributes,
                                      v1/devices/me/rpc/request/$request_id,
                                      v1/devices/me/rpc/response/$request_id.
                                      This setting does not impact attribute and
                                      rpc subscriptions sent using new (v2)
                                      topics: v2/a/res/$request_id, v2/a,
                                      v2/r/req/$request_id,
                                      v2/r/res/$request_id. Where $request_id is
                                      an integer request identifier.
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>

                            <TransportProtobufSchemasSection
                              title="MQTT Protobuf schemas"
                              telemetrySchema={
                                formState.mqttTelemetryProtoSchema
                              }
                              attributesSchema={
                                formState.mqttAttributesProtoSchema
                              }
                              rpcRequestSchema={
                                formState.mqttRpcRequestProtoSchema
                              }
                              rpcResponseSchema={
                                formState.mqttRpcResponseProtoSchema
                              }
                              expandedSections={expandedCoapProtoSections}
                              editorTheme={editorTheme}
                              disabled={isSaving}
                              onToggleSectionAction={toggleCoapProtoSection}
                              onSchemaChangeAction={(field, value) => {
                                if (field === "telemetrySchema") {
                                  updateMqttField(
                                    "mqttTelemetryProtoSchema",
                                    value,
                                  );
                                  return;
                                }

                                if (field === "attributesSchema") {
                                  updateMqttField(
                                    "mqttAttributesProtoSchema",
                                    value,
                                  );
                                  return;
                                }

                                if (field === "rpcRequestSchema") {
                                  updateMqttField(
                                    "mqttRpcRequestProtoSchema",
                                    value,
                                  );
                                  return;
                                }

                                updateMqttField(
                                  "mqttRpcResponseProtoSchema",
                                  value,
                                );
                              }}
                            />
                          </>
                        )}

                        <div className="flex items-start gap-2">
                          <Checkbox
                            id="puback"
                            checked={
                              formState.mqttSendPubackOnValidationFailure
                            }
                            onCheckedChange={(checked) =>
                              updateMqttField(
                                "mqttSendPubackOnValidationFailure",
                                Boolean(checked),
                              )
                            }
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-1">
                            <label
                              htmlFor="puback"
                              className="cursor-pointer text-sm"
                            >
                              Send PUBACK on PUBLISH message validation failure
                            </label>
                            <p className="text-xs text-muted-foreground">
                              By default, the platform will close the MQTT
                              session on message validation failure. When
                              enabled, the platform will send publish
                              acknowledgment instead of closing the session.
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}

                {formState.transportType === "COAP" && (
                  <CoapTransportSection
                    formState={formState}
                    payloadTypeOptions={PAYLOAD_TYPE_OPTIONS}
                    powerModeOptions={POWER_MODE_OPTIONS}
                    timeUnitOptions={TIME_UNIT_OPTIONS}
                    expandedCoapProtoSections={expandedCoapProtoSections}
                    editorTheme={editorTheme}
                    isSaving={isSaving}
                    disabled={isSaving}
                    onToggleCoapProtoSection={toggleCoapProtoSection}
                    onUpdateField={updateCoapField}
                  />
                )}

                {formState.transportType === "LWM2M" && (
                  <Lwm2mModelTab
                    formState={formState}
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
                    isSaving={isSaving}
                    expandedLwm2mObjectKeys={expandedLwm2mObjectKeys}
                    editorTheme={editorTheme}
                    onLwm2mTabChange={(tab) =>
                      updateField("lwm2mActiveTab", tab)
                    }
                    onLwm2mSearchChange={setLwm2mObjectSearch}
                    onAddLwm2mObject={addLwm2mObject}
                    onRemoveLwm2mObject={removeLwm2mObject}
                    onObserveStrategyChange={handleLwm2mObserveStrategyChange}
                    onToggleLwm2mObjectExpanded={toggleLwm2mObjectExpanded}
                    onOpenInstanceDialog={openInstanceDialog}
                    onOpenObjectAttributesDialog={openObjectAttributeDialog}
                    onOpenInstanceAttributesDialog={openInstanceAttributeDialog}
                    onToggleLwm2mInstanceBulk={toggleLwm2mInstanceBulk}
                    onToggleLwm2mResourceFlag={toggleLwm2mResourceFlag}
                    onLwm2mResourceKeyNameChange={
                      handleLwm2mResourceKeyNameChange
                    }
                    onToggleBootstrapServerUpdates={
                      toggleBootstrapServerUpdates
                    }
                    onAddLwm2mBootstrapServer={addLwm2mBootstrapServer}
                    onRemoveLwm2mBootstrapServer={removeLwm2mBootstrapServer}
                    onToggleLwm2mBootstrapServerExpanded={
                      toggleLwm2mBootstrapServerExpanded
                    }
                    onUpdateLwm2mBootstrapServer={updateLwm2mBootstrapServer}
                    expandedLwm2mBootstrapServerIds={
                      expandedLwm2mBootstrapServerIds
                    }
                    onPowerModeChange={handleLwm2mPowerModeChange}
                    onLwm2mPsmActivityTimerChange={
                      handleLwm2mPsmActivityTimerChange
                    }
                    onLwm2mPsmActivityTimerTimeUnitChange={
                      handleLwm2mPsmActivityTimerTimeUnitChange
                    }
                    onLwm2mEdrxCycleChange={handleLwm2mEdrxCycleChange}
                    onLwm2mEdrxCycleTimeUnitChange={
                      handleLwm2mEdrxCycleTimeUnitChange
                    }
                    onLwm2mPagingTransmissionWindowChange={
                      handleLwm2mPagingTransmissionWindowChange
                    }
                    onLwm2mPagingTransmissionWindowTimeUnitChange={
                      handleLwm2mPagingTransmissionWindowTimeUnitChange
                    }
                    onLwm2mUseObject19ForOtaInfoChange={
                      handleLwm2mUseObject19ForOtaInfoChange
                    }
                    onLwm2mFirmwareUpdateStrategyChange={
                      handleLwm2mFirmwareUpdateStrategyChange
                    }
                    onLwm2mFirmwareUpdateCoapResourceChange={
                      handleLwm2mFirmwareUpdateCoapResourceChange
                    }
                    onLwm2mSoftwareUpdateStrategyChange={
                      handleLwm2mSoftwareUpdateStrategyChange
                    }
                    onLwm2mSoftwareUpdateCoapResourceChange={
                      handleLwm2mSoftwareUpdateCoapResourceChange
                    }
                    onLwm2mDefaultObjectVersionChange={
                      handleLwm2mDefaultObjectVersionChange
                    }
                    onLwm2mJsonChange={(value) => {
                      if (value !== formState.lwm2mJsonConfig) {
                        setIsLwm2mJsonTouched(true);
                      }
                      updateField("lwm2mJsonConfig", value);
                    }}
                  />
                )}

                {formState.transportType === "SNMP" && (
                  <SnmpTransportSection
                    timeoutMs={formState.snmpTimeoutMs}
                    retries={formState.snmpRetries}
                    communicationConfigs={formState.snmpCommunicationConfigs}
                    scopeOptions={SNMP_SCOPE_OPTIONS}
                    dataTypeOptions={SNMP_DATA_TYPE_OPTIONS}
                    disabled={isSaving}
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
            )}

            {activeTab === "alarms" && (
              <AlarmRulesTab
                alarmRules={formState.alarmRules}
                expandedAlarmIds={expandedAlarmIds}
                expandedCreateConditionIds={expandedCreateConditionIds}
                severityOptions={SEVERITY_OPTIONS}
                isSaving={isSaving}
                hasAvailableCreateSeverityAction={hasAvailableCreateSeverity}
                getCreateSeverityOptionsAction={getCreateSeverityOptions}
                onToggleAlarmExpandedAction={toggleAlarmExpanded}
                onDeleteAlarmRuleAction={deleteAlarmRule}
                onUpdateAlarmNameAction={(alarmId, value) =>
                  updateAlarmRule(alarmId, "name", value)
                }
                onToggleCreateConditionExpandedAction={
                  toggleCreateConditionExpanded
                }
                onDeleteCreateConditionAction={deleteCreateCondition}
                onUpdateCreateConditionSeverityAction={(
                  alarmId,
                  conditionId,
                  value,
                ) =>
                  updateCreateCondition(alarmId, conditionId, "severity", value)
                }
                onUpdateCreateConditionValueAction={(
                  alarmId,
                  conditionId,
                  field,
                  value,
                ) => updateCreateCondition(alarmId, conditionId, field, value)}
                onAddCreateConditionAction={addCreateCondition}
                onDeleteClearConditionAction={deleteClearCondition}
                onUpdateClearConditionValueAction={(
                  alarmId,
                  conditionId,
                  field,
                  value,
                ) => updateClearCondition(alarmId, conditionId, field, value)}
                onAddClearConditionAction={addClearCondition}
                onAddAlarmRuleAction={addAlarmRule}
              />
            )}

            {activeTab === "provisioning" && (
              <ProvisioningTab
                provisionType={formState.provisionType}
                provisionTypeOptions={PROVISION_TYPE_OPTIONS}
                usesCredentialProvisioning={usesCredentialProvisioning}
                usesX509Provisioning={usesX509Provisioning}
                isSaving={isSaving}
                provisionDeviceKey={formState.provisionDeviceKey}
                provisionDeviceSecret={formState.provisionDeviceSecret}
                provisionAllowCreateNewDevicesByX509Certificate={
                  formState.provisionAllowCreateNewDevicesByX509Certificate
                }
                provisionCertificateValue={formState.provisionCertificateValue}
                provisionCertificateRegExPattern={
                  formState.provisionCertificateRegExPattern
                }
                x509DefaultRegex={X509_DEFAULT_REGEX}
                onProvisionTypeChange={(value) =>
                  handleProvisionTypeChange(
                    (value as DeviceProfileProvisionType | null) ?? "DISABLED",
                  )
                }
                onProvisionDeviceKeyChange={(value) =>
                  updateField("provisionDeviceKey", value)
                }
                onProvisionDeviceSecretChange={(value) =>
                  updateField("provisionDeviceSecret", value)
                }
                onEnsureProvisionCredential={ensureProvisionCredential}
                onToggleAllowCreateByX509={(checked) =>
                  updateField(
                    "provisionAllowCreateNewDevicesByX509Certificate",
                    checked,
                  )
                }
                onProvisionCertificateValueChange={(value) =>
                  updateField("provisionCertificateValue", value)
                }
                onProvisionCertificateRegexChange={(value) =>
                  updateField("provisionCertificateRegExPattern", value)
                }
              />
            )}

            <div className="flex items-center justify-between">
              <div>
                {prevTab && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab(prevTab.key)}
                    disabled={isSaving}
                  >
                    Back
                  </Button>
                )}
              </div>

              <div>
                {nextTab && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab(nextTab.key)}
                    disabled={isSaving}
                  >
                    {`Next: ${nextTab.label}`}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={
                isSaving ||
                !formState.name.trim() ||
                hasMissingProvisioningFields
              }
              className="gap-2"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isSaving ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeviceProfileImageGalleryDialog
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        onSelect={(imageLink) => {
          updateField("image", imageLink);
          setImageInputMode("none");
        }}
      />

      <Lwm2mInstanceDialog
        open={Boolean(instanceDialogObjectKey)}
        title={
          instanceDialogObject
            ? `${instanceDialogObject.name} #${instanceDialogObject.keyId}`
            : "Add instances"
        }
        instanceDraftValues={instanceDraftValues}
        instanceDraftInput={instanceDraftInput}
        onInputChange={setInstanceDraftInput}
        onAddDraftValue={appendInstanceDraftValue}
        onRemoveDraftValue={removeInstanceDraftValue}
        onCancel={closeInstanceDialog}
        onSave={saveInstanceDraftValues}
        disableSave={
          instanceDraftValues.length === 0 &&
          instanceDraftInput.trim().length === 0
        }
      />

      <Lwm2mInstanceAttributesDialog
        open={
          Boolean(attributeDialogObjectKey) && Boolean(attributeDialogScope)
        }
        title={
          attributeDialogScope === "OBJECT" && attributeDialogObject
            ? `Edit attributes: ${attributeDialogObject.name} #${attributeDialogObject.keyId}`
            : attributeDialogScope === "INSTANCE" &&
                attributeDialogObject &&
                attributeDialogInstanceId !== null
              ? `Edit attributes: Instance #${attributeDialogInstanceId}`
              : "Edit attributes"
        }
        rows={attributeRows}
        attributeOptions={availableAttributeOptions}
        selectedAttribute={attributeDraftName}
        attributeValue={attributeDraftValue}
        onSelectedAttributeChange={(value) =>
          setAttributeDraftName(value as Lwm2mInstanceAttributeKey)
        }
        onAttributeValueChange={setAttributeDraftValue}
        onAdd={appendAttributeDraftValue}
        onRemove={removeAttributeDraftValue}
        onCancel={closeAttributeDialog}
        onSave={saveAttributeDraftValues}
        disableAdd={!canAddAttribute}
      />
    </>
  );
}
