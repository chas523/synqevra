"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Editor from "@monaco-editor/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  RefreshCw,
  Upload,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { CopyButton } from "@/components/molecules/CopyButton";
import { GatewayService } from "@/lib/services/thingsboardServices/gatewayService";
import type {
  GatewayCredentials,
  GatewayConfigurationData,
} from "@/lib/services/thingsboardServices/gatewayService";
import type { GatewayListItem } from "@/types/thingsboardGatewayTypes";

// ─── Types ────────────────────────────────────────────────────────────────────

type SecurityType = "ACCESS_TOKEN" | "TLS_ACCESS_TOKEN" | "USERNAME_PASSWORD";
type RemoteLogLevel =
  | "CRITICAL"
  | "ERROR"
  | "WARNING"
  | "INFO"
  | "DEBUG"
  | "TRACE";
type LocalLogLevel = "NONE" | RemoteLogLevel;
type PeriodUnit = "days" | "hours" | "minutes" | "seconds";
type LocalLoggingKey =
  | "service"
  | "connector"
  | "converter"
  | "tbConnection"
  | "storage"
  | "extension";

interface GeneralConfig {
  remoteConfiguration: boolean;
  remoteShell: boolean;
  host: string;
  port: string;
  securityType: SecurityType;
  // Access Token / TLS + Access Token
  accessToken: string;
  caCert: string;
  // Username and Password (MQTT_BASIC)
  mqttClientId: string;
  mqttUsername: string;
  mqttPassword: string;
}

interface LocalLogConfig {
  level: LocalLogLevel;
  periodValue: string;
  periodUnit: PeriodUnit;
  backupCount: string;
}

interface LogsConfig {
  dateFormat: string;
  logFormat: string;
  remoteLogging: boolean;
  remoteLevel: RemoteLogLevel;
  local: Record<LocalLoggingKey, LocalLogConfig>;
}

type StorageType = "memory" | "file" | "sqlite";

interface StorageConfig {
  type: StorageType;
  read_records_count: string;
  max_records_count: string;
  data_folder_path: string;
  max_file_count: string;
  max_read_records_count: string;
  max_records_per_file: string;
  data_file_path: string;
  messages_ttl_check_in_hours: string;
  messages_ttl_in_days: string;
  ts?: number;
}

interface GrpcConfig {
  enabled: boolean;
  serverPort: string;
  keepAliveTimeMs: string;
  keepAliveTimeoutMs: string;
  keepalivePermitWithoutCalls: boolean;
  maxPingsWithoutData: string;
  minTimeBetweenPingsMs: string;
  minPingIntervalWithoutDataMs: string;
  ts?: number;
}

interface StatisticsCommand {
  timeSeriesName: string;
  timeout: string;
  command: string;
  installCommand: string;
  expanded: boolean;
  raw?: Record<string, any>;
}

interface StatisticsConfig {
  enable: boolean;
  statsSendPeriodInSeconds: string;
  customStatsSendPeriodInSeconds: string;
  commands: StatisticsCommand[];
  raw?: Record<string, any>;
}

interface GatewayConfigurationDialogProps {
  gateway: GatewayListItem | null;
  onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateToken(length = 20): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

function parseGeneralConfig(
  sharedAttributes: GatewayConfigurationData["sharedAttributes"],
  credentials: GatewayCredentials | null,
): GeneralConfig {
  const attr = sharedAttributes.find((a) => a.key === "general_configuration");
  let parsed: any = {};
  if (attr?.value) {
    try {
      parsed =
        typeof attr.value === "string" ? JSON.parse(attr.value) : attr.value;
    } catch {
      parsed = {};
    }
  }

  const tb = parsed?.thingsboard ?? {};
  const security = tb?.security ?? {};

  // Determine credential type
  let securityType: SecurityType = "ACCESS_TOKEN";
  let accessToken = "";
  let caCert = "";
  let mqttClientId = "";
  let mqttUsername = "";
  let mqttPassword = "";

  if (credentials?.credentialsType === "MQTT_BASIC") {
    securityType = "USERNAME_PASSWORD";
    try {
      const val = JSON.parse(credentials.credentialsValue ?? "{}");
      mqttClientId = val.clientId ?? "";
      mqttUsername = val.userName ?? "";
      mqttPassword = val.password ?? "";
    } catch {
      // keep defaults
    }
  } else {
    // ACCESS_TOKEN or TLS
    accessToken = credentials?.credentialsId ?? "";
    if (security?.type === "tls" || security?.caCert) {
      securityType = "TLS_ACCESS_TOKEN";
      caCert = security?.caCert ?? "";
    } else {
      securityType = "ACCESS_TOKEN";
    }
  }

  return {
    remoteConfiguration: Boolean(tb?.remoteConfiguration ?? true),
    remoteShell: Boolean(tb?.remoteShell ?? false),
    host: tb?.host ?? "localhost",
    port: String(tb?.port ?? "1883"),
    securityType,
    accessToken,
    caCert,
    mqttClientId,
    mqttUsername,
    mqttPassword,
  };
}

// ─── Security type tab selector ───────────────────────────────────────────────

const SECURITY_OPTIONS: { value: SecurityType; label: string }[] = [
  { value: "ACCESS_TOKEN", label: "Access Token" },
  { value: "TLS_ACCESS_TOKEN", label: "TLS + Access Token" },
  { value: "USERNAME_PASSWORD", label: "Username and Password" },
];

const REMOTE_LOG_LEVELS: RemoteLogLevel[] = [
  "CRITICAL",
  "ERROR",
  "WARNING",
  "INFO",
  "DEBUG",
  "TRACE",
];

const LOCAL_LOG_LEVELS: LocalLogLevel[] = ["NONE", ...REMOTE_LOG_LEVELS];

const LOCAL_LOGGING_KEYS: LocalLoggingKey[] = [
  "service",
  "connector",
  "converter",
  "tbConnection",
  "storage",
  "extension",
];

const LOCAL_LOGGING_LABELS: Record<LocalLoggingKey, string> = {
  service: "Service",
  connector: "Connector",
  converter: "Converter",
  tbConnection: "TB Connection",
  storage: "Storage",
  extension: "Extension",
};

const PERIOD_UNITS: PeriodUnit[] = ["days", "hours", "minutes", "seconds"];

const PERIOD_UNIT_TO_WHEN: Record<PeriodUnit, string> = {
  days: "D",
  hours: "H",
  minutes: "M",
  seconds: "S",
};

const WHEN_TO_PERIOD_UNIT: Record<string, PeriodUnit> = {
  D: "days",
  H: "hours",
  M: "minutes",
  S: "seconds",
};

const LOCAL_SECTION_MAPPING: Record<
  LocalLoggingKey,
  { handler: string; logger: string }
> = {
  service: { handler: "serviceHandler", logger: "service" },
  connector: { handler: "connectorHandler", logger: "connector" },
  converter: { handler: "converterHandler", logger: "converter" },
  tbConnection: { handler: "tb_connectionHandler", logger: "tb_connection" },
  storage: { handler: "storageHandler", logger: "storage" },
  extension: { handler: "extensionHandler", logger: "extension" },
};

const DEFAULT_LOCAL_LOG: LocalLogConfig = {
  level: "INFO",
  periodValue: "7",
  periodUnit: "days",
  backupCount: "1",
};

const DEFAULT_LOGS_CONFIG: LogsConfig = {
  dateFormat: "%Y-%m-%d %H:%M:%S",
  logFormat: "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
  remoteLogging: false,
  remoteLevel: "INFO",
  local: {
    service: { ...DEFAULT_LOCAL_LOG },
    connector: { ...DEFAULT_LOCAL_LOG },
    converter: { ...DEFAULT_LOCAL_LOG },
    tbConnection: { ...DEFAULT_LOCAL_LOG },
    storage: { ...DEFAULT_LOCAL_LOG },
    extension: { ...DEFAULT_LOCAL_LOG },
  },
};

const DEFAULT_THINGSBOARD_GENERAL_FIELDS = {
  checkConnectorsConfigurationInSeconds: 60,
  statistics: {
    enable: true,
    statsSendPeriodInSeconds: 3600,
    customStatsSendPeriodInSeconds: 3600,
    commands: [] as unknown[],
  },
  maxPayloadSizeBytes: 8196,
  minPackSendDelayMS: 50,
  minPackSizeToSend: 500,
  handleDeviceRenaming: true,
  checkingDeviceActivity: {
    checkDeviceInactivity: false,
    inactivityTimeoutSeconds: 300,
    inactivityCheckPeriodSeconds: 10,
  },
  qos: 1,
};

const STORAGE_TYPE_LABELS: Record<StorageType, string> = {
  memory: "Memory storage",
  file: "File storage",
  sqlite: "SQLITE",
};

const DEFAULT_STORAGE_CONFIG: StorageConfig = {
  type: "memory",
  read_records_count: "100",
  max_records_count: "100000",
  data_folder_path: "./data/",
  max_file_count: "10",
  max_read_records_count: "10",
  max_records_per_file: "10000",
  data_file_path: "./data/data.db",
  messages_ttl_check_in_hours: "1",
  messages_ttl_in_days: "7",
};

const DEFAULT_GRPC_CONFIG: GrpcConfig = {
  enabled: false,
  serverPort: "9595",
  keepAliveTimeMs: "10000",
  keepAliveTimeoutMs: "5000",
  keepalivePermitWithoutCalls: true,
  maxPingsWithoutData: "0",
  minTimeBetweenPingsMs: "10000",
  minPingIntervalWithoutDataMs: "5000",
};

const DEFAULT_STATISTICS_CONFIG: StatisticsConfig = {
  enable: true,
  statsSendPeriodInSeconds: "3600",
  customStatsSendPeriodInSeconds: "3600",
  commands: [],
  raw: {},
};

const DEFAULT_STATISTICS_COMMAND: StatisticsCommand = {
  timeSeriesName: "",
  timeout: "1000",
  command: "",
  installCommand: "",
  expanded: true,
  raw: {},
};

const SMALL_SWITCH_CLASS =
  "h-4 w-8 [&>span]:h-3 [&>span]:w-3 data-[state=checked]:[&>span]:translate-x-4";

function parseRemoteLogLevel(value: unknown): RemoteLogLevel {
  const normalized = String(value ?? "").toUpperCase();
  return REMOTE_LOG_LEVELS.includes(normalized as RemoteLogLevel)
    ? (normalized as RemoteLogLevel)
    : "INFO";
}

function parseLocalLogLevel(value: unknown): LocalLogLevel {
  const normalized = String(value ?? "").toUpperCase();
  return LOCAL_LOG_LEVELS.includes(normalized as LocalLogLevel)
    ? (normalized as LocalLogLevel)
    : "INFO";
}

function parseLogsConfig(
  sharedAttributes: GatewayConfigurationData["sharedAttributes"],
): LogsConfig {
  const logsAttr = sharedAttributes.find((a) => a.key === "logs_configuration");
  const remoteLevelAttr = sharedAttributes.find(
    (a) => a.key === "RemoteLoggingLevel",
  );

  let parsed: any = {};
  if (logsAttr?.value != null) {
    try {
      parsed =
        typeof logsAttr.value === "string"
          ? JSON.parse(logsAttr.value)
          : logsAttr.value;
    } catch {
      parsed = {};
    }
  }

  const localSource = parsed?.local ?? parsed?.localLogging ?? {};
  const handlers = parsed?.handlers ?? {};
  const loggers = parsed?.loggers ?? {};
  const formatter =
    parsed?.formatters?.LogFormatter ?? parsed?.formatters?.logFormatter ?? {};

  const local = LOCAL_LOGGING_KEYS.reduce(
    (acc, key) => {
      const sectionRaw = localSource?.[key] ?? {};
      const mapping = LOCAL_SECTION_MAPPING[key];
      const handlerRaw = handlers?.[mapping.handler] ?? {};
      const loggerRaw = loggers?.[mapping.logger] ?? {};
      const period = sectionRaw?.savingPeriod ?? {};
      const when = String(handlerRaw?.when ?? "").toUpperCase();
      acc[key] = {
        level: parseLocalLogLevel(loggerRaw?.level ?? sectionRaw?.level),
        periodValue:
          handlerRaw?.interval != null
            ? String(handlerRaw.interval)
            : sectionRaw?.periodValue != null
              ? String(sectionRaw.periodValue)
              : period?.value != null
                ? String(period.value)
                : DEFAULT_LOCAL_LOG.periodValue,
        periodUnit:
          WHEN_TO_PERIOD_UNIT[when] ??
          (PERIOD_UNITS.includes(period?.unit as PeriodUnit)
            ? (period.unit as PeriodUnit)
            : PERIOD_UNITS.includes(sectionRaw?.periodUnit as PeriodUnit)
              ? (sectionRaw.periodUnit as PeriodUnit)
              : DEFAULT_LOCAL_LOG.periodUnit),
        backupCount:
          handlerRaw?.backupCount != null
            ? String(handlerRaw.backupCount)
            : sectionRaw?.backupCount != null
              ? String(sectionRaw.backupCount)
              : DEFAULT_LOCAL_LOG.backupCount,
      };
      return acc;
    },
    {} as Record<LocalLoggingKey, LocalLogConfig>,
  );

  return {
    dateFormat: String(
      formatter?.datefmt ??
        parsed?.dateFormat ??
        DEFAULT_LOGS_CONFIG.dateFormat,
    ),
    logFormat: String(
      formatter?.format ?? parsed?.logFormat ?? DEFAULT_LOGS_CONFIG.logFormat,
    ),
    remoteLogging:
      typeof parsed?.remoteLogging === "boolean"
        ? parsed.remoteLogging
        : Boolean(parsed?.remote?.enabled ?? parsed?.remote?.active ?? false),
    remoteLevel: parseRemoteLogLevel(
      remoteLevelAttr?.value ?? parsed?.remoteLevel ?? parsed?.remote?.level,
    ),
    local,
  };
}

function parseSharedJsonAttribute(
  sharedAttributes: GatewayConfigurationData["sharedAttributes"],
  key: string,
): Record<string, any> {
  const attr = sharedAttributes.find((a) => a.key === key);
  if (!attr?.value) return {};
  try {
    const parsed =
      typeof attr.value === "string" ? JSON.parse(attr.value) : attr.value;
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, any>)
      : {};
  } catch {
    return {};
  }
}

function parseStorageConfig(
  sharedAttributes: GatewayConfigurationData["sharedAttributes"],
): StorageConfig {
  const raw = parseSharedJsonAttribute(
    sharedAttributes,
    "storage_configuration",
  );

  const type = String(raw?.type ?? DEFAULT_STORAGE_CONFIG.type).toLowerCase();
  const normalizedType: StorageType =
    type === "file" || type === "sqlite" ? (type as StorageType) : "memory";

  return {
    type: normalizedType,
    read_records_count: String(
      raw?.read_records_count ?? DEFAULT_STORAGE_CONFIG.read_records_count,
    ),
    max_records_count: String(
      raw?.max_records_count ?? DEFAULT_STORAGE_CONFIG.max_records_count,
    ),
    data_folder_path: String(
      raw?.data_folder_path ?? DEFAULT_STORAGE_CONFIG.data_folder_path,
    ),
    max_file_count: String(
      raw?.max_file_count ?? DEFAULT_STORAGE_CONFIG.max_file_count,
    ),
    max_read_records_count: String(
      raw?.max_read_records_count ??
        DEFAULT_STORAGE_CONFIG.max_read_records_count,
    ),
    max_records_per_file: String(
      raw?.max_records_per_file ?? DEFAULT_STORAGE_CONFIG.max_records_per_file,
    ),
    data_file_path: String(
      raw?.data_file_path ?? DEFAULT_STORAGE_CONFIG.data_file_path,
    ),
    messages_ttl_check_in_hours: String(
      raw?.messages_ttl_check_in_hours ??
        DEFAULT_STORAGE_CONFIG.messages_ttl_check_in_hours,
    ),
    messages_ttl_in_days: String(
      raw?.messages_ttl_in_days ?? DEFAULT_STORAGE_CONFIG.messages_ttl_in_days,
    ),
    ts: typeof raw?.ts === "number" ? raw.ts : undefined,
  };
}

function parseGrpcConfig(
  sharedAttributes: GatewayConfigurationData["sharedAttributes"],
): GrpcConfig {
  const raw = parseSharedJsonAttribute(sharedAttributes, "grpc_configuration");

  return {
    enabled: Boolean(raw?.enabled ?? DEFAULT_GRPC_CONFIG.enabled),
    serverPort: String(raw?.serverPort ?? DEFAULT_GRPC_CONFIG.serverPort),
    keepAliveTimeMs: String(
      raw?.keepAliveTimeMs ?? DEFAULT_GRPC_CONFIG.keepAliveTimeMs,
    ),
    keepAliveTimeoutMs: String(
      raw?.keepAliveTimeoutMs ?? DEFAULT_GRPC_CONFIG.keepAliveTimeoutMs,
    ),
    keepalivePermitWithoutCalls: Boolean(
      raw?.keepalivePermitWithoutCalls ??
        raw?.keepAlivePermitWithoutCalls ??
        DEFAULT_GRPC_CONFIG.keepalivePermitWithoutCalls,
    ),
    maxPingsWithoutData: String(
      raw?.maxPingsWithoutData ?? DEFAULT_GRPC_CONFIG.maxPingsWithoutData,
    ),
    minTimeBetweenPingsMs: String(
      raw?.minTimeBetweenPingsMs ?? DEFAULT_GRPC_CONFIG.minTimeBetweenPingsMs,
    ),
    minPingIntervalWithoutDataMs: String(
      raw?.minPingIntervalWithoutDataMs ??
        DEFAULT_GRPC_CONFIG.minPingIntervalWithoutDataMs,
    ),
    ts: typeof raw?.ts === "number" ? raw.ts : undefined,
  };
}

function parseStatisticsConfig(
  sharedAttributes: GatewayConfigurationData["sharedAttributes"],
): StatisticsConfig {
  const generalRaw = parseSharedJsonAttribute(
    sharedAttributes,
    "general_configuration",
  );
  const statisticsRaw =
    generalRaw?.thingsboard?.statistics &&
    typeof generalRaw.thingsboard.statistics === "object"
      ? (generalRaw.thingsboard.statistics as Record<string, any>)
      : {};

  const commands = Array.isArray(statisticsRaw?.commands)
    ? statisticsRaw.commands.map((command): StatisticsCommand => {
        const raw =
          command && typeof command === "object"
            ? (command as Record<string, any>)
            : {};

        return {
          timeSeriesName: String(
            raw.timeSeriesName ?? raw.timeseriesName ?? raw.name ?? "",
          ),
          timeout: String(raw.timeout ?? raw.timeoutMs ?? "1000"),
          command: String(raw.command ?? raw.cmd ?? ""),
          installCommand: String(
            raw.installCommand ?? raw.install ?? raw.installCmd ?? "",
          ),
          expanded: false,
          raw,
        };
      })
    : [];

  return {
    enable: Boolean(statisticsRaw?.enable ?? DEFAULT_STATISTICS_CONFIG.enable),
    statsSendPeriodInSeconds: String(
      statisticsRaw?.statsSendPeriodInSeconds ??
        DEFAULT_STATISTICS_CONFIG.statsSendPeriodInSeconds,
    ),
    customStatsSendPeriodInSeconds: String(
      statisticsRaw?.customStatsSendPeriodInSeconds ??
        DEFAULT_STATISTICS_CONFIG.customStatsSendPeriodInSeconds,
    ),
    commands,
    raw: statisticsRaw,
  };
}

function normalizeGeneralFromAdvanced(
  thingsboard: Record<string, any>,
  credentials: GatewayCredentials | null,
  fallback: GeneralConfig,
): GeneralConfig {
  const security = thingsboard?.security ?? {};
  const securityType = String(security?.type ?? "accessToken").toLowerCase();

  if (securityType === "basic") {
    let mqttClientId = fallback.mqttClientId;
    let mqttUsername = fallback.mqttUsername;
    let mqttPassword = fallback.mqttPassword;

    if (credentials?.credentialsType === "MQTT_BASIC") {
      try {
        const parsed = JSON.parse(credentials.credentialsValue ?? "{}");
        mqttClientId = parsed.clientId ?? mqttClientId;
        mqttUsername = parsed.userName ?? mqttUsername;
        mqttPassword = parsed.password ?? mqttPassword;
      } catch {
        // keep fallback values
      }
    }

    return {
      ...fallback,
      remoteConfiguration: Boolean(thingsboard?.remoteConfiguration ?? true),
      remoteShell: Boolean(thingsboard?.remoteShell ?? false),
      host: String(thingsboard?.host ?? "localhost"),
      port: String(thingsboard?.port ?? 1883),
      securityType: "USERNAME_PASSWORD",
      mqttClientId,
      mqttUsername,
      mqttPassword,
      accessToken: "",
      caCert: "",
    };
  }

  if (securityType === "tls") {
    return {
      ...fallback,
      remoteConfiguration: Boolean(thingsboard?.remoteConfiguration ?? true),
      remoteShell: Boolean(thingsboard?.remoteShell ?? false),
      host: String(thingsboard?.host ?? "localhost"),
      port: String(thingsboard?.port ?? 1883),
      securityType: "TLS_ACCESS_TOKEN",
      accessToken: String(security?.accessToken ?? ""),
      caCert: String(security?.caCert ?? ""),
    };
  }

  return {
    ...fallback,
    remoteConfiguration: Boolean(thingsboard?.remoteConfiguration ?? true),
    remoteShell: Boolean(thingsboard?.remoteShell ?? false),
    host: String(thingsboard?.host ?? "localhost"),
    port: String(thingsboard?.port ?? 1883),
    securityType: "ACCESS_TOKEN",
    accessToken: String(security?.accessToken ?? ""),
    caCert: "",
  };
}

function normalizeLogsFromAdvanced(
  advancedLogs: Record<string, any>,
  fallback: LogsConfig,
): LogsConfig {
  const local = advancedLogs?.local ?? {};

  const normalizedLocal = LOCAL_LOGGING_KEYS.reduce(
    (acc, key) => {
      const source =
        local?.[key === "tbConnection" ? "tb_connection" : key] ?? {};
      acc[key] = {
        level: parseLocalLogLevel(
          source?.logLevel ?? fallback.local[key].level,
        ),
        periodValue: String(
          source?.savingTime ?? fallback.local[key].periodValue,
        ),
        periodUnit:
          WHEN_TO_PERIOD_UNIT[
            String(source?.savingPeriod ?? "").toUpperCase()
          ] ?? fallback.local[key].periodUnit,
        backupCount: String(
          source?.backupCount ?? fallback.local[key].backupCount,
        ),
      };
      return acc;
    },
    {} as Record<LocalLoggingKey, LocalLogConfig>,
  );

  const remoteLevel = parseRemoteLogLevel(advancedLogs?.logLevel);
  const remoteLogging =
    String(advancedLogs?.logLevel ?? "NONE").toUpperCase() !== "NONE";

  return {
    dateFormat: String(advancedLogs?.dateFormat ?? fallback.dateFormat),
    logFormat: String(advancedLogs?.logFormat ?? fallback.logFormat),
    remoteLogging,
    remoteLevel,
    local: normalizedLocal,
  };
}

// ─── Small reusable token row ─────────────────────────────────────────────────

function TokenRow({
  label,
  value,
  onChange,
  showGenerate = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  showGenerate?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex gap-1">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-sm"
          placeholder={label}
        />
        {value ? (
          <CopyButton
            value={value}
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
          />
        ) : showGenerate ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => onChange(generateToken())}
            title="Generate random"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

// ─── Placeholder tab ──────────────────────────────────────────────────────────

function PlaceholderTab({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
      <p className="text-sm font-medium">{name} configuration</p>
      <p className="text-xs">Coming soon</p>
    </div>
  );
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────

export function GatewayConfigurationDialog({
  gateway,
  onClose,
}: GatewayConfigurationDialogProps) {
  const { resolvedTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [configData, setConfigData] = useState<GatewayConfigurationData | null>(
    null,
  );
  const [general, setGeneral] = useState<GeneralConfig | null>(null);
  const [logs, setLogs] = useState<LogsConfig | null>(null);
  const [storage, setStorage] = useState<StorageConfig | null>(null);
  const [grpc, setGrpc] = useState<GrpcConfig | null>(null);
  const [statistics, setStatistics] = useState<StatisticsConfig | null>(null);
  const [localLoggingKey, setLocalLoggingKey] =
    useState<LocalLoggingKey>("service");
  const [advancedJsonValue, setAdvancedJsonValue] = useState("{}");
  const [disableConfirmName, setDisableConfirmName] = useState("");
  const caFileInputRef = useRef<HTMLInputElement>(null);
  const localLoggingScrollRef = useRef<HTMLDivElement>(null);

  // ── Load on open ──────────────────────────────────────────────────────────

  useEffect(() => {
    const id = gateway?.id?.id;
    if (!id) return;

    const load = async () => {
      setIsLoading(true);
      setGeneral(null);
      setLogs(null);
      setStorage(null);
      setGrpc(null);
      setStatistics(null);
      setDisableConfirmName("");
      setLocalLoggingKey("service");
      setConfigData(null);
      try {
        const data = await GatewayService.fetchGatewayConfiguration(id);
        setConfigData(data);
        setGeneral(parseGeneralConfig(data.sharedAttributes, data.credentials));
        setLogs(parseLogsConfig(data.sharedAttributes));
        setStorage(parseStorageConfig(data.sharedAttributes));
        setGrpc(parseGrpcConfig(data.sharedAttributes));
        setStatistics(parseStatisticsConfig(data.sharedAttributes));
      } catch {
        toast.error("Failed to load gateway configuration");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [gateway]);

  const patchGeneral = useCallback((patch: Partial<GeneralConfig>) => {
    setGeneral((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const patchLogs = useCallback((patch: Partial<LogsConfig>) => {
    setLogs((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const patchStorage = useCallback((patch: Partial<StorageConfig>) => {
    setStorage((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const patchGrpc = useCallback((patch: Partial<GrpcConfig>) => {
    setGrpc((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const patchStatistics = useCallback((patch: Partial<StatisticsConfig>) => {
    setStatistics((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const patchStatisticsCommand = useCallback(
    (index: number, patch: Partial<StatisticsCommand>) => {
      setStatistics((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          commands: prev.commands.map((command, commandIndex) =>
            commandIndex === index ? { ...command, ...patch } : command,
          ),
        };
      });
    },
    [],
  );

  const addStatisticsCommand = useCallback(() => {
    setStatistics((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        commands: [
          ...prev.commands,
          { ...DEFAULT_STATISTICS_COMMAND, raw: {} },
        ],
      };
    });
  }, []);

  const removeStatisticsCommand = useCallback((index: number) => {
    setStatistics((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        commands: prev.commands.filter(
          (_, commandIndex) => commandIndex !== index,
        ),
      };
    });
  }, []);

  const patchLocalLog = useCallback(
    (key: LocalLoggingKey, patch: Partial<LocalLogConfig>) => {
      setLogs((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          local: {
            ...prev.local,
            [key]: {
              ...prev.local[key],
              ...patch,
            },
          },
        };
      });
    },
    [],
  );

  const scrollLocalLogging = useCallback((direction: "left" | "right") => {
    const node = localLoggingScrollRef.current;
    if (!node) return;
    const step = Math.max(140, Math.floor(node.clientWidth * 0.5));
    node.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth",
    });
  }, []);

  // ── Security type change ──────────────────────────────────────────────────

  const handleSecurityTypeChange = useCallback(
    (type: SecurityType) => {
      if (!configData) return;
      // Re-parse from original data but override type
      const base = parseGeneralConfig(
        configData.sharedAttributes,
        configData.credentials,
      );
      if (type === "USERNAME_PASSWORD") {
        patchGeneral({
          securityType: type,
          mqttClientId:
            base.securityType === "USERNAME_PASSWORD" ? base.mqttClientId : "",
          mqttUsername:
            base.securityType === "USERNAME_PASSWORD" ? base.mqttUsername : "",
          mqttPassword:
            base.securityType === "USERNAME_PASSWORD" ? base.mqttPassword : "",
        });
      } else {
        patchGeneral({
          securityType: type,
          accessToken:
            base.securityType !== "USERNAME_PASSWORD" ? base.accessToken : "",
          caCert: type === "TLS_ACCESS_TOKEN" ? base.caCert : "",
        });
      }
    },
    [configData, patchGeneral],
  );

  // ── CA cert file upload ────────────────────────────────────────────────────

  const handleCaCertUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      patchGeneral({ caCert: (ev.target?.result as string) ?? "" });
    };
    reader.readAsText(file);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (
      !general ||
      !logs ||
      !storage ||
      !grpc ||
      !statistics ||
      !configData?.credentials ||
      !gateway?.id?.id
    ) {
      return;
    }

    const gatewayId = gateway.id.id;
    setIsSaving(true);
    try {
      let advancedParsed: Record<string, any>;
      try {
        advancedParsed = JSON.parse(advancedJsonValue);
      } catch {
        toast.error("Advanced JSON is not valid JSON");
        return;
      }

      const normalizedGeneral = normalizeGeneralFromAdvanced(
        advancedParsed?.thingsboard ?? {},
        configData.credentials,
        general,
      );
      const normalizedLogs = normalizeLogsFromAdvanced(
        advancedParsed?.logs ?? {},
        logs,
      );

      // 1. Build general_configuration attribute
      const securityPayload: Record<string, unknown> = {};
      if (normalizedGeneral.securityType === "ACCESS_TOKEN") {
        securityPayload.type = "accessToken";
        securityPayload.accessToken = normalizedGeneral.accessToken;
      } else if (normalizedGeneral.securityType === "TLS_ACCESS_TOKEN") {
        securityPayload.type = "tls";
        securityPayload.accessToken = normalizedGeneral.accessToken;
        if (normalizedGeneral.caCert) {
          securityPayload.caCert = normalizedGeneral.caCert;
        }
      } else {
        securityPayload.type = "basic";
      }

      const existingGeneralConfig = parseSharedJsonAttribute(
        configData.sharedAttributes,
        "general_configuration",
      );
      const existingThingsboard =
        (existingGeneralConfig.thingsboard as Record<string, unknown>) ?? {};

      const generalConfig = {
        ...existingGeneralConfig,
        thingsboard: {
          ...DEFAULT_THINGSBOARD_GENERAL_FIELDS,
          ...existingThingsboard,
          ...(advancedParsed?.thingsboard ?? {}),
          host: normalizedGeneral.host,
          port: Number(normalizedGeneral.port) || 1883,
          remoteConfiguration: normalizedGeneral.remoteConfiguration,
          remoteShell: normalizedGeneral.remoteShell,
          security: securityPayload,
        },
      };

      const logsAttr = configData.sharedAttributes.find(
        (a) => a.key === "logs_configuration",
      );
      let logsConfig: Record<string, any> = {};
      if (logsAttr?.value != null) {
        try {
          logsConfig =
            typeof logsAttr.value === "string"
              ? JSON.parse(logsAttr.value)
              : { ...logsAttr.value };
        } catch {
          logsConfig = {};
        }
      }

      logsConfig.formatters = logsConfig.formatters ?? {};
      logsConfig.formatters.LogFormatter = {
        ...(logsConfig.formatters.LogFormatter ?? {
          class: "logging.Formatter",
        }),
        format: logs.logFormat,
        datefmt: logs.dateFormat,
      };

      logsConfig.handlers = logsConfig.handlers ?? {};
      logsConfig.loggers = logsConfig.loggers ?? {};

      LOCAL_LOGGING_KEYS.forEach((key) => {
        const value = normalizedLogs.local[key];
        const mapping = LOCAL_SECTION_MAPPING[key];

        logsConfig.handlers[mapping.handler] = {
          ...(logsConfig.handlers[mapping.handler] ?? {}),
          filename: `./logs/${mapping.logger}.log`,
          backupCount: Number(value.backupCount) || 0,
          interval: Number(value.periodValue) || 0,
          when: PERIOD_UNIT_TO_WHEN[value.periodUnit],
        };

        logsConfig.loggers[mapping.logger] = {
          ...(logsConfig.loggers[mapping.logger] ?? {}),
          level: value.level,
        };
      });

      await GatewayService.saveGatewaySharedAttributes(gatewayId, {
        general_configuration: generalConfig,
        storage_configuration: advancedParsed?.storage ?? {},
        grpc_configuration: advancedParsed?.grpc ?? {},
        logs_configuration: logsConfig,
        RemoteLoggingLevel: normalizedLogs.remoteLogging
          ? normalizedLogs.remoteLevel
          : "NONE",
      });

      // 2. Save credentials
      const creds = configData.credentials;
      let newCreds: any = {
        id: creds.id,
        createdTime: creds.createdTime,
        deviceId: creds.deviceId,
        version: creds.version,
        credentialsId: null,
        credentialsValue: null,
      };

      if (normalizedGeneral.securityType === "USERNAME_PASSWORD") {
        newCreds.credentialsType = "MQTT_BASIC";
        newCreds.credentialsValue = JSON.stringify({
          clientId: normalizedGeneral.mqttClientId.trim() || null,
          userName: normalizedGeneral.mqttUsername.trim(),
          password: normalizedGeneral.mqttPassword.trim() || null,
        });
      } else {
        newCreds.credentialsType = "ACCESS_TOKEN";
        newCreds.credentialsId = normalizedGeneral.accessToken.trim();
      }

      await GatewayService.saveGatewayCredentials(newCreds);

      toast.success("Gateway configuration saved");
      onClose();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? "Failed to save configuration",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const isOpen = gateway !== null;
  const isDisableRemoteConfirmed =
    !general ||
    general.remoteConfiguration ||
    disableConfirmName.trim() === (gateway?.name ?? "");
  const editorTheme = resolvedTheme === "dark" ? "vs-dark" : "light";
  const advancedConfigJson = useMemo(() => {
    if (!configData || !general || !logs || !storage || !grpc || !statistics) {
      return "{}";
    }

    const generalRaw = parseSharedJsonAttribute(
      configData.sharedAttributes,
      "general_configuration",
    );
    const storageRaw = parseSharedJsonAttribute(
      configData.sharedAttributes,
      "storage_configuration",
    );
    const grpcRaw = parseSharedJsonAttribute(
      configData.sharedAttributes,
      "grpc_configuration",
    );

    const security: Record<string, unknown> =
      general.securityType === "USERNAME_PASSWORD"
        ? { type: "basic" }
        : general.securityType === "TLS_ACCESS_TOKEN"
          ? {
              type: "tls",
              accessToken: general.accessToken,
              ...(general.caCert ? { caCert: general.caCert } : {}),
            }
          : {
              type: "accessToken",
              accessToken: general.accessToken,
            };

    const thingsboard = {
      ...DEFAULT_THINGSBOARD_GENERAL_FIELDS,
      ...(generalRaw.thingsboard ?? {}),
      statistics: {
        ...(statistics.raw ?? {}),
        enable: statistics.enable,
        enableCustom:
          typeof statistics.raw?.enableCustom === "boolean"
            ? statistics.raw.enableCustom
            : statistics.commands.length > 0,
        statsSendPeriodInSeconds:
          Number(statistics.statsSendPeriodInSeconds) || 0,
        customStatsSendPeriodInSeconds:
          Number(statistics.customStatsSendPeriodInSeconds) || 0,
        commands: statistics.commands.map((command) => ({
          ...(command.raw ?? {}),
          timeSeriesName: command.timeSeriesName,
          timeout: Number(command.timeout) || 0,
          command: command.command,
          installCommand: command.installCommand,
        })),
      },
      host: general.host,
      port: Number(general.port) || 1883,
      remoteShell: general.remoteShell,
      remoteConfiguration: general.remoteConfiguration,
      security,
    };

    const logsLocal = {
      service: {
        logLevel: logs.local.service.level,
        filePath: "./logs",
        backupCount: Number(logs.local.service.backupCount) || 0,
        savingTime: Number(logs.local.service.periodValue) || 0,
        savingPeriod: PERIOD_UNIT_TO_WHEN[logs.local.service.periodUnit],
      },
      connector: {
        logLevel: logs.local.connector.level,
        filePath: "./logs",
        backupCount: Number(logs.local.connector.backupCount) || 0,
        savingTime: Number(logs.local.connector.periodValue) || 0,
        savingPeriod: PERIOD_UNIT_TO_WHEN[logs.local.connector.periodUnit],
      },
      converter: {
        logLevel: logs.local.converter.level,
        filePath: "./logs",
        backupCount: Number(logs.local.converter.backupCount) || 0,
        savingTime: Number(logs.local.converter.periodValue) || 0,
        savingPeriod: PERIOD_UNIT_TO_WHEN[logs.local.converter.periodUnit],
      },
      tb_connection: {
        logLevel: logs.local.tbConnection.level,
        filePath: "./logs",
        backupCount: Number(logs.local.tbConnection.backupCount) || 0,
        savingTime: Number(logs.local.tbConnection.periodValue) || 0,
        savingPeriod: PERIOD_UNIT_TO_WHEN[logs.local.tbConnection.periodUnit],
      },
      storage: {
        logLevel: logs.local.storage.level,
        filePath: "./logs",
        backupCount: Number(logs.local.storage.backupCount) || 0,
        savingTime: Number(logs.local.storage.periodValue) || 0,
        savingPeriod: PERIOD_UNIT_TO_WHEN[logs.local.storage.periodUnit],
      },
      extension: {
        logLevel: logs.local.extension.level,
        filePath: "./logs",
        backupCount: Number(logs.local.extension.backupCount) || 0,
        savingTime: Number(logs.local.extension.periodValue) || 0,
        savingPeriod: PERIOD_UNIT_TO_WHEN[logs.local.extension.periodUnit],
      },
    };

    const advanced = {
      thingsboard,
      storage: {
        ...storageRaw,
        type: storage.type,
        read_records_count: Number(storage.read_records_count) || 0,
        max_records_count: Number(storage.max_records_count) || 0,
        data_folder_path: storage.data_folder_path,
        max_file_count: Number(storage.max_file_count) || 0,
        max_read_records_count: Number(storage.max_read_records_count) || 0,
        max_records_per_file: Number(storage.max_records_per_file) || 0,
        data_file_path: storage.data_file_path,
        messages_ttl_check_in_hours:
          Number(storage.messages_ttl_check_in_hours) || 0,
        messages_ttl_in_days: Number(storage.messages_ttl_in_days) || 0,
      },
      grpc: {
        ...grpcRaw,
        enabled: grpc.enabled,
        serverPort: Number(grpc.serverPort) || 0,
        keepAliveTimeMs: Number(grpc.keepAliveTimeMs) || 0,
        keepAliveTimeoutMs: Number(grpc.keepAliveTimeoutMs) || 0,
        keepalivePermitWithoutCalls: grpc.keepalivePermitWithoutCalls,
        minTimeBetweenPingsMs: Number(grpc.minTimeBetweenPingsMs) || 0,
        minPingIntervalWithoutDataMs:
          Number(grpc.minPingIntervalWithoutDataMs) || 0,
        maxPingsWithoutData: Number(grpc.maxPingsWithoutData) || 0,
      },
      connectors: [],
      logs: {
        local: logsLocal,
        logFormat: logs.logFormat,
        dateFormat: logs.dateFormat,
        logLevel: logs.remoteLogging ? logs.remoteLevel : "NONE",
      },
    };

    return JSON.stringify(advanced, null, 2);
  }, [configData, general, logs, storage, grpc, statistics]);

  useEffect(() => {
    setAdvancedJsonValue(advancedConfigJson);
  }, [advancedConfigJson]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSaving) onClose();
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Gateway Configuration
            {gateway ? ` — ${gateway.name}` : ""}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading configuration…</span>
          </div>
        ) : (
          <Tabs
            defaultValue="general"
            className="flex-1 overflow-hidden flex flex-col"
          >
            <TabsList className="w-full justify-start shrink-0 overflow-x-auto overflow-y-hidden">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="storage">Storage</TabsTrigger>
              <TabsTrigger value="grpc">GRPC</TabsTrigger>
              <TabsTrigger value="statistic">Statistics</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <div className="flex-1 pr-1">
              {/* ── General tab ─────────────────────────────────── */}
              <TabsContent value="general" className="mt-4 space-y-5 pb-2">
                {general && (
                  <>
                    {/* Toggles */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                        <Label
                          htmlFor="remote-config"
                          className="cursor-pointer"
                        >
                          Remote Configuration
                        </Label>
                        <Switch
                          id="remote-config"
                          checked={general.remoteConfiguration}
                          onCheckedChange={(v) => {
                            patchGeneral({ remoteConfiguration: v });
                            if (v) {
                              setDisableConfirmName("");
                            }
                          }}
                        />
                      </div>
                      {!general.remoteConfiguration && (
                        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 space-y-3">
                          <p className="text-sm font-semibold">
                            Configurations will be deleted
                          </p>
                          <p className="text-sm">
                            Turning off Remote Configuration is possible only if
                            there is physical access to the Gateway. All
                            previous configurations will be deleted.
                          </p>
                          <div className="space-y-1.5">
                            <Label htmlFor="disable-remote-confirm-name">
                              To turn off configuration, enter gateway name
                              below
                            </Label>
                            <p className="text-xs text-amber-800">
                              Gateway name:{" "}
                              <span className="font-semibold">
                                {gateway?.name}
                              </span>
                            </p>
                            <Input
                              id="disable-remote-confirm-name"
                              value={disableConfirmName}
                              onChange={(e) =>
                                setDisableConfirmName(e.target.value)
                              }
                              placeholder="Gateway name"
                            />
                            {disableConfirmName.trim().length > 0 &&
                              !isDisableRemoteConfirmed && (
                                <p className="text-xs text-destructive">
                                  Entered name does not match gateway name.
                                </p>
                              )}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                        <Label
                          htmlFor="remote-shell"
                          className="cursor-pointer"
                        >
                          Remote Shell
                        </Label>
                        <Switch
                          id="remote-shell"
                          checked={general.remoteShell}
                          onCheckedChange={(v) =>
                            patchGeneral({ remoteShell: v })
                          }
                        />
                      </div>
                    </div>

                    {/* Platform connection */}
                    <div className="grid grid-cols-[1fr_120px] gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="platform-host">Platform Host</Label>
                        <Input
                          id="platform-host"
                          value={general.host}
                          onChange={(e) =>
                            patchGeneral({ host: e.target.value })
                          }
                          placeholder="localhost"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="platform-port">Port</Label>
                        <Input
                          id="platform-port"
                          type="number"
                          min={1}
                          max={65535}
                          value={general.port}
                          onChange={(e) =>
                            patchGeneral({ port: e.target.value })
                          }
                          placeholder="1883"
                        />
                      </div>
                    </div>

                    {/* Security */}
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                          Security
                        </Label>
                        <div className="flex flex-wrap bg-muted rounded-lg p-1 gap-1">
                          {SECURITY_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() =>
                                handleSecurityTypeChange(opt.value)
                              }
                              className={`flex-1 min-w-max px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                                general.securityType === opt.value
                                  ? "bg-primary text-primary-foreground shadow-sm"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Access Token */}
                      {general.securityType === "ACCESS_TOKEN" && (
                        <TokenRow
                          label="Access Token"
                          value={general.accessToken}
                          onChange={(v) => patchGeneral({ accessToken: v })}
                          showGenerate={!general.accessToken}
                        />
                      )}

                      {/* TLS + Access Token */}
                      {general.securityType === "TLS_ACCESS_TOKEN" && (
                        <div className="space-y-3">
                          <TokenRow
                            label="Access Token"
                            value={general.accessToken}
                            onChange={(v) => patchGeneral({ accessToken: v })}
                            showGenerate={!general.accessToken}
                          />
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <Label>CA Certificate</Label>
                              <button
                                type="button"
                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => caFileInputRef.current?.click()}
                              >
                                <Upload className="h-3 w-3" />
                                Upload file
                              </button>
                              <input
                                ref={caFileInputRef}
                                type="file"
                                accept=".pem,.crt,.cer,.cert"
                                className="hidden"
                                onChange={handleCaCertUpload}
                              />
                            </div>
                            <Textarea
                              value={general.caCert}
                              onChange={(e) =>
                                patchGeneral({ caCert: e.target.value })
                              }
                              placeholder={`-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----`}
                              className="font-mono text-xs min-h-30 resize-y"
                            />
                          </div>
                        </div>
                      )}

                      {/* Username and Password */}
                      {general.securityType === "USERNAME_PASSWORD" && (
                        <div className="space-y-3">
                          <TokenRow
                            label="Client ID"
                            value={general.mqttClientId}
                            onChange={(v) => patchGeneral({ mqttClientId: v })}
                            showGenerate
                          />
                          <TokenRow
                            label="Username"
                            value={general.mqttUsername}
                            onChange={(v) => patchGeneral({ mqttUsername: v })}
                            showGenerate
                          />
                          <TokenRow
                            label="Password"
                            value={general.mqttPassword}
                            onChange={(v) => patchGeneral({ mqttPassword: v })}
                            showGenerate
                          />
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                patchGeneral({
                                  mqttClientId: generateToken(),
                                  mqttUsername: generateToken(),
                                  mqttPassword: generateToken(),
                                })
                              }
                            >
                              <RefreshCw className="mr-2 h-3.5 w-3.5" />
                              Generate all
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </TabsContent>

              {/* ── Logs tab ───────────────────────────────────── */}
              <TabsContent value="logs" className="mt-4 space-y-5 pb-2">
                {logs && (
                  <>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="logs-date-format">Date format</Label>
                        <Input
                          id="logs-date-format"
                          value={logs.dateFormat}
                          onChange={(e) =>
                            patchLogs({ dateFormat: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="logs-log-format">Log format</Label>
                        <Textarea
                          id="logs-log-format"
                          value={logs.logFormat}
                          onChange={(e) =>
                            patchLogs({ logFormat: e.target.value })
                          }
                          className="min-h-24 font-mono text-xs resize-y"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="remote-logging"
                          className="cursor-pointer"
                        >
                          Remote logging
                        </Label>
                        <Switch
                          id="remote-logging"
                          checked={logs.remoteLogging}
                          onCheckedChange={(value) =>
                            patchLogs({ remoteLogging: value })
                          }
                        />
                      </div>
                      {logs.remoteLogging && (
                        <div className="space-y-1.5">
                          <Label htmlFor="remote-log-level">
                            Remote log level
                          </Label>
                          <select
                            id="remote-log-level"
                            value={logs.remoteLevel}
                            onChange={(e) =>
                              patchLogs({
                                remoteLevel: e.target.value as RemoteLogLevel,
                              })
                            }
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                          >
                            {REMOTE_LOG_LEVELS.map((level) => (
                              <option key={level} value={level}>
                                {level}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 rounded-lg border p-4">
                      <Label className="text-sm font-semibold">
                        Local logging
                      </Label>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => scrollLocalLogging("left")}
                          aria-label="Previous local logging section"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div
                          ref={localLoggingScrollRef}
                          className="flex-1 overflow-x-auto overflow-y-hidden whitespace-nowrap rounded-md border bg-muted p-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                        >
                          {LOCAL_LOGGING_KEYS.map((key) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setLocalLoggingKey(key)}
                              className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors mr-1 ${
                                localLoggingKey === key
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {LOCAL_LOGGING_LABELS[key]}
                            </button>
                          ))}
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => scrollLocalLogging("right")}
                          aria-label="Next local logging section"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="local-log-level">Log level</Label>
                          <select
                            id="local-log-level"
                            value={logs.local[localLoggingKey].level}
                            onChange={(e) =>
                              patchLocalLog(localLoggingKey, {
                                level: e.target.value as LocalLogLevel,
                              })
                            }
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                          >
                            {LOCAL_LOG_LEVELS.map((level) => (
                              <option key={level} value={level}>
                                {level}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="local-file-path">File path</Label>
                          <Input id="local-file-path" value="./logs" disabled />
                        </div>
                      </div>

                      <div className="grid grid-cols-[1fr_1fr_1fr] gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="log-saving-period">
                            Log saving period
                          </Label>
                          <Input
                            id="log-saving-period"
                            type="number"
                            min={0}
                            value={logs.local[localLoggingKey].periodValue}
                            onChange={(e) =>
                              patchLocalLog(localLoggingKey, {
                                periodValue: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="log-saving-unit">Unit</Label>
                          <select
                            id="log-saving-unit"
                            value={logs.local[localLoggingKey].periodUnit}
                            onChange={(e) =>
                              patchLocalLog(localLoggingKey, {
                                periodUnit: e.target.value as PeriodUnit,
                              })
                            }
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                          >
                            {PERIOD_UNITS.map((unit) => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="backup-count">Backup count</Label>
                          <Input
                            id="backup-count"
                            type="number"
                            min={0}
                            value={logs.local[localLoggingKey].backupCount}
                            onChange={(e) =>
                              patchLocalLog(localLoggingKey, {
                                backupCount: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>

              {/* ── Storage tab ────────────────────────────────── */}
              <TabsContent value="storage" className="mt-4 space-y-5 pb-2">
                {storage && (
                  <>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-semibold tracking-tight">
                        Storage
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Provides configuration for saving incoming data before
                        it is sent to the platform
                      </p>
                    </div>

                    <div className="inline-flex flex-wrap rounded-full bg-muted p-1 gap-1">
                      {(["memory", "file", "sqlite"] as StorageType[]).map(
                        (type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => patchStorage({ type })}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                              storage.type === type
                                ? "bg-background text-primary shadow-sm border border-primary/40"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {STORAGE_TYPE_LABELS[type]}
                          </button>
                        ),
                      )}
                    </div>

                    {storage.type === "memory" && (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Your data will be stored in the in-memory queue, it is
                          a fastest but no persistence guarantee.
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5 rounded-lg border p-4">
                            <Label htmlFor="storage-read-records">
                              Read record count in storage*
                            </Label>
                            <Input
                              id="storage-read-records"
                              type="number"
                              min={0}
                              value={storage.read_records_count}
                              onChange={(e) =>
                                patchStorage({
                                  read_records_count: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-1.5 rounded-lg border p-4">
                            <Label htmlFor="storage-max-records">
                              Maximum records in storage*
                            </Label>
                            <Input
                              id="storage-max-records"
                              type="number"
                              min={0}
                              value={storage.max_records_count}
                              onChange={(e) =>
                                patchStorage({
                                  max_records_count: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {storage.type === "file" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 rounded-lg border p-4">
                          <Label htmlFor="storage-folder-path">
                            Data folder path*
                          </Label>
                          <Input
                            id="storage-folder-path"
                            value={storage.data_folder_path}
                            onChange={(e) =>
                              patchStorage({ data_folder_path: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1.5 rounded-lg border p-4">
                          <Label htmlFor="storage-max-file-count">
                            Maximum file count*
                          </Label>
                          <Input
                            id="storage-max-file-count"
                            type="number"
                            min={0}
                            value={storage.max_file_count}
                            onChange={(e) =>
                              patchStorage({ max_file_count: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1.5 rounded-lg border p-4">
                          <Label htmlFor="storage-max-read-records">
                            Maximum read records count*
                          </Label>
                          <Input
                            id="storage-max-read-records"
                            type="number"
                            min={0}
                            value={storage.max_read_records_count}
                            onChange={(e) =>
                              patchStorage({
                                max_read_records_count: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1.5 rounded-lg border p-4">
                          <Label htmlFor="storage-max-records-file">
                            Maximum records per file*
                          </Label>
                          <Input
                            id="storage-max-records-file"
                            type="number"
                            min={0}
                            value={storage.max_records_per_file}
                            onChange={(e) =>
                              patchStorage({
                                max_records_per_file: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1.5 rounded-lg border p-4">
                          <Label htmlFor="storage-ttl-check-hours">
                            TTL check in hours*
                          </Label>
                          <Input
                            id="storage-ttl-check-hours"
                            type="number"
                            min={0}
                            value={storage.messages_ttl_check_in_hours}
                            onChange={(e) =>
                              patchStorage({
                                messages_ttl_check_in_hours: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1.5 rounded-lg border p-4">
                          <Label htmlFor="storage-ttl-days">TTL in days*</Label>
                          <Input
                            id="storage-ttl-days"
                            type="number"
                            min={0}
                            value={storage.messages_ttl_in_days}
                            onChange={(e) =>
                              patchStorage({
                                messages_ttl_in_days: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    )}

                    {storage.type === "sqlite" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 rounded-lg border p-4 col-span-2">
                          <Label htmlFor="storage-data-file">
                            Data file path*
                          </Label>
                          <Input
                            id="storage-data-file"
                            value={storage.data_file_path}
                            onChange={(e) =>
                              patchStorage({ data_file_path: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1.5 rounded-lg border p-4">
                          <Label htmlFor="sqlite-ttl-check-hours">
                            TTL check in hours*
                          </Label>
                          <Input
                            id="sqlite-ttl-check-hours"
                            type="number"
                            min={0}
                            value={storage.messages_ttl_check_in_hours}
                            onChange={(e) =>
                              patchStorage({
                                messages_ttl_check_in_hours: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1.5 rounded-lg border p-4">
                          <Label htmlFor="sqlite-ttl-days">TTL in days*</Label>
                          <Input
                            id="sqlite-ttl-days"
                            type="number"
                            min={0}
                            value={storage.messages_ttl_in_days}
                            onChange={(e) =>
                              patchStorage({
                                messages_ttl_in_days: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              {/* ── GRPC tab ───────────────────────────────────── */}
              <TabsContent value="grpc" className="mt-4 space-y-5 pb-2">
                {grpc && (
                  <>
                    <div className="space-y-4 rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <Switch
                          id="grpc-enabled"
                          checked={grpc.enabled}
                          onCheckedChange={(value) =>
                            patchGrpc({ enabled: value })
                          }
                          className={SMALL_SWITCH_CLASS}
                        />
                        <Label
                          htmlFor="grpc-enabled"
                          className="cursor-pointer text-base font-semibold"
                        >
                          GRPC
                        </Label>
                      </div>

                      <div className="flex items-center gap-3 rounded-lg border px-3 py-2.5 opacity-80">
                        <Switch
                          id="grpc-keepalive-permit"
                          checked={grpc.keepalivePermitWithoutCalls}
                          onCheckedChange={(value) =>
                            patchGrpc({ keepalivePermitWithoutCalls: value })
                          }
                          disabled={!grpc.enabled}
                          className={SMALL_SWITCH_CLASS}
                        />
                        <Label
                          htmlFor="grpc-keepalive-permit"
                          className="cursor-pointer text-sm font-medium"
                        >
                          Keep alive permit without calls
                        </Label>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 rounded-lg border p-4">
                          <Label htmlFor="grpc-server-port">Server port*</Label>
                          <Input
                            id="grpc-server-port"
                            type="number"
                            min={0}
                            value={grpc.serverPort}
                            onChange={(e) =>
                              patchGrpc({ serverPort: e.target.value })
                            }
                            disabled={!grpc.enabled}
                          />
                        </div>
                        <div className="space-y-1.5 rounded-lg border p-4">
                          <Label htmlFor="grpc-keepalive-timeout">
                            Keep alive timeout (in ms)*
                          </Label>
                          <Input
                            id="grpc-keepalive-timeout"
                            type="number"
                            min={0}
                            value={grpc.keepAliveTimeoutMs}
                            onChange={(e) =>
                              patchGrpc({ keepAliveTimeoutMs: e.target.value })
                            }
                            disabled={!grpc.enabled}
                          />
                        </div>
                        <div className="space-y-1.5 rounded-lg border p-4">
                          <Label htmlFor="grpc-keepalive-time">
                            Keep alive (in ms)*
                          </Label>
                          <Input
                            id="grpc-keepalive-time"
                            type="number"
                            min={0}
                            value={grpc.keepAliveTimeMs}
                            onChange={(e) =>
                              patchGrpc({ keepAliveTimeMs: e.target.value })
                            }
                            disabled={!grpc.enabled}
                          />
                        </div>
                        <div className="space-y-1.5 rounded-lg border p-4">
                          <Label htmlFor="grpc-min-time-between-pings">
                            Min time between pings (in ms)*
                          </Label>
                          <Input
                            id="grpc-min-time-between-pings"
                            type="number"
                            min={0}
                            value={grpc.minTimeBetweenPingsMs}
                            onChange={(e) =>
                              patchGrpc({
                                minTimeBetweenPingsMs: e.target.value,
                              })
                            }
                            disabled={!grpc.enabled}
                          />
                        </div>
                        <div className="space-y-1.5 rounded-lg border p-4">
                          <Label htmlFor="grpc-max-pings-without-data">
                            Max pings without data*
                          </Label>
                          <Input
                            id="grpc-max-pings-without-data"
                            type="number"
                            min={0}
                            value={grpc.maxPingsWithoutData}
                            onChange={(e) =>
                              patchGrpc({ maxPingsWithoutData: e.target.value })
                            }
                            disabled={!grpc.enabled}
                          />
                        </div>
                        <div className="space-y-1.5 rounded-lg border p-4">
                          <Label htmlFor="grpc-min-ping-interval">
                            Min ping interval without data (in ms)*
                          </Label>
                          <Input
                            id="grpc-min-ping-interval"
                            type="number"
                            min={0}
                            value={grpc.minPingIntervalWithoutDataMs}
                            onChange={(e) =>
                              patchGrpc({
                                minPingIntervalWithoutDataMs: e.target.value,
                              })
                            }
                            disabled={!grpc.enabled}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>

              {/* ── Statistics tab ─────────────────────────────── */}
              <TabsContent value="statistic" className="mt-4 space-y-5 pb-2">
                {statistics && (
                  <div className="space-y-4 rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <Switch
                        id="statistics-enabled"
                        checked={statistics.enable}
                        onCheckedChange={(value) =>
                          patchStatistics({ enable: value })
                        }
                        className={SMALL_SWITCH_CLASS}
                      />
                      <Label
                        htmlFor="statistics-enabled"
                        className="cursor-pointer text-base font-semibold"
                      >
                        Statistics
                      </Label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5 rounded-lg border p-4">
                        <Label htmlFor="statistics-send-period">
                          Statistics send period (in seconds)*
                        </Label>
                        <Input
                          id="statistics-send-period"
                          type="number"
                          min={0}
                          value={statistics.statsSendPeriodInSeconds}
                          onChange={(e) =>
                            patchStatistics({
                              statsSendPeriodInSeconds: e.target.value,
                            })
                          }
                          disabled={!statistics.enable}
                        />
                      </div>
                      <div className="space-y-1.5 rounded-lg border p-4">
                        <Label htmlFor="statistics-custom-send-period">
                          Custom statistics send period (in seconds)*
                        </Label>
                        <Input
                          id="statistics-custom-send-period"
                          type="number"
                          min={0}
                          value={statistics.customStatsSendPeriodInSeconds}
                          onChange={(e) =>
                            patchStatistics({
                              customStatsSendPeriodInSeconds: e.target.value,
                            })
                          }
                          disabled={!statistics.enable}
                        />
                      </div>
                    </div>

                    <div className="space-y-3 rounded-lg border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <Label className="text-sm font-semibold">
                            Commands
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Configure custom commands used to collect extra
                            gateway statistics.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addStatisticsCommand}
                          disabled={!statistics.enable}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add command
                        </Button>
                      </div>

                      {statistics.commands.length === 0 ? (
                        <div className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                          No custom commands configured.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {statistics.commands.map((command, index) => (
                            <div
                              key={index}
                              className="rounded-lg border p-4 space-y-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <p className="text-sm font-semibold">
                                  Command {index + 1}
                                </p>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground"
                                  onClick={() => removeStatisticsCommand(index)}
                                  disabled={!statistics.enable}
                                  aria-label={`Remove statistics command ${index + 1}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <Label
                                    htmlFor={`statistics-command-name-${index}`}
                                  >
                                    Time series name*
                                  </Label>
                                  <Input
                                    id={`statistics-command-name-${index}`}
                                    value={command.timeSeriesName}
                                    onChange={(e) =>
                                      patchStatisticsCommand(index, {
                                        timeSeriesName: e.target.value,
                                      })
                                    }
                                    disabled={!statistics.enable}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label
                                    htmlFor={`statistics-command-timeout-${index}`}
                                  >
                                    Timeout (in ms)*
                                  </Label>
                                  <Input
                                    id={`statistics-command-timeout-${index}`}
                                    type="number"
                                    min={0}
                                    value={command.timeout}
                                    onChange={(e) =>
                                      patchStatisticsCommand(index, {
                                        timeout: e.target.value,
                                      })
                                    }
                                    disabled={!statistics.enable}
                                  />
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <Label
                                  htmlFor={`statistics-command-value-${index}`}
                                >
                                  Command*
                                </Label>
                                <Textarea
                                  id={`statistics-command-value-${index}`}
                                  value={command.command}
                                  onChange={(e) =>
                                    patchStatisticsCommand(index, {
                                      command: e.target.value,
                                    })
                                  }
                                  className="min-h-24 font-mono text-xs resize-y"
                                  disabled={!statistics.enable}
                                />
                              </div>

                              <Collapsible
                                open={command.expanded}
                                onOpenChange={(open) =>
                                  patchStatisticsCommand(index, {
                                    expanded: open,
                                  })
                                }
                              >
                                <CollapsibleTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-auto px-0 text-sm font-medium text-muted-foreground hover:text-foreground"
                                    disabled={!statistics.enable}
                                  >
                                    <ChevronDown
                                      className={`mr-2 h-4 w-4 transition-transform ${
                                        command.expanded ? "rotate-180" : ""
                                      }`}
                                    />
                                    Advanced settings
                                  </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="pt-3">
                                  <div className="space-y-1.5 rounded-lg border p-4">
                                    <Label
                                      htmlFor={`statistics-command-install-${index}`}
                                    >
                                      Install command
                                    </Label>
                                    <Textarea
                                      id={`statistics-command-install-${index}`}
                                      value={command.installCommand}
                                      onChange={(e) =>
                                        patchStatisticsCommand(index, {
                                          installCommand: e.target.value,
                                        })
                                      }
                                      className="min-h-20 font-mono text-xs resize-y"
                                      disabled={!statistics.enable}
                                    />
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* ── Placeholder tabs ──────────────────────────── */}
              <TabsContent value="other">
                <PlaceholderTab name="Other" />
              </TabsContent>
              <TabsContent value="advanced">
                <div className="mt-4 space-y-2 pb-2">
                  <Label htmlFor="advanced-json">Advanced JSON</Label>
                  <div
                    id="advanced-json"
                    className="overflow-hidden rounded-lg border bg-[#fbfbfc] dark:bg-slate-950"
                  >
                    <Editor
                      height="420px"
                      defaultLanguage="json"
                      language="json"
                      value={advancedJsonValue}
                      onChange={(value) => setAdvancedJsonValue(value ?? "")}
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
                        padding: { top: 12, bottom: 12 },
                      }}
                    />
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              isLoading ||
              isSaving ||
              general === null ||
              logs === null ||
              storage === null ||
              grpc === null ||
              statistics === null ||
              !isDisableRemoteConfirmed
            }
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
