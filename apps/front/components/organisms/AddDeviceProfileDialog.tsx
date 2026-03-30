"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
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
import { cn, getImagePreviewUrl } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Link2,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { SettingsService } from "@/lib/services/thingsboardServices/settingsService";
import type { Queue } from "@/types/queueTypes";
import {
  CreateDeviceProfileRequest,
  DeviceService,
  type DeviceProfileProvisionConfiguration,
  type DeviceProfileProvisionType,
  type RuleChain,
} from "@/lib/services/thingsboardServices/deviceService";
import { DeviceProfileImageGalleryDialog } from "@/components/organisms/DeviceProfileImageGalleryDialog";
import { AlarmConditionEditor } from "@/components/molecules/AlarmConditionEditor";
import { AlarmScheduleEditor } from "@/components/molecules/AlarmScheduleEditor";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import {
  Lwm2mObjectListField,
  type Lwm2mObjectOption,
} from "@/components/molecules/Lwm2mObjectListField";
import { ResourceService } from "@/lib/services/thingsboardServices/resourceService";

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
type TimeUnit = "MILLISECONDS" | "SECONDS" | "MINUTES" | "HOURS";
type Lwm2mTab = "model" | "bootstrap" | "other" | "json";
type Lwm2mObserveStrategy = "SINGLE" | "COMPOSITE_ALL" | "COMPOSITE_BY_OBJECT";
type SnmpScope =
  | "CLIENT_ATTRIBUTES"
  | "SHARED_ATTRIBUTES"
  | "SERVER_ATTRIBUTES"
  | "TELEMETRY";
type SnmpDataType = "STRING" | "LONG" | "DOUBLE" | "BOOLEAN";
type CoapProtoSchemaSection =
  | "telemetry"
  | "attributes"
  | "rpcRequest"
  | "rpcResponse";

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

type DeviceProfileFormState = {
  name: string;
  image: string;
  defaultRuleChainId: string;
  defaultQueueName: string;
  defaultEdgeRuleChainId: string;
  description: string;
  transportType: TransportType;
  mqttSparkplugB: boolean;
  mqttTelemetryTopicFilter: string;
  mqttAttributesPublishTopicFilter: string;
  mqttAttributesSubscribeTopicFilter: string;
  mqttPayloadType: TransportPayloadType;
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
  lwm2mObserveStrategy: Lwm2mObserveStrategy;
  lwm2mPowerMode: PowerMode;
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
  spec: "CLIENT_ATTRIBUTES",
  queryingFrequencyMs: "5000",
  mappings: [DEFAULT_SNMP_MAPPING()],
});

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
  { value: "DRX", label: "Discontinuous Reception (DRX)" },
  { value: "EDRX", label: "Extended Discontinuous Reception (eDRX)" },
  { value: "PSM", label: "Power Saving Mode (PSM)" },
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
      bootstrapServerAccountTimeout: 0,
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
  { value: "CLIENT_ATTRIBUTES", label: "Client attributes (SNMP GET)" },
  { value: "SHARED_ATTRIBUTES", label: "Shared attributes (SNMP SET)" },
  { value: "SERVER_ATTRIBUTES", label: "Server attributes (SNMP GET)" },
  { value: "TELEMETRY", label: "Telemetry (SNMP GET)" },
];

const SNMP_DATA_TYPE_OPTIONS: Array<{ value: SnmpDataType; label: string }> = [
  { value: "STRING", label: "String" },
  { value: "LONG", label: "Long" },
  { value: "DOUBLE", label: "Double" },
  { value: "BOOLEAN", label: "Boolean" },
];

const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const ACTIVE_ALL_TIME = "Active all the time";

const DAY_TO_INDEX = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
} as const;

const DEFAULT_TIME_FROM = "00:00";
const DEFAULT_TIME_TO = "12:00";

const timeToMs = (rawTime: string): number => {
  const [h, m] = rawTime.split(":").map((item) => Number(item));
  if (!Number.isFinite(h) || !Number.isFinite(m)) {
    return 0;
  }

  return (h * 60 * 60 + m * 60) * 1000;
};

const normalizeTimezone = (rawTimezone: string): string =>
  rawTimezone.split(" (")[0]?.trim() || "UTC";

const toThingsBoardCondition = (
  rawCondition: string,
): Record<string, unknown> => {
  const value = rawCondition.trim();

  if (!value) {
    return {
      condition: [],
      spec: { type: "SIMPLE" },
    };
  }

  try {
    const parsed = JSON.parse(value) as any;

    if (Array.isArray(parsed?.condition) && parsed?.spec?.type) {
      return parsed;
    }

    if (parsed?.kind === "FPL_ALARM_CONDITION_V1") {
      const conditionType =
        parsed.conditionType === "DURATION"
          ? "DURATION"
          : parsed.conditionType === "REPEATING"
            ? "REPEATING"
            : "SIMPLE";

      const condition = (parsed.keyFilters ?? []).flatMap((item: any) =>
        (item.filters ?? [])
          .filter((rule: any) => rule?.kind === "simple")
          .map((rule: any) => ({
            key: {
              type: item.keyType,
              key: item.keyName,
            },
            valueType: item.valueType,
            value: null,
            predicate: {
              operation: rule.operation ?? "EQUAL",
              value: {
                defaultValue: rule.value,
                userValue: null,
                dynamicValue: null,
              },
              ...(item.valueType === "STRING"
                ? { ignoreCase: Boolean(rule.ignoreCase) }
                : {}),
              type: item.valueType,
            },
          })),
      );

      return {
        condition,
        spec: { type: conditionType },
      };
    }
  } catch {
    // fall through
  }

  return {
    condition: [],
    spec: { type: "SIMPLE" },
  };
};

const toThingsBoardSchedule = (rawSchedule: string): unknown => {
  const value = rawSchedule.trim();

  if (!value || value === ACTIVE_ALL_TIME) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as any;

    if (parsed?.type) {
      return parsed;
    }

    if (parsed?.kind === "FPL_ALARM_SCHEDULE_V1") {
      if (parsed.mode === "ALL_TIME") {
        return null;
      }

      const timezone = normalizeTimezone(String(parsed.timeZone || "UTC"));
      const dynamicValue =
        parsed.dynamicSourceType &&
        parsed.dynamicSourceType !== "NO_DYNAMIC_VALUE"
          ? {
              sourceType: parsed.dynamicSourceType,
              sourceAttribute: String(parsed.sourceAttribute || ""),
            }
          : null;

      if (parsed.mode === "SPECIFIC_TIME") {
        const daysOfWeek = (
          Array.isArray(parsed.specificDays) ? parsed.specificDays : []
        )
          .map((day: string) => DAY_TO_INDEX[day as keyof typeof DAY_TO_INDEX])
          .filter((day: number | undefined): day is number =>
            Number.isInteger(day),
          );

        return {
          type: "SPECIFIC_TIME",
          daysOfWeek,
          startsOn: timeToMs(String(parsed.specificFrom || DEFAULT_TIME_FROM)),
          endsOn: timeToMs(String(parsed.specificTo || DEFAULT_TIME_TO)),
          timezone,
          dynamicValue,
        };
      }

      const items = (
        Object.entries(DAY_TO_INDEX) as Array<
          [keyof typeof DAY_TO_INDEX, number]
        >
      ).map(([dayName, dayOfWeek]) => {
        if (parsed.mode === "SPECIFIC_TIME") {
          const selectedDays = Array.isArray(parsed.specificDays)
            ? parsed.specificDays
            : [];
          const enabled = selectedDays.includes(dayName);

          return {
            enabled,
            dayOfWeek,
            startsOn: enabled
              ? timeToMs(String(parsed.specificFrom || DEFAULT_TIME_FROM))
              : 0,
            endsOn: enabled
              ? timeToMs(String(parsed.specificTo || DEFAULT_TIME_TO))
              : 0,
          };
        }

        const customItem = parsed.custom?.[dayName];
        const enabled = Boolean(customItem?.enabled);

        return {
          enabled,
          dayOfWeek,
          startsOn: enabled
            ? timeToMs(String(customItem?.from || DEFAULT_TIME_FROM))
            : 0,
          endsOn: enabled
            ? timeToMs(String(customItem?.to || DEFAULT_TIME_TO))
            : 0,
        };
      });

      return {
        type: "CUSTOM",
        timezone,
        items,
        dynamicValue,
      };
    }

    return parsed;
  } catch {
    return null;
  }
};

const generateToken = (length = 20) => {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () =>
    characters.charAt(Math.floor(Math.random() * characters.length)),
  ).join("");
};

const INITIAL_FORM: DeviceProfileFormState = {
  name: "",
  image: "",
  defaultRuleChainId: "",
  defaultQueueName: "",
  defaultEdgeRuleChainId: "",
  description: "",
  transportType: "DEFAULT",
  mqttSparkplugB: false,
  mqttTelemetryTopicFilter: MQTT_DEFAULTS.telemetry,
  mqttAttributesPublishTopicFilter: MQTT_DEFAULTS.attributesPublish,
  mqttAttributesSubscribeTopicFilter: MQTT_DEFAULTS.attributesSubscribe,
  mqttPayloadType: "JSON",
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
  lwm2mObserveStrategy: "SINGLE",
  lwm2mPowerMode: "DRX",
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
  const [coreRuleChains, setCoreRuleChains] = useState<RuleChain[]>([]);
  const [edgeRuleChains, setEdgeRuleChains] = useState<RuleChain[]>([]);
  const [queues, setQueues] = useState<Queue[]>([]);
  const [hasLoadedCoreRuleChains, setHasLoadedCoreRuleChains] = useState(false);
  const [hasLoadedEdgeRuleChains, setHasLoadedEdgeRuleChains] = useState(false);
  const [hasLoadedQueues, setHasLoadedQueues] = useState(false);
  const [isLoadingCoreRuleChains, setIsLoadingCoreRuleChains] = useState(false);
  const [isLoadingEdgeRuleChains, setIsLoadingEdgeRuleChains] = useState(false);
  const [isLoadingQueues, setIsLoadingQueues] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<"none" | "link">("none");
  const [expandedAlarmIds, setExpandedAlarmIds] = useState<Set<string>>(
    new Set(),
  );
  const [expandedCreateConditionIds, setExpandedCreateConditionIds] = useState<
    Set<string>
  >(new Set());
  const [lwm2mObjectOptions, setLwm2mObjectOptions] = useState<
    Lwm2mObjectOption[]
  >([]);
  const [lwm2mObjectSearch, setLwm2mObjectSearch] = useState("");
  const [isLoadingLwm2mObjects, setIsLoadingLwm2mObjects] = useState(false);
  const [isLwm2mJsonTouched, setIsLwm2mJsonTouched] = useState(false);
  const [expandedCoapProtoSections, setExpandedCoapProtoSections] = useState<
    Set<CoapProtoSchemaSection>
  >(new Set(["telemetry", "attributes", "rpcRequest", "rpcResponse"]));
  const openRef = useRef(open);
  const editorTheme = resolvedTheme === "dark" ? "vs-dark" : "light";

  const toggleCoapProtoSection = (section: CoapProtoSchemaSection) => {
    setExpandedCoapProtoSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) {
      setActiveTab("details");
      setFormState(INITIAL_FORM);
      setCoreRuleChains([]);
      setEdgeRuleChains([]);
      setQueues([]);
      setHasLoadedCoreRuleChains(false);
      setHasLoadedEdgeRuleChains(false);
      setHasLoadedQueues(false);
      setIsLoadingCoreRuleChains(false);
      setIsLoadingEdgeRuleChains(false);
      setIsLoadingQueues(false);
      setIsSaving(false);
      setGalleryOpen(false);
      setImageInputMode("none");
      setExpandedAlarmIds(new Set());
      setExpandedCreateConditionIds(new Set());
      setLwm2mObjectOptions([]);
      setLwm2mObjectSearch("");
      setIsLoadingLwm2mObjects(false);
      setIsLwm2mJsonTouched(false);
      setExpandedCoapProtoSections(
        new Set(["telemetry", "attributes", "rpcRequest", "rpcResponse"]),
      );
      return;
    }
  }, [open]);

  useEffect(() => {
    if (
      !open ||
      formState.transportType !== "LWM2M" ||
      formState.lwm2mActiveTab !== "model"
    ) {
      return;
    }

    const timeout = setTimeout(async () => {
      setIsLoadingLwm2mObjects(true);

      try {
        const data = await ResourceService.getLwm2mObjectsPage(
          0,
          50,
          lwm2mObjectSearch,
          "resourceKey",
          "ASC",
        );

        if (!openRef.current) {
          return;
        }

        setLwm2mObjectOptions(
          data
            .filter(
              (item) =>
                typeof item?.keyId === "string" &&
                typeof item?.name === "string" &&
                item.keyId.trim() &&
                item.name.trim(),
            )
            .map((item) => ({ keyId: item.keyId, name: item.name })),
        );
      } catch (error: any) {
        if (openRef.current) {
          toast.error(
            error?.response?.data?.message ||
              "Failed to load LWM2M object list",
          );
        }
      } finally {
        if (openRef.current) {
          setIsLoadingLwm2mObjects(false);
        }
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [
    open,
    formState.transportType,
    formState.lwm2mActiveTab,
    lwm2mObjectSearch,
  ]);

  const loadCoreRuleChains = async () => {
    if (hasLoadedCoreRuleChains || isLoadingCoreRuleChains) {
      return;
    }

    try {
      setIsLoadingCoreRuleChains(true);
      const response = await DeviceService.getRuleChains("CORE");

      if (!openRef.current) {
        return;
      }

      setCoreRuleChains(response);
      setHasLoadedCoreRuleChains(true);
    } catch (error: any) {
      if (openRef.current) {
        toast.error(
          error?.response?.data?.message || "Failed to load rule chains",
        );
      }
    } finally {
      if (openRef.current) {
        setIsLoadingCoreRuleChains(false);
      }
    }
  };

  const loadEdgeRuleChains = async () => {
    if (hasLoadedEdgeRuleChains || isLoadingEdgeRuleChains) {
      return;
    }

    try {
      setIsLoadingEdgeRuleChains(true);
      const response = await DeviceService.getRuleChains("EDGE");

      if (!openRef.current) {
        return;
      }

      setEdgeRuleChains(response);
      setHasLoadedEdgeRuleChains(true);
    } catch (error: any) {
      if (openRef.current) {
        toast.error(
          error?.response?.data?.message || "Failed to load edge rule chains",
        );
      }
    } finally {
      if (openRef.current) {
        setIsLoadingEdgeRuleChains(false);
      }
    }
  };

  const loadQueues = async () => {
    if (hasLoadedQueues || isLoadingQueues) {
      return;
    }

    try {
      setIsLoadingQueues(true);
      const response = await SettingsService.getQueues(0, 50, "name", "ASC");

      if (!openRef.current) {
        return;
      }

      setQueues(response.data ?? []);
      setHasLoadedQueues(true);
    } catch (error: any) {
      if (openRef.current) {
        toast.error(error?.response?.data?.message || "Failed to load queues");
      }
    } finally {
      if (openRef.current) {
        setIsLoadingQueues(false);
      }
    }
  };

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
    setLwm2mObjectOptions([]);

    setFormState((prev) => ({
      ...prev,
      transportType: nextType,
      mqttSparkplugB: false,
      mqttTelemetryTopicFilter: MQTT_DEFAULTS.telemetry,
      mqttAttributesPublishTopicFilter: MQTT_DEFAULTS.attributesPublish,
      mqttAttributesSubscribeTopicFilter: MQTT_DEFAULTS.attributesSubscribe,
      mqttPayloadType: "JSON",
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
      lwm2mObserveStrategy: "SINGLE",
      lwm2mPowerMode: "DRX",
      lwm2mJsonConfig: JSON.stringify(
        createDefaultLwm2mTransportConfiguration("SINGLE", "DRX", false),
        null,
        2,
      ),
      snmpTimeoutMs: "500",
      snmpRetries: "0",
      snmpCommunicationConfigs: [DEFAULT_SNMP_COMMUNICATION_CONFIG()],
    }));

    setExpandedCoapProtoSections(
      new Set(["telemetry", "attributes", "rpcRequest", "rpcResponse"]),
    );
    setIsLwm2mJsonTouched(false);
  };

  const syncLwm2mJsonWithDefaults = (
    observeStrategy: Lwm2mObserveStrategy,
    powerMode: PowerMode,
    hasSelectedObjects: boolean,
  ) => {
    if (isLwm2mJsonTouched) {
      return;
    }

    updateField(
      "lwm2mJsonConfig",
      JSON.stringify(
        createDefaultLwm2mTransportConfiguration(
          observeStrategy,
          powerMode,
          hasSelectedObjects,
        ),
        null,
        2,
      ),
    );
  };

  const addLwm2mObject = (option: Lwm2mObjectOption) => {
    let shouldSync = false;
    let nextStrategy: Lwm2mObserveStrategy = formState.lwm2mObserveStrategy;
    let hasSelectedObjects = formState.lwm2mObjectList.length > 0;

    setFormState((prev) => {
      if (prev.lwm2mObjectList.some((item) => item.keyId === option.keyId)) {
        return prev;
      }

      const nextObjectList = [...prev.lwm2mObjectList, option];
      hasSelectedObjects = nextObjectList.length > 0;
      nextStrategy =
        prev.lwm2mObserveStrategy === "SINGLE"
          ? "COMPOSITE_BY_OBJECT"
          : prev.lwm2mObserveStrategy;
      shouldSync = true;

      return {
        ...prev,
        lwm2mObjectList: nextObjectList,
        lwm2mObserveStrategy: nextStrategy,
      };
    });

    if (shouldSync) {
      syncLwm2mJsonWithDefaults(
        nextStrategy,
        formState.lwm2mPowerMode,
        hasSelectedObjects,
      );
    }
  };

  const removeLwm2mObject = (keyId: string) => {
    let shouldSync = false;
    let nextStrategy: Lwm2mObserveStrategy = formState.lwm2mObserveStrategy;
    let hasSelectedObjects = formState.lwm2mObjectList.length > 0;

    setFormState((prev) => {
      const nextObjectList = prev.lwm2mObjectList.filter(
        (item) => item.keyId !== keyId,
      );
      hasSelectedObjects = nextObjectList.length > 0;
      nextStrategy = hasSelectedObjects ? prev.lwm2mObserveStrategy : "SINGLE";
      shouldSync = true;

      return {
        ...prev,
        lwm2mObjectList: nextObjectList,
        lwm2mObserveStrategy: nextStrategy,
      };
    });

    if (shouldSync) {
      syncLwm2mJsonWithDefaults(
        nextStrategy,
        formState.lwm2mPowerMode,
        hasSelectedObjects,
      );
    }
  };

  const addSnmpCommunicationConfig = () => {
    setFormState((prev) => ({
      ...prev,
      snmpCommunicationConfigs: [
        ...prev.snmpCommunicationConfigs,
        DEFAULT_SNMP_COMMUNICATION_CONFIG(),
      ],
    }));
  };

  const removeSnmpCommunicationConfig = (configId: string) => {
    setFormState((prev) => ({
      ...prev,
      snmpCommunicationConfigs:
        prev.snmpCommunicationConfigs.length > 1
          ? prev.snmpCommunicationConfigs.filter((item) => item.id !== configId)
          : prev.snmpCommunicationConfigs,
    }));
  };

  const updateSnmpCommunicationConfig = <
    K extends keyof SnmpCommunicationConfigForm,
  >(
    configId: string,
    field: K,
    value: SnmpCommunicationConfigForm[K],
  ) => {
    setFormState((prev) => ({
      ...prev,
      snmpCommunicationConfigs: prev.snmpCommunicationConfigs.map((item) =>
        item.id === configId ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const addSnmpMapping = (configId: string) => {
    setFormState((prev) => ({
      ...prev,
      snmpCommunicationConfigs: prev.snmpCommunicationConfigs.map((item) =>
        item.id === configId
          ? { ...item, mappings: [...item.mappings, DEFAULT_SNMP_MAPPING()] }
          : item,
      ),
    }));
  };

  const updateSnmpMapping = <K extends keyof SnmpMappingForm>(
    configId: string,
    mappingId: string,
    field: K,
    value: SnmpMappingForm[K],
  ) => {
    setFormState((prev) => ({
      ...prev,
      snmpCommunicationConfigs: prev.snmpCommunicationConfigs.map((item) =>
        item.id === configId
          ? {
              ...item,
              mappings: item.mappings.map((mapping) =>
                mapping.id === mappingId
                  ? { ...mapping, [field]: value }
                  : mapping,
              ),
            }
          : item,
      ),
    }));
  };

  const removeSnmpMapping = (configId: string, mappingId: string) => {
    setFormState((prev) => ({
      ...prev,
      snmpCommunicationConfigs: prev.snmpCommunicationConfigs.map((item) =>
        item.id === configId && item.mappings.length > 1
          ? {
              ...item,
              mappings: item.mappings.filter(
                (mapping) => mapping.id !== mappingId,
              ),
            }
          : item,
      ),
    }));
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
        sendAckOnValidationException:
          formState.mqttSendPubackOnValidationFailure,
        transportPayloadTypeConfiguration: {
          transportPayloadType: formState.mqttPayloadType,
        },
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
      let parsedLwm2mConfig: any = null;

      if (formState.lwm2mJsonConfig.trim()) {
        try {
          const parsed = JSON.parse(formState.lwm2mJsonConfig);
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            parsedLwm2mConfig = parsed;
          }
        } catch {
          parsedLwm2mConfig = null;
        }
      }

      const defaultLwm2mConfig = createDefaultLwm2mTransportConfiguration(
        formState.lwm2mObserveStrategy,
        formState.lwm2mPowerMode,
        formState.lwm2mObjectList.length > 0,
      );

      const observeAttr =
        parsedLwm2mConfig?.observeAttr &&
        typeof parsedLwm2mConfig.observeAttr === "object"
          ? parsedLwm2mConfig.observeAttr
          : {};

      const clientSettings =
        parsedLwm2mConfig?.clientLwM2mSettings &&
        typeof parsedLwm2mConfig.clientLwM2mSettings === "object"
          ? parsedLwm2mConfig.clientLwM2mSettings
          : {};

      transportConfiguration = {
        ...(parsedLwm2mConfig ?? {}),
        observeAttr: {
          observe: Array.isArray(observeAttr.observe)
            ? observeAttr.observe
            : [],
          attribute: Array.isArray(observeAttr.attribute)
            ? observeAttr.attribute
            : [],
          telemetry: Array.isArray(observeAttr.telemetry)
            ? observeAttr.telemetry
            : [],
          keyName:
            observeAttr.keyName &&
            typeof observeAttr.keyName === "object" &&
            !Array.isArray(observeAttr.keyName)
              ? observeAttr.keyName
              : {},
          attributeLwm2m:
            observeAttr.attributeLwm2m &&
            typeof observeAttr.attributeLwm2m === "object" &&
            !Array.isArray(observeAttr.attributeLwm2m)
              ? observeAttr.attributeLwm2m
              : {},
          observeStrategy: formState.lwm2mObserveStrategy,
        },
        bootstrap:
          Array.isArray(parsedLwm2mConfig?.bootstrap) &&
          parsedLwm2mConfig.bootstrap.length > 0
            ? parsedLwm2mConfig.bootstrap
            : defaultLwm2mConfig.bootstrap,
        clientLwM2mSettings: {
          ...defaultLwm2mConfig.clientLwM2mSettings,
          ...clientSettings,
          powerMode: formState.lwm2mPowerMode,
        },
        type: "LWM2M",
        bootstrapServerUpdateEnable: Boolean(
          parsedLwm2mConfig?.bootstrapServerUpdateEnable,
        ),
      };
    } else if (formState.transportType === "SNMP") {
      transportConfiguration = {
        type: "SNMP",
        timeoutMs: Math.max(0, Number(formState.snmpTimeoutMs) || 0),
        retries: Math.max(0, Number(formState.snmpRetries) || 0),
        communicationConfigs: formState.snmpCommunicationConfigs.map(
          (config) => ({
            spec: config.spec,
            queryingFrequencyMs: Math.max(
              0,
              Number(config.queryingFrequencyMs) || 0,
            ),
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

  const currentTabIndex = TABS.findIndex((tab) => tab.key === activeTab);
  const nextTab = TABS[currentTabIndex + 1];
  const prevTab = TABS[currentTabIndex - 1];
  const hasSelectedImage = Boolean(formState.image.trim());
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

  const renderImagePreview = () => {
    if (!hasSelectedImage && imageInputMode !== "link") {
      return (
        <div className="grid gap-2 md:grid-cols-[104px_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex h-26.5 items-center justify-center rounded-md border bg-muted/20 p-4 text-center text-sm text-muted-foreground">
            No image selected
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setGalleryOpen(true)}
            className="flex h-26.5 flex-col items-center justify-center gap-3"
            disabled={isSaving}
          >
            <ImageIcon className="h-6 w-6" />
            <span>Browse from gallery</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setImageInputMode("link")}
            className="flex h-26.5 flex-col items-center justify-center gap-3"
            disabled={isSaving}
          >
            <Link2 className="h-6 w-6" />
            <span>Set link</span>
          </Button>
        </div>
      );
    }

    if (imageInputMode === "link") {
      return (
        <div className="grid gap-3 md:grid-cols-[104px_minmax(0,1fr)_auto] md:items-end">
          <div className="flex h-26.5 items-center justify-center overflow-hidden rounded-md border bg-muted/20">
            {hasSelectedImage ? (
              <img
                src={getImagePreviewUrl(formState.image)}
                alt="Device profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="px-3 text-center text-sm text-muted-foreground">
                No image selected
              </span>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="device-profile-image-link"
              className="text-sm font-medium"
            >
              Image link
            </label>
            <Input
              id="device-profile-image-link"
              value={formState.image}
              onChange={(event) => updateField("image", event.target.value)}
              placeholder="https://example.com/image.png"
              disabled={isSaving}
            />
          </div>

          <div className="flex items-center gap-2 md:pb-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={clearImage}
              disabled={isSaving && !formState.image}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid gap-3 md:grid-cols-[104px_minmax(0,1fr)_auto] md:items-center">
        <div className="flex h-26.5 items-center justify-center overflow-hidden rounded-md border bg-muted/20">
          <img
            src={getImagePreviewUrl(formState.image)}
            alt="Device profile"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0 rounded-md border p-4">
          <div className="truncate text-sm font-medium">Selected image</div>
          <div className="mt-1 truncate text-sm text-muted-foreground">
            {formState.image}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setGalleryOpen(true)}
              disabled={isSaving}
            >
              Browse from gallery
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setImageInputMode("link")}
              disabled={isSaving}
            >
              Set link
            </Button>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={clearImage}
          disabled={isSaving}
          className="text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <>
      <Dialog open={open} modal={false} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
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
                    {renderImagePreview()}
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
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="sparkplug-b"
                        checked={formState.mqttSparkplugB}
                        onCheckedChange={(checked) =>
                          setFormState((prev) => ({
                            ...prev,
                            mqttSparkplugB: checked as boolean,
                          }))
                        }
                        disabled={true}
                      />
                      <label
                        htmlFor="sparkplug-b"
                        className="cursor-not-allowed text-sm opacity-50"
                      >
                        MQTT Sparkplug B Edge of Network (EoN) node
                      </label>
                    </div>

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
                              setFormState((prev) => ({
                                ...prev,
                                mqttTelemetryTopicFilter: e.target.value,
                              }))
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
                              setFormState((prev) => ({
                                ...prev,
                                mqttAttributesPublishTopicFilter:
                                  e.target.value,
                              }))
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
                              setFormState((prev) => ({
                                ...prev,
                                mqttAttributesSubscribeTopicFilter:
                                  e.target.value,
                              }))
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
                            onValueChange={(value: string) =>
                              setFormState((prev) => ({
                                ...prev,
                                mqttPayloadType:
                                  (value as TransportPayloadType) ?? "JSON",
                              }))
                            }
                            placeholder="Select payload type"
                          />
                        </div>

                        <div className="flex items-start gap-2">
                          <Checkbox
                            id="puback"
                            checked={
                              formState.mqttSendPubackOnValidationFailure
                            }
                            onCheckedChange={(checked) =>
                              setFormState((prev) => ({
                                ...prev,
                                mqttSendPubackOnValidationFailure:
                                  checked as boolean,
                              }))
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
                  <div className="space-y-4">
                    <div className="rounded-lg border border-muted p-4">
                      <label className="mb-1 block text-sm font-medium">
                        CoAP device type
                      </label>
                      <Select
                        options={[
                          { value: "DEFAULT", label: "Default" },
                          { value: "EFENTO", label: "Efento NB-IoT" },
                        ]}
                        value={formState.coapDeviceType}
                        onValueChange={(value) =>
                          updateField(
                            "coapDeviceType",
                            (value as "DEFAULT" | "EFENTO") ?? "DEFAULT",
                          )
                        }
                      />
                    </div>

                    {formState.coapDeviceType === "DEFAULT" && (
                      <>
                        <div className="rounded-lg border border-muted p-4">
                          <label className="mb-1 block text-sm font-medium">
                            CoAP device payload
                          </label>
                          <Select
                            options={PAYLOAD_TYPE_OPTIONS}
                            value={formState.coapPayloadType}
                            onValueChange={(value) =>
                              updateField(
                                "coapPayloadType",
                                (value as TransportPayloadType) ?? "JSON",
                              )
                            }
                          />
                        </div>

                        {formState.coapPayloadType === "PROTOBUF" && (
                          <div className="rounded-lg border border-muted p-4">
                            <h3 className="text-sm font-medium">
                              CoAP Protobuf schemas
                            </h3>

                            <div className="mt-4 space-y-3">
                              <div className="rounded-lg border border-muted">
                                <div className="flex items-center justify-between bg-muted/30 px-3 py-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleCoapProtoSection("telemetry")
                                    }
                                    className="flex items-center gap-2 text-left"
                                  >
                                    {expandedCoapProtoSections.has(
                                      "telemetry",
                                    ) ? (
                                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span className="text-sm font-medium">
                                      Telemetry proto schema
                                    </span>
                                  </button>
                                </div>
                                {expandedCoapProtoSections.has("telemetry") && (
                                  <div className="border-t border-muted p-3">
                                    <Editor
                                      height="260px"
                                      defaultLanguage="protobuf"
                                      language="protobuf"
                                      value={formState.coapTelemetryProtoSchema}
                                      onChange={(value) =>
                                        updateField(
                                          "coapTelemetryProtoSchema",
                                          value ?? "",
                                        )
                                      }
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
                                )}
                              </div>

                              <div className="rounded-lg border border-muted">
                                <div className="flex items-center justify-between bg-muted/30 px-3 py-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleCoapProtoSection("attributes")
                                    }
                                    className="flex items-center gap-2 text-left"
                                  >
                                    {expandedCoapProtoSections.has(
                                      "attributes",
                                    ) ? (
                                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span className="text-sm font-medium">
                                      Attributes proto schema
                                    </span>
                                  </button>
                                </div>
                                {expandedCoapProtoSections.has(
                                  "attributes",
                                ) && (
                                  <div className="border-t border-muted p-3">
                                    <Editor
                                      height="220px"
                                      defaultLanguage="protobuf"
                                      language="protobuf"
                                      value={
                                        formState.coapAttributesProtoSchema
                                      }
                                      onChange={(value) =>
                                        updateField(
                                          "coapAttributesProtoSchema",
                                          value ?? "",
                                        )
                                      }
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
                                )}
                              </div>

                              <div className="rounded-lg border border-muted">
                                <div className="flex items-center justify-between bg-muted/30 px-3 py-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleCoapProtoSection("rpcRequest")
                                    }
                                    className="flex items-center gap-2 text-left"
                                  >
                                    {expandedCoapProtoSections.has(
                                      "rpcRequest",
                                    ) ? (
                                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span className="text-sm font-medium">
                                      RPC request proto schema
                                    </span>
                                  </button>
                                </div>
                                {expandedCoapProtoSections.has(
                                  "rpcRequest",
                                ) && (
                                  <div className="border-t border-muted p-3">
                                    <Editor
                                      height="220px"
                                      defaultLanguage="protobuf"
                                      language="protobuf"
                                      value={
                                        formState.coapRpcRequestProtoSchema
                                      }
                                      onChange={(value) =>
                                        updateField(
                                          "coapRpcRequestProtoSchema",
                                          value ?? "",
                                        )
                                      }
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
                                )}
                              </div>

                              <div className="rounded-lg border border-muted">
                                <div className="flex items-center justify-between bg-muted/30 px-3 py-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleCoapProtoSection("rpcResponse")
                                    }
                                    className="flex items-center gap-2 text-left"
                                  >
                                    {expandedCoapProtoSections.has(
                                      "rpcResponse",
                                    ) ? (
                                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span className="text-sm font-medium">
                                      RPC response proto schema
                                    </span>
                                  </button>
                                </div>
                                {expandedCoapProtoSections.has(
                                  "rpcResponse",
                                ) && (
                                  <div className="border-t border-muted p-3">
                                    <Editor
                                      height="200px"
                                      defaultLanguage="protobuf"
                                      language="protobuf"
                                      value={
                                        formState.coapRpcResponseProtoSchema
                                      }
                                      onChange={(value) =>
                                        updateField(
                                          "coapRpcResponseProtoSchema",
                                          value ?? "",
                                        )
                                      }
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
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    <div className="rounded-lg border border-muted p-4">
                      <label className="mb-1 block text-sm font-medium">
                        Power Saving Mode
                      </label>
                      <Select
                        options={POWER_MODE_OPTIONS}
                        value={formState.coapPowerMode}
                        onValueChange={(value) =>
                          updateField(
                            "coapPowerMode",
                            (value as PowerMode) ?? "DRX",
                          )
                        }
                      />

                      {formState.coapPowerMode === "PSM" && (
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium">
                              PSM Activity Timer*
                            </label>
                            <Input
                              type="number"
                              min={0}
                              value={formState.coapPsmActivityTimer}
                              onChange={(event) =>
                                updateField(
                                  "coapPsmActivityTimer",
                                  event.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium">
                              Time unit
                            </label>
                            <Select
                              options={TIME_UNIT_OPTIONS}
                              value={formState.coapPsmActivityTimerTimeUnit}
                              onValueChange={(value) =>
                                updateField(
                                  "coapPsmActivityTimerTimeUnit",
                                  (value as TimeUnit) ?? "SECONDS",
                                )
                              }
                            />
                          </div>
                        </div>
                      )}

                      {formState.coapPowerMode === "EDRX" && (
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium">
                              eDRX cycle*
                            </label>
                            <Input
                              type="number"
                              min={0}
                              value={formState.coapEdrxCycle}
                              onChange={(event) =>
                                updateField("coapEdrxCycle", event.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium">
                              Time unit
                            </label>
                            <Select
                              options={TIME_UNIT_OPTIONS}
                              value={formState.coapEdrxCycleTimeUnit}
                              onValueChange={(value) =>
                                updateField(
                                  "coapEdrxCycleTimeUnit",
                                  (value as TimeUnit) ?? "SECONDS",
                                )
                              }
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-sm font-medium">
                              Paging Transmission Window*
                            </label>
                            <Input
                              type="number"
                              min={0}
                              value={formState.coapPagingTransmissionWindow}
                              onChange={(event) =>
                                updateField(
                                  "coapPagingTransmissionWindow",
                                  event.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium">
                              Time unit
                            </label>
                            <Select
                              options={TIME_UNIT_OPTIONS}
                              value={
                                formState.coapPagingTransmissionWindowTimeUnit
                              }
                              onValueChange={(value) =>
                                updateField(
                                  "coapPagingTransmissionWindowTimeUnit",
                                  (value as TimeUnit) ?? "SECONDS",
                                )
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {formState.transportType === "LWM2M" && (
                  <div className="space-y-4 rounded-lg border border-muted p-4">
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {LWM2M_TAB_OPTIONS.map((tab) => {
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
                            onClick={() =>
                              updateField("lwm2mActiveTab", tab.value)
                            }
                          >
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>

                    {formState.lwm2mActiveTab === "model" && (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium">
                            Object list
                          </label>
                          <Lwm2mObjectListField
                            options={lwm2mObjectOptions}
                            selected={formState.lwm2mObjectList}
                            searchValue={lwm2mObjectSearch}
                            onSearchChange={setLwm2mObjectSearch}
                            onAdd={addLwm2mObject}
                            onRemove={removeLwm2mObject}
                            isLoading={isLoadingLwm2mObjects}
                            disabled={isSaving}
                          />
                        </div>

                        {formState.lwm2mObjectList.length > 0 && (
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium">
                              Observe strategy
                            </label>
                            <Select
                              options={[
                                {
                                  value: "SINGLE",
                                  label: "Single",
                                  description:
                                    "One Observe request per resource (higher precision, more network traffic)",
                                },
                                {
                                  value: "COMPOSITE_ALL",
                                  label: "Composite all",
                                  description:
                                    "All resources are observed with a single Composite Observe request (more efficient, less flexible)",
                                },
                                {
                                  value: "COMPOSITE_BY_OBJECT",
                                  label: "Composite by objects",
                                  description:
                                    "Resources are grouped by object type and observed using separate Composite Observe requests (balanced approach)",
                                },
                              ]}
                              value={formState.lwm2mObserveStrategy}
                              onValueChange={(value) =>
                                setFormState((prev) => {
                                  const nextObserveStrategy =
                                    (value as Lwm2mObserveStrategy) ?? "SINGLE";
                                  if (
                                    prev.lwm2mObserveStrategy ===
                                    nextObserveStrategy
                                  ) {
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
                                })
                              }
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {formState.lwm2mActiveTab === "bootstrap" && (
                      <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                        Bootstrap server configuration will be available in next
                        iteration.
                      </div>
                    )}

                    {formState.lwm2mActiveTab === "other" && (
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">
                          Power Saving Mode
                        </label>
                        <Select
                          options={POWER_MODE_OPTIONS}
                          value={formState.lwm2mPowerMode}
                          onValueChange={(value) =>
                            setFormState((prev) => {
                              const nextPowerMode =
                                (value as PowerMode) ?? "DRX";
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
                            })
                          }
                        />
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
                            onChange={(value) => {
                              setIsLwm2mJsonTouched(true);
                              updateField("lwm2mJsonConfig", value ?? "");
                            }}
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
                )}

                {formState.transportType === "SNMP" && (
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">
                          Timeout, ms*
                        </label>
                        <Input
                          type="number"
                          min={0}
                          value={formState.snmpTimeoutMs}
                          onChange={(event) =>
                            updateField("snmpTimeoutMs", event.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Retries*</label>
                        <Input
                          type="number"
                          min={0}
                          value={formState.snmpRetries}
                          onChange={(event) =>
                            updateField("snmpRetries", event.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium">
                        Communication configs
                      </label>

                      {formState.snmpCommunicationConfigs.map((config) => (
                        <div
                          key={config.id}
                          className="space-y-3 rounded-lg border border-muted p-3"
                        >
                          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_150px_auto] sm:items-end">
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium">
                                Scope
                              </label>
                              <Select
                                options={SNMP_SCOPE_OPTIONS}
                                value={config.spec}
                                onValueChange={(value) =>
                                  updateSnmpCommunicationConfig(
                                    config.id,
                                    "spec",
                                    (value as SnmpScope) ?? "CLIENT_ATTRIBUTES",
                                  )
                                }
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium">
                                Querying frequency, ms*
                              </label>
                              <Input
                                type="number"
                                min={0}
                                value={config.queryingFrequencyMs}
                                onChange={(event) =>
                                  updateSnmpCommunicationConfig(
                                    config.id,
                                    "queryingFrequencyMs",
                                    event.target.value,
                                  )
                                }
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                removeSnmpCommunicationConfig(config.id)
                              }
                              className="text-muted-foreground"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <div className="grid gap-2 sm:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)_auto]">
                              <div className="text-xs font-medium text-muted-foreground">
                                Data type
                              </div>
                              <div className="text-xs font-medium text-muted-foreground">
                                Data key *
                              </div>
                              <div className="text-xs font-medium text-muted-foreground">
                                OID *
                              </div>
                              <div />
                            </div>

                            {config.mappings.map((mapping) => (
                              <div
                                key={mapping.id}
                                className="grid gap-2 sm:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center"
                              >
                                <Select
                                  options={SNMP_DATA_TYPE_OPTIONS}
                                  value={mapping.dataType}
                                  onValueChange={(value) =>
                                    updateSnmpMapping(
                                      config.id,
                                      mapping.id,
                                      "dataType",
                                      (value as SnmpDataType) ?? "STRING",
                                    )
                                  }
                                />
                                <Input
                                  value={mapping.key}
                                  onChange={(event) =>
                                    updateSnmpMapping(
                                      config.id,
                                      mapping.id,
                                      "key",
                                      event.target.value,
                                    )
                                  }
                                  placeholder="Data key"
                                />
                                <Input
                                  value={mapping.oid}
                                  onChange={(event) =>
                                    updateSnmpMapping(
                                      config.id,
                                      mapping.id,
                                      "oid",
                                      event.target.value,
                                    )
                                  }
                                  placeholder="OID"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    removeSnmpMapping(config.id, mapping.id)
                                  }
                                  className="text-muted-foreground"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            className="gap-2"
                            onClick={() => addSnmpMapping(config.id)}
                          >
                            <Plus className="h-4 w-4" />
                            Add mapping
                          </Button>
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2"
                        onClick={addSnmpCommunicationConfig}
                      >
                        <Plus className="h-4 w-4" />
                        Add communication config
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "alarms" && (
              <div className="space-y-4">
                {formState.alarmRules.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No alarm rules configured
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formState.alarmRules.map((alarm) => {
                      const isExpanded = expandedAlarmIds.has(alarm.id);

                      return (
                        <div
                          key={alarm.id}
                          className="rounded-lg border border-muted"
                        >
                          <div className="flex items-center justify-between bg-muted/30 p-4">
                            <div className="flex flex-1 items-center gap-3">
                              <button
                                type="button"
                                onClick={() => toggleAlarmExpanded(alarm.id)}
                                className="shrink-0 text-muted-foreground hover:text-foreground"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-5 w-5" />
                                ) : (
                                  <ChevronDown className="h-5 w-5" />
                                )}
                              </button>
                              <div className="min-w-0 flex-1 text-sm font-medium">
                                {alarm.name || "Unnamed alarm"}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => deleteAlarmRule(alarm.id)}
                              className="shrink-0 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>

                          {isExpanded && (
                            <div className="space-y-4 border-t border-muted p-4">
                              <div>
                                <label className="mb-1 block text-sm font-medium">
                                  Alarm type*
                                </label>
                                <Input
                                  value={alarm.name}
                                  onChange={(e) =>
                                    updateAlarmRule(
                                      alarm.id,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Enter alarm type"
                                  disabled={isSaving}
                                />
                              </div>

                              <div>
                                <label className="mb-3 block text-sm font-medium">
                                  Create alarm rules
                                </label>
                                <div className="space-y-3">
                                  {alarm.createRuleConditions.map(
                                    (condition) => {
                                      const conditionExpanded =
                                        expandedCreateConditionIds.has(
                                          condition.id,
                                        );

                                      return (
                                        <div
                                          key={condition.id}
                                          className="rounded-lg border border-muted bg-muted/20"
                                        >
                                          <div className="flex items-center justify-between gap-3 border-b border-muted px-3 py-2">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                toggleCreateConditionExpanded(
                                                  condition.id,
                                                )
                                              }
                                              className="flex items-center gap-2 text-left"
                                            >
                                              {conditionExpanded ? (
                                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                              ) : (
                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                              )}
                                              <span className="text-sm font-medium">
                                                {SEVERITY_OPTIONS.find(
                                                  (option) =>
                                                    option.value ===
                                                    condition.severity,
                                                )?.label ?? "Condition"}
                                              </span>
                                            </button>

                                            <button
                                              type="button"
                                              onClick={() =>
                                                deleteCreateCondition(
                                                  alarm.id,
                                                  condition.id,
                                                )
                                              }
                                              className="text-muted-foreground hover:text-destructive"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </button>
                                          </div>

                                          {conditionExpanded && (
                                            <div className="space-y-3 p-3">
                                              <div>
                                                <label className="mb-1 block text-xs font-medium">
                                                  Severity
                                                </label>
                                                <Select
                                                  options={getCreateSeverityOptions(
                                                    alarm,
                                                    condition.id,
                                                  )}
                                                  value={condition.severity}
                                                  onValueChange={(value) =>
                                                    updateCreateCondition(
                                                      alarm.id,
                                                      condition.id,
                                                      "severity",
                                                      value as AlarmSeverity,
                                                    )
                                                  }
                                                  disabled={isSaving}
                                                />
                                              </div>

                                              <div>
                                                <label className="mb-1 block text-xs font-medium">
                                                  Condition
                                                </label>
                                                <AlarmConditionEditor
                                                  value={condition.condition}
                                                  onChange={(nextValue) =>
                                                    updateCreateCondition(
                                                      alarm.id,
                                                      condition.id,
                                                      "condition",
                                                      nextValue,
                                                    )
                                                  }
                                                  disabled={isSaving}
                                                />
                                              </div>

                                              <div>
                                                <label className="mb-1 block text-xs font-medium">
                                                  Schedule
                                                </label>
                                                <AlarmScheduleEditor
                                                  value={condition.schedule}
                                                  onChange={(nextValue) =>
                                                    updateCreateCondition(
                                                      alarm.id,
                                                      condition.id,
                                                      "schedule",
                                                      nextValue,
                                                    )
                                                  }
                                                  disabled={isSaving}
                                                />
                                              </div>

                                              <div>
                                                <label className="mb-1 block text-xs font-medium">
                                                  Additional info
                                                </label>
                                                <Textarea
                                                  value={
                                                    condition.additionalInfo
                                                  }
                                                  onChange={(e) =>
                                                    updateCreateCondition(
                                                      alarm.id,
                                                      condition.id,
                                                      "additionalInfo",
                                                      e.target.value,
                                                    )
                                                  }
                                                  placeholder="Enter additional information"
                                                  disabled={isSaving}
                                                />
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    },
                                  )}
                                </div>

                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => addCreateCondition(alarm.id)}
                                  disabled={
                                    isSaving ||
                                    !hasAvailableCreateSeverity(alarm)
                                  }
                                  className="mt-2 gap-2"
                                >
                                  <Plus className="h-4 w-4" />
                                  Add create condition
                                </Button>
                              </div>

                              <div>
                                <label className="mb-3 block text-sm font-medium">
                                  Clear alarm rule
                                </label>

                                <div className="space-y-3">
                                  {alarm.clearRuleConditions.map(
                                    (condition) => (
                                      <div
                                        key={condition.id}
                                        className="space-y-3 rounded-lg border border-muted bg-muted/20 p-3"
                                      >
                                        <div className="flex items-center justify-end">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              deleteClearCondition(
                                                alarm.id,
                                                condition.id,
                                              )
                                            }
                                            className="text-muted-foreground hover:text-destructive"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </button>
                                        </div>

                                        <div>
                                          <label className="mb-1 block text-xs font-medium">
                                            Condition
                                          </label>
                                          <AlarmConditionEditor
                                            value={condition.condition}
                                            onChange={(nextValue) =>
                                              updateClearCondition(
                                                alarm.id,
                                                condition.id,
                                                "condition",
                                                nextValue,
                                              )
                                            }
                                            disabled={isSaving}
                                          />
                                        </div>

                                        <div>
                                          <label className="mb-1 block text-xs font-medium">
                                            Schedule
                                          </label>
                                          <AlarmScheduleEditor
                                            value={condition.schedule}
                                            onChange={(nextValue) =>
                                              updateClearCondition(
                                                alarm.id,
                                                condition.id,
                                                "schedule",
                                                nextValue,
                                              )
                                            }
                                            disabled={isSaving}
                                          />
                                        </div>

                                        <div>
                                          <label className="mb-1 block text-xs font-medium">
                                            Additional info
                                          </label>
                                          <Textarea
                                            value={condition.additionalInfo}
                                            onChange={(e) =>
                                              updateClearCondition(
                                                alarm.id,
                                                condition.id,
                                                "additionalInfo",
                                                e.target.value,
                                              )
                                            }
                                            placeholder="Enter additional information"
                                            disabled={isSaving}
                                          />
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>

                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => addClearCondition(alarm.id)}
                                  disabled={
                                    isSaving ||
                                    alarm.clearRuleConditions.length >= 1
                                  }
                                  className="mt-2 gap-2"
                                >
                                  <Plus className="h-4 w-4" />
                                  Add clear condition
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <Button
                  type="button"
                  onClick={addAlarmRule}
                  disabled={isSaving}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add alarm rule
                </Button>
              </div>
            )}

            {activeTab === "provisioning" && (
              <div className="space-y-6 rounded-lg border p-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Provisioning type
                  </label>
                  <Select
                    value={formState.provisionType}
                    onValueChange={(value) =>
                      handleProvisionTypeChange(
                        (value as DeviceProfileProvisionType | null) ??
                          "DISABLED",
                      )
                    }
                    options={PROVISION_TYPE_OPTIONS}
                    placeholder="Select provisioning type"
                    disabled={isSaving}
                  />
                </div>

                {usesCredentialProvisioning && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label
                        htmlFor="device-profile-provision-key"
                        className="text-sm font-medium"
                      >
                        Provision device key
                      </label>
                      <div className="flex gap-2">
                        <Input
                          id="device-profile-provision-key"
                          value={formState.provisionDeviceKey}
                          onChange={(event) =>
                            updateField(
                              "provisionDeviceKey",
                              event.target.value,
                            )
                          }
                          onBlur={() =>
                            ensureProvisionCredential("provisionDeviceKey")
                          }
                          placeholder="Generated automatically if empty"
                          disabled={isSaving}
                        />
                        {!formState.provisionDeviceKey.trim() && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              ensureProvisionCredential("provisionDeviceKey")
                            }
                            disabled={isSaving}
                            aria-label="Generate provision device key"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="device-profile-provision-secret"
                        className="text-sm font-medium"
                      >
                        Provision device secret
                      </label>
                      <div className="flex gap-2">
                        <Input
                          id="device-profile-provision-secret"
                          value={formState.provisionDeviceSecret}
                          onChange={(event) =>
                            updateField(
                              "provisionDeviceSecret",
                              event.target.value,
                            )
                          }
                          onBlur={() =>
                            ensureProvisionCredential("provisionDeviceSecret")
                          }
                          placeholder="Generated automatically if empty"
                          disabled={isSaving}
                        />
                        {!formState.provisionDeviceSecret.trim() && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              ensureProvisionCredential("provisionDeviceSecret")
                            }
                            disabled={isSaving}
                            aria-label="Generate provision device secret"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {usesX509Provisioning && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          Create new devices
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Allow certificate-based provisioning to create a new
                          device when no matching device exists.
                        </p>
                      </div>
                      <Switch
                        checked={
                          formState.provisionAllowCreateNewDevicesByX509Certificate
                        }
                        onCheckedChange={(checked) =>
                          updateField(
                            "provisionAllowCreateNewDevicesByX509Certificate",
                            checked,
                          )
                        }
                        disabled={isSaving}
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="device-profile-provision-certificate"
                        className="text-sm font-medium"
                      >
                        PEM certificate
                      </label>
                      <Textarea
                        id="device-profile-provision-certificate"
                        value={formState.provisionCertificateValue}
                        onChange={(event) =>
                          updateField(
                            "provisionCertificateValue",
                            event.target.value,
                          )
                        }
                        placeholder="-----BEGIN CERTIFICATE-----"
                        className="min-h-32 font-mono text-xs"
                        disabled={isSaving}
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="device-profile-provision-regex"
                        className="text-sm font-medium"
                      >
                        CN Regular Expression variable
                      </label>
                      <Input
                        id="device-profile-provision-regex"
                        value={formState.provisionCertificateRegExPattern}
                        onChange={(event) =>
                          updateField(
                            "provisionCertificateRegExPattern",
                            event.target.value,
                          )
                        }
                        placeholder={X509_DEFAULT_REGEX}
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                )}

                {formState.provisionType === "DISABLED" && (
                  <p className="text-sm text-muted-foreground">
                    Device provisioning is disabled for this profile.
                  </p>
                )}
              </div>
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
    </>
  );
}
