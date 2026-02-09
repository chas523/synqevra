"use client";

import { useState, useMemo, useEffect } from "react";
import type { TenantProfile } from "@/lib/types/dashboardTypes";
import {
    TenantService,
    TenantAttribute,
    AlarmInfo,
} from "@/lib/services/adminServices/tenantService";
import { AddAttributeModal, AttributeValueType } from "@/components/molecules/AddAttributeModal";
import { AlarmFilters, AlarmStatus, AlarmSeverity } from "@/components/molecules/AlarmFilters";
import { TimeRangeFilter, TimeRange } from "@/components/molecules/TimeRangeFilter";
import { EntityDetailPanel } from "@/components/templates/EntityDetailPanel";
import { Copy, Check, X, ChevronDown, ChevronUp, Save, Edit, Trash2, Plus, Link2, AlertTriangle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { EditQueueDialog } from "./EditQueueDialog";
import { formatTenantDate } from "@/lib/utils";

export interface TenantProfileDetailPanelProps {
    tenantProfile: TenantProfile | null;
    isOpen: boolean;
    onClose: () => void;
    onTenantProfileUpdated?: (profile: TenantProfile) => void;
}

// Editable field component
function EditableField({
    label,
    value,
    onChange,
    type = "text",
    placeholder,
    disabled = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    placeholder?: string;
    disabled?: boolean;
}) {
    return (
        <div className="py-3 border-b border-slate-200 dark:border-slate-700/50">
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder || `Enter ${label.toLowerCase()}`}
                disabled={disabled}
                className={`w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
        </div>
    );
}

// Editable textarea component
function EditableTextarea({
    label,
    value,
    onChange,
    rows = 3,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    rows?: number;
}) {
    return (
        <div className="py-3 border-b border-slate-200 dark:border-slate-700/50">
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                {label}
            </label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={rows}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 resize-none"
            />
        </div>
    );
}

// Editable number field component
function EditableNumberField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: number;
    onChange: (value: number) => void;
}) {
    return (
        <div className="mb-4">
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                {label}
            </label>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                className="w-full text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
        </div>
    );
}

// Editable text field component for rate limits
function EditableTextField({
    label,
    value,
    onChange,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}) {
    return (
        <div className="mb-4">
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder || "Not set"}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
            />
        </div>
    );
}

// Read-only field component
function ReadOnlyField({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="py-3 border-b border-slate-200 dark:border-slate-700/50">
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                {label}
            </label>
            <div className="text-sm text-slate-900 dark:text-white">
                {value || "-"}
            </div>
        </div>
    );
}

// Configuration field for 2-column layout  
function ConfigField({ label, value }: { label: string; value: number | null | undefined }) {
    const displayValue = value === 0 || value === null || value === undefined ? "0" : value.toString();
    return (
        <div className="mb-4">
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                {label}
            </label>
            <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                {displayValue}
            </div>
        </div>
    );
}

// Collapsible section component
function ConfigSection({
    title,
    children,
    defaultExpanded = false,
}: {
    title: string;
    children: React.ReactNode;
    defaultExpanded?: boolean;
}) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg mb-4">
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
                <span className="text-xs uppercase tracking-wider font-semibold">
                    {title}
                </span>
                {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                ) : (
                    <ChevronDown className="h-4 w-4" />
                )}
            </button>
            {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                    {children}
                </div>
            )}
        </div>
    );
}

// Queue configuration type
interface QueueConfig {
    name: string;
    topic: string;
    pollInterval: number;
    partitions: number;
    consumerPerPartition: boolean;
    packProcessingTimeout: number;
    submitStrategy: {
        type: string;
        batchSize: number;
    };
    processingStrategy: {
        type: string;
        retries: number;
        failurePercentage: number;
        pauseBetweenRetries: number;
        maxPauseBetweenRetries: number;
    };
}




// Tab content components
function AttributesTabContent({ profileId }: { profileId: string }) {
    const [attributes, setAttributes] = useState<TenantAttribute[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [scope, setScope] = useState<"SERVER_SCOPE" | "CLIENT_SCOPE" | "SHARED_SCOPE">("SERVER_SCOPE");

    const fetchAttributes = async () => {
        try {
            setLoading(true);
            const data = await TenantService.getTenantProfileAttributes(profileId, scope);
            setAttributes(data);
            setError(null);
        } catch (err) {
            setError("Failed to fetch attributes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttributes();
    }, [profileId, scope]);

    const handleAddAttribute = async (key: string, value: unknown, _valueType: AttributeValueType) => {
        await TenantService.saveTenantProfileAttributes(profileId, { [key]: value }, scope);
        toast.success(`Attribute "${key}" added successfully`);
        await fetchAttributes();
    };

    if (loading) {
        return (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                Loading attributes...
            </div>
        );
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">{error}</div>;
    }

    return (
        <div className="space-y-4">
            {/* Header with Add button and Scope selector */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700/50">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Attributes ({attributes.length})
                    </span>
                    <select
                        value={scope}
                        onChange={(e) => setScope(e.target.value as any)}
                        className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1"
                    >
                        <option value="SERVER_SCOPE">Server Scope</option>
                        <option value="CLIENT_SCOPE">Client Scope</option>
                        <option value="SHARED_SCOPE">Shared Scope</option>
                    </select>
                </div>
                <button
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add
                </button>
            </div>

            {/* Attributes list */}
            {attributes.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    No attributes
                </div>
            ) : (
                <div className="space-y-2">
                    {attributes.map((attr) => (
                        <div key={attr.key} className="py-2 border-b border-slate-200 dark:border-slate-700/50">
                            <span className="text-xs text-slate-500 dark:text-slate-400">{attr.key}</span>
                            <div className="text-sm text-slate-900 dark:text-white">{String(attr.value)}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Attribute Modal */}
            <AddAttributeModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddAttribute}
                title="Add attribute"
            />
        </div>
    );
}

function AlarmsTabContent({ profileId }: { profileId: string }) {
    const [alarms, setAlarms] = useState<AlarmInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedStatuses, setSelectedStatuses] = useState<AlarmStatus[]>(['ACTIVE']);
    const [selectedSeverities, setSelectedSeverities] = useState<AlarmSeverity[]>([]);
    const [timeRange, setTimeRange] = useState<TimeRange>({
        type: "ALL_TIME",
    });

    const fetchAlarms = async () => {
        try {
            setLoading(true);
            const data = await TenantService.getTenantProfileAlarms(
                profileId,
                0,
                50,
                selectedStatuses.length > 0 ? selectedStatuses : undefined,
                selectedSeverities.length > 0 ? selectedSeverities : undefined,
                timeRange.startTime,
                timeRange.endTime
            );
            setAlarms(data.data || []);
            setError(null);
        } catch (err) {
            setError("Failed to fetch alarms");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlarms();
    }, [profileId, selectedStatuses, selectedSeverities, timeRange]);

    const getSeverityColor = (severity: AlarmInfo["severity"]) => {
        switch (severity) {
            case "CRITICAL":
                return "text-red-600 bg-red-100 dark:bg-red-900/30";
            case "MAJOR":
                return "text-orange-600 bg-orange-100 dark:bg-orange-900/30";
            case "MINOR":
                return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
            case "WARNING":
                return "text-blue-600 bg-blue-100 dark:bg-blue-900/30";
            default:
                return "text-slate-600 bg-slate-100 dark:bg-slate-800";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return "text-red-600 bg-red-100 dark:bg-red-900/30";
            case "CLEARED":
                return "text-green-600 bg-green-100 dark:bg-green-900/30";
            case "ACKNOWLEDGED":
                return "text-blue-600 bg-blue-100 dark:bg-blue-900/30";
            default:
                return "text-slate-600 bg-slate-100 dark:bg-slate-800";
        }
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-700/50">
                <AlarmFilters
                    selectedStatuses={selectedStatuses}
                    onStatusChange={setSelectedStatuses}
                    selectedSeverities={selectedSeverities}
                    onSeverityChange={setSelectedSeverities}
                />
                <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
            </div>

            {/* Loading / Error / Empty / List */}
            {loading ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    Loading alarms...
                </div>
            ) : error ? (
                <div className="text-center py-8 text-red-500">{error}</div>
            ) : alarms.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    No alarms
                </div>
            ) : (
                <div className="space-y-3">
                    {alarms.map((alarm) => (
                        <div
                            key={alarm.id.id}
                            className="p-3 rounded-lg border border-slate-200 dark:border-slate-700"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-slate-900 dark:text-white">
                                    {alarm.name}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(alarm.status)}`}
                                    >
                                        {alarm.status}
                                    </span>
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(alarm.severity)}`}
                                    >
                                        {alarm.severity}
                                    </span>
                                </div>
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                <span>Type: {alarm.type}</span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                                {new Date(alarm.createdTime).toLocaleString("en-US")}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function TenantProfileDetailPanel({

    tenantProfile,
    isOpen,
    onClose,
    onTenantProfileUpdated,
}: TenantProfileDetailPanelProps) {
    const [activeTab, setActiveTab] = useState("details");
    const [isSaving, setIsSaving] = useState(false);

    // Form state for editing
    const [formState, setFormState] = useState({
        name: tenantProfile?.name || "",
        description: tenantProfile?.description || "",
        isolatedTbRuleEngine: tenantProfile?.isolatedTbRuleEngine || false,
        configuration: {
            // Entities
            maxDevices: 0,
            maxAssets: 0,
            maxCustomers: 0,
            maxUsers: 0,
            maxDashboards: 0,
            maxRuleChains: 0,
            maxEdges: 0,
            maxResourcesInBytes: 0,
            maxOtaPackagesInBytes: 0,
            maxResourceSize: 0,

            // Transport & Rule Engine
            maxTransportMessages: 0,
            maxTransportDataPoints: 0,
            maxREExecutions: 0,
            maxJSExecutions: 0,
            maxTbelExecutions: 0,
            maxRuleNodeExecutionsPerMessage: 0,
            maxExecuteRateLimit: 0,

            // Calculated Fields
            maxCalculatedFieldsPerEntity: 0,
            maxDataPointsPerRollingArg: 0,
            maxArgumentsPerCF: 0,
            maxStateSizeInKBytes: 0,
            maxSingleValueArgumentSizeInKBytes: 0,

            // TTL
            maxDPStorageDays: 0,
            defaultStorageTtlDays: 0,
            alarmsTtlDays: 0,
            rpcTtlDays: 0,
            queueStatsTtlDays: 0,
            ruleEngineExceptionsTtlDays: 0,

            // Alarms & Notifications
            maxEmails: 0,
            maxSms: 0,
            maxCreatedAlarms: 0,
            smsEnabled: false,

            // Debug
            maxDebugModeDurationMinutes: 0,

            // WS
            maxWsSessionsPerTenant: 0,
            maxWsSubscriptionsPerTenant: 0,
            maxWsSessionsPerCustomer: 0,
            maxWsSubscriptionsPerCustomer: 0,
            maxWsSessionsPerRegularUser: 0,
            maxWsSubscriptionsPerRegularUser: 0,
            maxWsSessionsPerPublicUser: 0,
            maxWsSubscriptionsPerPublicUser: 0,
            wsMsgQueueLimitPerSession: 0,
            warnThreshold: 0,

            // Rate Limits
            transportTenantMsgRateLimit: "",
            transportTenantTelemetryMsgRateLimit: "",
            transportTenantTelemetryDataPointsRateLimit: "",
            transportDeviceMsgRateLimit: "",
            transportDeviceTelemetryMsgRateLimit: "",
            transportDeviceTelemetryDataPointsRateLimit: "",
            transportGatewayMsgRateLimit: "",
            transportGatewayTelemetryMsgRateLimit: "",
            transportGatewayTelemetryDataPointsRateLimit: "",
            tenantEntityExportRateLimit: "",
            tenantEntityImportRateLimit: "",
            tenantNotificationRequestsRateLimit: "",
            tenantNotificationRequestsPerRuleRateLimit: "",
            type: "DEFAULT",
        },
        queueConfiguration: [] as QueueConfig[],
    });

    // State for advanced settings toggles
    const [entitiesAdvanced, setEntitiesAdvanced] = useState(false);
    const [ruleEngineAdvanced, setRuleEngineAdvanced] = useState(false);
    const [calculatedFieldsAdvanced, setCalculatedFieldsAdvanced] = useState(false);
    const [wsAdvanced, setWsAdvanced] = useState(false);
    const [rateLimitsAdvanced, setRateLimitsAdvanced] = useState(false);

    // State for queue dialog
    const [isQueueDialogOpen, setIsQueueDialogOpen] = useState(false);
    const [editingQueueIndex, setEditingQueueIndex] = useState<number | null>(null);
    const [editingQueue, setEditingQueue] = useState<QueueConfig | null>(null);

    // Initialize form state when tenantProfile changes
    useEffect(() => {
        if (tenantProfile) {
            const config = tenantProfile.profileData?.configuration || {};
            setFormState({
                name: tenantProfile.name || "",
                description: tenantProfile.description || "",
                isolatedTbRuleEngine: tenantProfile.isolatedTbRuleEngine || false,
                configuration: {
                    // Entities
                    maxDevices: config.maxDevices ?? 0,
                    maxAssets: config.maxAssets ?? 0,
                    maxCustomers: config.maxCustomers ?? 0,
                    maxUsers: config.maxUsers ?? 0,
                    maxDashboards: config.maxDashboards ?? 0,
                    maxRuleChains: config.maxRuleChains ?? 0,
                    maxEdges: config.maxEdges ?? 0,
                    maxResourcesInBytes: config.maxResourcesInBytes ?? 0,
                    maxOtaPackagesInBytes: config.maxOtaPackagesInBytes ?? 0,
                    maxResourceSize: config.maxResourceSize ?? 0,

                    // Transport & Rule Engine
                    maxTransportMessages: config.maxTransportMessages ?? 0,
                    maxTransportDataPoints: config.maxTransportDataPoints ?? 0,
                    maxREExecutions: config.maxREExecutions ?? 0,
                    maxJSExecutions: config.maxJSExecutions ?? 0,
                    maxTbelExecutions: config.maxTbelExecutions ?? 0,
                    maxRuleNodeExecutionsPerMessage: config.maxRuleNodeExecutionsPerMessage ?? 0,
                    maxExecuteRateLimit: config.maxExecuteRateLimit ?? 0,

                    // Calculated Fields
                    maxCalculatedFieldsPerEntity: config.maxCalculatedFieldsPerEntity ?? 0,
                    maxDataPointsPerRollingArg: config.maxDataPointsPerRollingArg ?? 0,
                    maxArgumentsPerCF: config.maxArgumentsPerCF ?? 0,
                    maxStateSizeInKBytes: config.maxStateSizeInKBytes ?? 0,
                    maxSingleValueArgumentSizeInKBytes: config.maxSingleValueArgumentSizeInKBytes ?? 0,

                    // TTL
                    maxDPStorageDays: config.maxDPStorageDays ?? 0,
                    defaultStorageTtlDays: config.defaultStorageTtlDays ?? 0,
                    alarmsTtlDays: config.alarmsTtlDays ?? 0,
                    rpcTtlDays: config.rpcTtlDays ?? 0,
                    queueStatsTtlDays: config.queueStatsTtlDays ?? 0,
                    ruleEngineExceptionsTtlDays: config.ruleEngineExceptionsTtlDays ?? 0,

                    // Alarms & Notifications
                    maxEmails: config.maxEmails ?? 0,
                    maxSms: config.maxSms ?? 0,
                    maxCreatedAlarms: config.maxCreatedAlarms ?? 0,
                    smsEnabled: config.smsEnabled ?? false,

                    // Debug
                    maxDebugModeDurationMinutes: config.maxDebugModeDurationMinutes ?? 0,

                    // WS
                    maxWsSessionsPerTenant: config.maxWsSessionsPerTenant ?? 0,
                    maxWsSubscriptionsPerTenant: config.maxWsSubscriptionsPerTenant ?? 0,
                    maxWsSessionsPerCustomer: config.maxWsSessionsPerCustomer ?? 0,
                    maxWsSubscriptionsPerCustomer: config.maxWsSubscriptionsPerCustomer ?? 0,
                    maxWsSessionsPerRegularUser: config.maxWsSessionsPerRegularUser ?? 0,
                    maxWsSubscriptionsPerRegularUser: config.maxWsSubscriptionsPerRegularUser ?? 0,
                    maxWsSessionsPerPublicUser: config.maxWsSessionsPerPublicUser ?? 0,
                    maxWsSubscriptionsPerPublicUser: config.maxWsSubscriptionsPerPublicUser ?? 0,
                    wsMsgQueueLimitPerSession: config.wsMsgQueueLimitPerSession ?? 0,
                    warnThreshold: config.warnThreshold ?? 0,

                    // Rate Limits
                    transportTenantMsgRateLimit: config.transportTenantMsgRateLimit ?? "",
                    transportTenantTelemetryMsgRateLimit: config.transportTenantTelemetryMsgRateLimit ?? "",
                    transportTenantTelemetryDataPointsRateLimit: config.transportTenantTelemetryDataPointsRateLimit ?? "",
                    transportDeviceMsgRateLimit: config.transportDeviceMsgRateLimit ?? "",
                    transportDeviceTelemetryMsgRateLimit: config.transportDeviceTelemetryMsgRateLimit ?? "",
                    transportDeviceTelemetryDataPointsRateLimit: config.transportDeviceTelemetryDataPointsRateLimit ?? "",
                    transportGatewayMsgRateLimit: config.transportGatewayMsgRateLimit ?? "",
                    transportGatewayTelemetryMsgRateLimit: config.transportGatewayTelemetryMsgRateLimit ?? "",
                    transportGatewayTelemetryDataPointsRateLimit: config.transportGatewayTelemetryDataPointsRateLimit ?? "",
                    tenantEntityExportRateLimit: config.tenantEntityExportRateLimit ?? "",
                    tenantEntityImportRateLimit: config.tenantEntityImportRateLimit ?? "",
                    tenantNotificationRequestsRateLimit: config.tenantNotificationRequestsRateLimit ?? "",
                    tenantNotificationRequestsPerRuleRateLimit: config.tenantNotificationRequestsPerRuleRateLimit ?? "",
                    type: config.type || "DEFAULT",
                },
                queueConfiguration: (tenantProfile.profileData?.queueConfiguration || []) as QueueConfig[],
            });
        }
    }, [tenantProfile]);

    // Check if form has changes
    const hasChanges = useMemo(() => {
        if (!tenantProfile) return false;
        const config = tenantProfile.profileData?.configuration || {};

        // Check basic fields
        const basicChanged =
            formState.name !== (tenantProfile.name || "") ||
            formState.description !== (tenantProfile.description || "") ||
            formState.isolatedTbRuleEngine !== (tenantProfile.isolatedTbRuleEngine || false);

        // Check configuration fields
        const configChanged = Object.keys(formState.configuration).some((key) => {
            const fieldKey = key as keyof typeof formState.configuration;
            return formState.configuration[fieldKey] !== (config[fieldKey] ?? 0);
        });

        return basicChanged || configChanged;
    }, [formState, tenantProfile]);

    const updateField = <K extends keyof typeof formState>(field: K) => (value: typeof formState[K]) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
    };

    const updateConfigField = (field: keyof typeof formState.configuration) => (value: number) => {
        setFormState((prev) => ({
            ...prev,
            configuration: {
                ...prev.configuration,
                [field]: value,
            },
        }));
    };

    const updateConfigStringField = (field: keyof typeof formState.configuration) => (value: string) => {
        setFormState((prev) => ({
            ...prev,
            configuration: {
                ...prev.configuration,
                [field]: value,
            },
        }));
    };

    // Queue management handlers
    const handleAddQueue = () => {
        setEditingQueue(null);
        setEditingQueueIndex(null);
        setIsQueueDialogOpen(true);
    };

    const handleEditQueue = (index: number) => {
        setEditingQueue(formState.queueConfiguration[index]);
        setEditingQueueIndex(index);
        setIsQueueDialogOpen(true);
    };

    const handleDeleteQueue = (index: number) => {
        setFormState((prev) => ({
            ...prev,
            queueConfiguration: prev.queueConfiguration.filter((_, i) => i !== index),
        }));
        toast.success("Queue deleted");
    };

    const handleSaveQueue = (queue: QueueConfig) => {
        if (editingQueueIndex !== null) {
            // Edit existing queue
            setFormState((prev) => ({
                ...prev,
                queueConfiguration: prev.queueConfiguration.map((q, i) =>
                    i === editingQueueIndex ? queue : q
                ),
            }));
            toast.success("Queue updated");
        } else {
            // Add new queue
            setFormState((prev) => ({
                ...prev,
                queueConfiguration: [...prev.queueConfiguration, queue],
            }));
            toast.success("Queue added");
        }
        setIsQueueDialogOpen(false);
        setEditingQueue(null);
        setEditingQueueIndex(null);
    };

    const handleSave = async () => {
        if (!tenantProfile || !hasChanges) return;

        setIsSaving(true);
        try {
            const updatedProfile: TenantProfile = {
                ...tenantProfile,
                name: formState.name,
                description: formState.description,
                isolatedTbRuleEngine: formState.isolatedTbRuleEngine,
                profileData: {
                    ...tenantProfile.profileData,
                    configuration: formState.configuration,
                    queueConfiguration: formState.queueConfiguration.length > 0 ? formState.queueConfiguration : null,
                },
            };

            const saved = await TenantService.saveTenantProfile(updatedProfile);
            toast.success("Tenant profile updated successfully");
            onTenantProfileUpdated?.(saved);
        } catch (error) {
            toast.error("Failed to update tenant profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (!tenantProfile) return;
        const config = tenantProfile.profileData?.configuration || {};
        setFormState({
            name: tenantProfile.name || "",
            description: tenantProfile.description || "",
            isolatedTbRuleEngine: tenantProfile.isolatedTbRuleEngine || false,
            configuration: {
                // Entities
                maxDevices: config.maxDevices ?? 0,
                maxAssets: config.maxAssets ?? 0,
                maxCustomers: config.maxCustomers ?? 0,
                maxUsers: config.maxUsers ?? 0,
                maxDashboards: config.maxDashboards ?? 0,
                maxRuleChains: config.maxRuleChains ?? 0,
                maxEdges: config.maxEdges ?? 0,
                maxResourcesInBytes: config.maxResourcesInBytes ?? 0,
                maxOtaPackagesInBytes: config.maxOtaPackagesInBytes ?? 0,
                maxResourceSize: config.maxResourceSize ?? 0,

                // Transport & Rule Engine
                maxTransportMessages: config.maxTransportMessages ?? 0,
                maxTransportDataPoints: config.maxTransportDataPoints ?? 0,
                maxREExecutions: config.maxREExecutions ?? 0,
                maxJSExecutions: config.maxJSExecutions ?? 0,
                maxTbelExecutions: config.maxTbelExecutions ?? 0,
                maxRuleNodeExecutionsPerMessage: config.maxRuleNodeExecutionsPerMessage ?? 0,
                maxExecuteRateLimit: config.maxExecuteRateLimit ?? 0,

                // Calculated Fields
                maxCalculatedFieldsPerEntity: config.maxCalculatedFieldsPerEntity ?? 0,
                maxDataPointsPerRollingArg: config.maxDataPointsPerRollingArg ?? 0,
                maxArgumentsPerCF: config.maxArgumentsPerCF ?? 0,
                maxStateSizeInKBytes: config.maxStateSizeInKBytes ?? 0,
                maxSingleValueArgumentSizeInKBytes: config.maxSingleValueArgumentSizeInKBytes ?? 0,

                // TTL
                maxDPStorageDays: config.maxDPStorageDays ?? 0,
                defaultStorageTtlDays: config.defaultStorageTtlDays ?? 0,
                alarmsTtlDays: config.alarmsTtlDays ?? 0,
                rpcTtlDays: config.rpcTtlDays ?? 0,
                queueStatsTtlDays: config.queueStatsTtlDays ?? 0,
                ruleEngineExceptionsTtlDays: config.ruleEngineExceptionsTtlDays ?? 0,

                // Alarms & Notifications
                maxEmails: config.maxEmails ?? 0,
                maxSms: config.maxSms ?? 0,
                maxCreatedAlarms: config.maxCreatedAlarms ?? 0,
                smsEnabled: config.smsEnabled ?? false,

                // Debug
                maxDebugModeDurationMinutes: config.maxDebugModeDurationMinutes ?? 0,

                // WS
                maxWsSessionsPerTenant: config.maxWsSessionsPerTenant ?? 0,
                maxWsSubscriptionsPerTenant: config.maxWsSubscriptionsPerTenant ?? 0,
                maxWsSessionsPerCustomer: config.maxWsSessionsPerCustomer ?? 0,
                maxWsSubscriptionsPerCustomer: config.maxWsSubscriptionsPerCustomer ?? 0,
                maxWsSessionsPerRegularUser: config.maxWsSessionsPerRegularUser ?? 0,
                maxWsSubscriptionsPerRegularUser: config.maxWsSubscriptionsPerRegularUser ?? 0,
                maxWsSessionsPerPublicUser: config.maxWsSessionsPerPublicUser ?? 0,
                maxWsSubscriptionsPerPublicUser: config.maxWsSubscriptionsPerPublicUser ?? 0,
                wsMsgQueueLimitPerSession: config.wsMsgQueueLimitPerSession ?? 0,
                warnThreshold: config.warnThreshold ?? 0,

                // Rate Limits
                transportTenantMsgRateLimit: config.transportTenantMsgRateLimit ?? "",
                transportTenantTelemetryMsgRateLimit: config.transportTenantTelemetryMsgRateLimit ?? "",
                transportTenantTelemetryDataPointsRateLimit: config.transportTenantTelemetryDataPointsRateLimit ?? "",
                transportDeviceMsgRateLimit: config.transportDeviceMsgRateLimit ?? "",
                transportDeviceTelemetryMsgRateLimit: config.transportDeviceTelemetryMsgRateLimit ?? "",
                transportDeviceTelemetryDataPointsRateLimit: config.transportDeviceTelemetryDataPointsRateLimit ?? "",
                transportGatewayMsgRateLimit: config.transportGatewayMsgRateLimit ?? "",
                transportGatewayTelemetryMsgRateLimit: config.transportGatewayTelemetryMsgRateLimit ?? "",
                transportGatewayTelemetryDataPointsRateLimit: config.transportGatewayTelemetryDataPointsRateLimit ?? "",
                tenantEntityExportRateLimit: config.tenantEntityExportRateLimit ?? "",
                tenantEntityImportRateLimit: config.tenantEntityImportRateLimit ?? "",
                tenantNotificationRequestsRateLimit: config.tenantNotificationRequestsRateLimit ?? "",
                tenantNotificationRequestsPerRuleRateLimit: config.tenantNotificationRequestsPerRuleRateLimit ?? "",
                type: config.type || "DEFAULT",
            },
            queueConfiguration: (tenantProfile.profileData?.queueConfiguration || []) as QueueConfig[],
        });
    };

    const handleCopyId = () => {
        if (!tenantProfile) return;
        navigator.clipboard.writeText(tenantProfile.id.id);
        toast.success("Tenant Profile ID copied to clipboard");
    };

    if (!tenantProfile) return null;

    const config = tenantProfile.profileData?.configuration;

    const tabs = [
        {
            id: "details",
            label: "Details",
            content: (
                <div className="space-y-0 max-h-[calc(100vh-200px)] overflow-y-auto pb-6">
                    {/* Copy ID Button */}
                    <div className="pb-4 border-b border-slate-200 dark:border-slate-700/50">
                        <button
                            type="button"
                            onClick={handleCopyId}
                            className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                        >
                            <Copy className="w-4 h-4" />
                            Copy profile ID
                        </button>
                    </div>

                    <EditableField
                        label="Name"
                        value={formState.name}
                        onChange={updateField("name")}
                        disabled={tenantProfile.name === 'Default'}
                    />

                    <EditableTextarea
                        label="Description"
                        value={formState.description}
                        onChange={updateField("description")}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <ReadOnlyField
                            label="Default"
                            value={
                                tenantProfile.default ? (
                                    <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                                        <Check className="w-4 h-4" />
                                        <span>Yes</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <X className="w-4 h-4" />
                                        <span>No</span>
                                    </div>
                                )
                            }
                        />
                        <div className="py-3 border-b border-slate-200 dark:border-slate-700/50">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formState.isolatedTbRuleEngine}
                                    onChange={(e) => updateField("isolatedTbRuleEngine")(e.target.checked)}
                                    disabled={formState.queueConfiguration.length > 0 || tenantProfile.name === 'Default'}
                                    className="w-4 h-4 text-cyan-600 bg-slate-100 border-slate-300 rounded focus:ring-cyan-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <span className={`text-sm ${formState.queueConfiguration.length > 0 || tenantProfile.name === 'Default' ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>
                                    Use isolated ThingsBoard Rule Engine queues
                                </span>
                            </label>
                        </div>
                    </div>

                    <ReadOnlyField
                        label="Created Time"
                        value={formatTenantDate(tenantProfile.createdTime)}
                    />
                </div>
            ),
        },
        {
            id: "configuration",
            label: "Configuration",
            content: (
                <div className="pb-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                    <div className="space-y-6">
                        {/* Tenant Profile Configuration */}
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                            Profile configuration
                        </h3>

                        <div className="space-y-4">
                            {/* Entities Section */}
                            <ConfigSection title="Entities (0 - unlimited)" defaultExpanded={true}>
                                <div className="grid grid-cols-2 gap-x-4">
                                    <EditableNumberField label="Devices maximum number*" value={formState.configuration.maxDevices} onChange={updateConfigField("maxDevices")} />
                                    <EditableNumberField label="Dashboards maximum number*" value={formState.configuration.maxDashboards} onChange={updateConfigField("maxDashboards")} />
                                    <EditableNumberField label="Assets maximum number*" value={formState.configuration.maxAssets} onChange={updateConfigField("maxAssets")} />
                                    <EditableNumberField label="Users maximum number*" value={formState.configuration.maxUsers} onChange={updateConfigField("maxUsers")} />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setEntitiesAdvanced(!entitiesAdvanced)}
                                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 mb-2 flex items-center gap-1"
                                >
                                    Advanced settings
                                    {entitiesAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                </button>

                                {entitiesAdvanced && (
                                    <div className="grid grid-cols-2 gap-x-4">
                                        <EditableNumberField label="Customers maximum number*" value={formState.configuration.maxCustomers} onChange={updateConfigField("maxCustomers")} />
                                        <EditableNumberField label="Rule chains maximum number*" value={formState.configuration.maxRuleChains} onChange={updateConfigField("maxRuleChains")} />
                                        <EditableNumberField label="Edges maximum number*" value={formState.configuration.maxEdges} onChange={updateConfigField("maxEdges")} />
                                    </div>
                                )}
                            </ConfigSection>

                            {/* Rule Engine Section */}
                            <ConfigSection title="Rule Engine (0 - unlimited)">
                                <div className="grid grid-cols-2 gap-x-4">
                                    <EditableNumberField label="Rule Engine executions maximum number*" value={formState.configuration.maxREExecutions} onChange={updateConfigField("maxREExecutions")} />
                                    <EditableNumberField label="Transport messages maximum number*" value={formState.configuration.maxTransportMessages} onChange={updateConfigField("maxTransportMessages")} />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setRuleEngineAdvanced(!ruleEngineAdvanced)}
                                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 mb-2 flex items-center gap-1"
                                >
                                    Advanced settings
                                    {ruleEngineAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                </button>

                                {ruleEngineAdvanced && (
                                    <div className="grid grid-cols-2 gap-x-4">
                                        <EditableNumberField label="JS functions executions maximum number*" value={formState.configuration.maxJSExecutions} onChange={updateConfigField("maxJSExecutions")} />
                                        <EditableNumberField label="Transport data points maximum number*" value={formState.configuration.maxTransportDataPoints} onChange={updateConfigField("maxTransportDataPoints")} />
                                        <EditableNumberField label="Rule node executions per message maximum number*" value={formState.configuration.maxRuleNodeExecutionsPerMessage} onChange={updateConfigField("maxRuleNodeExecutionsPerMessage")} />
                                    </div>
                                )}
                            </ConfigSection>

                            {/* Calculated Fields Section */}
                            <ConfigSection title="Calculated fields (0 - unlimited)">
                                <div className="grid grid-cols-2 gap-x-4">
                                    <EditableNumberField label="Calculated fields per entity maximum number*" value={formState.configuration.maxCalculatedFieldsPerEntity} onChange={updateConfigField("maxCalculatedFieldsPerEntity")} />
                                    <EditableNumberField label="Max data points number in rolling arguments*" value={formState.configuration.maxDataPointsPerRollingArg} onChange={updateConfigField("maxDataPointsPerRollingArg")} />
                                    <EditableNumberField label="Arguments per calculated field max number*" value={formState.configuration.maxArgumentsPerCF} onChange={updateConfigField("maxArgumentsPerCF")} />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setCalculatedFieldsAdvanced(!calculatedFieldsAdvanced)}
                                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 mb-2 flex items-center gap-1"
                                >
                                    Advanced settings
                                    {calculatedFieldsAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                </button>

                                {calculatedFieldsAdvanced && (
                                    <div className="grid grid-cols-2 gap-x-4">
                                        <EditableNumberField label="State maximum size in KB*" value={formState.configuration.maxStateSizeInKBytes} onChange={updateConfigField("maxStateSizeInKBytes")} />
                                        <EditableNumberField label="Single value argument maximum size in KB*" value={formState.configuration.maxSingleValueArgumentSizeInKBytes} onChange={updateConfigField("maxSingleValueArgumentSizeInKBytes")} />
                                    </div>
                                )}
                            </ConfigSection>

                            {/* Time-to-live Section */}
                            <ConfigSection title="Time-to-live (0 - unlimited)">
                                <div className="grid grid-cols-2 gap-x-4">
                                    <EditableNumberField label="Data points storage days maximum number*" value={formState.configuration.defaultStorageTtlDays} onChange={updateConfigField("defaultStorageTtlDays")} />
                                    <EditableNumberField label="Alarms TTL days*" value={formState.configuration.alarmsTtlDays} onChange={updateConfigField("alarmsTtlDays")} />
                                    <EditableNumberField label="Storage TTL days by default*" value={formState.configuration.maxDPStorageDays} onChange={updateConfigField("maxDPStorageDays")} />
                                    <EditableNumberField label="RPC TTL days*" value={formState.configuration.rpcTtlDays} onChange={updateConfigField("rpcTtlDays")} />
                                    <EditableNumberField label="Queue stats TTL days*" value={formState.configuration.queueStatsTtlDays} onChange={updateConfigField("queueStatsTtlDays")} />
                                    <EditableNumberField label="Rule Engine exceptions TTL days*" value={formState.configuration.ruleEngineExceptionsTtlDays} onChange={updateConfigField("ruleEngineExceptionsTtlDays")} />
                                </div>
                            </ConfigSection>

                            {/* Alarms and Notifications Section */}
                            <ConfigSection title="Alarms and notifications (0 - unlimited)">
                                <div className="mb-4">
                                    <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <div className={`w-4 h-4 rounded-full border-2 ${config?.smsEnabled ? 'bg-slate-400 border-slate-400' : 'border-slate-300 dark:border-slate-600'}`} />
                                        SMS enabled
                                    </label>
                                </div>

                                <div className="grid grid-cols-2 gap-x-4">
                                    <EditableNumberField label="Emails sent maximum number*" value={formState.configuration.maxEmails} onChange={updateConfigField("maxEmails")} />
                                    <EditableNumberField label="Alarms created maximum number*" value={formState.configuration.maxCreatedAlarms} onChange={updateConfigField("maxCreatedAlarms")} />
                                </div>
                            </ConfigSection>

                            {/* Debug Section */}
                            <ConfigSection title="Debug">
                                <EditableNumberField label="Maximum debug duration (min)" value={formState.configuration.maxDebugModeDurationMinutes} onChange={updateConfigField("maxDebugModeDurationMinutes")} />
                            </ConfigSection>

                            {/* WS Section */}
                            <ConfigSection title="WS (0 - unlimited)">
                                <div className="grid grid-cols-2 gap-x-4">
                                    <EditableNumberField label="Sessions per tenant maximum number" value={formState.configuration.maxWsSessionsPerTenant} onChange={updateConfigField("maxWsSessionsPerTenant")} />
                                    <EditableNumberField label="Subscriptions per tenant maximum number" value={formState.configuration.maxWsSubscriptionsPerTenant} onChange={updateConfigField("maxWsSubscriptionsPerTenant")} />
                                    <EditableNumberField label="Sessions per customer maximum number" value={formState.configuration.maxWsSessionsPerCustomer} onChange={updateConfigField("maxWsSessionsPerCustomer")} />
                                    <EditableNumberField label="Subscriptions per customer maximum number" value={formState.configuration.maxWsSubscriptionsPerCustomer} onChange={updateConfigField("maxWsSubscriptionsPerCustomer")} />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setWsAdvanced(!wsAdvanced)}
                                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 mb-2 flex items-center gap-1"
                                >
                                    Advanced settings
                                    {wsAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                </button>

                                {wsAdvanced && (
                                    <div className="grid grid-cols-2 gap-x-4">
                                        <EditableNumberField label="Sessions per regular user maximum number" value={formState.configuration.maxWsSessionsPerRegularUser} onChange={updateConfigField("maxWsSessionsPerRegularUser")} />
                                        <EditableNumberField label="Subscriptions per regular user maximum number" value={formState.configuration.maxWsSubscriptionsPerRegularUser} onChange={updateConfigField("maxWsSubscriptionsPerRegularUser")} />
                                        <EditableNumberField label="Sessions per public user maximum number" value={formState.configuration.maxWsSessionsPerPublicUser} onChange={updateConfigField("maxWsSessionsPerPublicUser")} />
                                        <EditableNumberField label="Subscriptions per public user maximum number" value={formState.configuration.maxWsSubscriptionsPerPublicUser} onChange={updateConfigField("maxWsSubscriptionsPerPublicUser")} />
                                        <EditableNumberField label="WS message queue limit per session" value={formState.configuration.wsMsgQueueLimitPerSession} onChange={updateConfigField("wsMsgQueueLimitPerSession")} />
                                    </div>
                                )}
                            </ConfigSection>

                            {/* Rate Limits Section */}
                            <ConfigSection title="Rate limits">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-x-4">
                                        <EditableTextField label="Transport tenant messages" value={formState.configuration.transportTenantMsgRateLimit} onChange={updateConfigStringField("transportTenantMsgRateLimit")} />
                                        <EditableTextField label="Transport device messages" value={formState.configuration.transportDeviceMsgRateLimit} onChange={updateConfigStringField("transportDeviceMsgRateLimit")} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-4">
                                        <EditableTextField label="Transport tenant telemetry messages" value={formState.configuration.transportTenantTelemetryMsgRateLimit} onChange={updateConfigStringField("transportTenantTelemetryMsgRateLimit")} />
                                        <EditableTextField label="Transport device telemetry messages" value={formState.configuration.transportDeviceTelemetryMsgRateLimit} onChange={updateConfigStringField("transportDeviceTelemetryMsgRateLimit")} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-4">
                                        <div>
                                            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                Transport gateway messages
                                            </label>
                                            <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                                                {config?.transportGatewayMsgRateLimit || "Not set"}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                Transport gateway device messages
                                            </label>
                                            <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                                                {config?.transportGatewayDeviceMsgRateLimit || "Not set"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-4">
                                        <div>
                                            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                Transport gateway telemetry messages
                                            </label>
                                            <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                                                {config?.transportGatewayTelemetryMsgRateLimit || "Not set"}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                Transport gateway device telemetry messages
                                            </label>
                                            <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                                                {config?.transportGatewayDeviceTelemetryMsgRateLimit || "Not set"}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setRateLimitsAdvanced(!rateLimitsAdvanced)}
                                        className="text-xs text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1"
                                    >
                                        Advanced settings
                                        {rateLimitsAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                    </button>

                                    {rateLimitsAdvanced && (
                                        <div className="space-y-4 mt-4">
                                            <div className="grid grid-cols-2 gap-x-4">
                                                <div>
                                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                        Transport tenant telemetry data points
                                                    </label>
                                                    <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                                                        {config?.transportTenantTelemetryDataPointsRateLimit || "Not set"}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                        Transport device telemetry data points
                                                    </label>
                                                    <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                                                        {config?.transportDeviceTelemetryDataPointsRateLimit || "Not set"}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-x-4">
                                                <div>
                                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                        Transport gateway telemetry data points
                                                    </label>
                                                    <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                                                        {config?.transportGatewayTelemetryDataPointsRateLimit || "Not set"}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                        Transport gateway device telemetry data points
                                                    </label>
                                                    <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                                                        {config?.transportGatewayDeviceTelemetryDataPointsRateLimit || "Not set"}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-x-4">
                                                <div>
                                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                        REST requests for tenant
                                                    </label>
                                                    <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                                                        Not set
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                        REST requests for customer
                                                    </label>
                                                    <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                                                        Not set
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-x-4">
                                                <EditableTextField label="Entity version creation" value={formState.configuration.tenantEntityExportRateLimit} onChange={updateConfigStringField("tenantEntityExportRateLimit")} />
                                                <EditableTextField label="Entity version load" value={formState.configuration.tenantEntityImportRateLimit} onChange={updateConfigStringField("tenantEntityImportRateLimit")} />
                                            </div>

                                            <div className="grid grid-cols-2 gap-x-4">
                                                <EditableTextField label="Notification requests" value={formState.configuration.tenantNotificationRequestsRateLimit} onChange={updateConfigStringField("tenantNotificationRequestsRateLimit")} />
                                                <EditableTextField label="Notification requests per notification rule" value={formState.configuration.tenantNotificationRequestsPerRuleRateLimit} onChange={updateConfigStringField("tenantNotificationRequestsPerRuleRateLimit")} />
                                            </div>

                                            <div className="grid grid-cols-2 gap-x-4">
                                                <div>
                                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                        Edge events
                                                    </label>
                                                    <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                                                        {config?.edgeEventRateLimits || "Not set"}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                        Edge events per edge
                                                    </label>
                                                    <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                                                        {config?.edgeEventRateLimitsPerEdge || "Not set"}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-x-4">
                                                <div>
                                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                        Edge uplink messages
                                                    </label>
                                                    <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                                                        {config?.edgeUplinkMessagesRateLimits || "Not set"}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                        Edge uplink messages per edge
                                                    </label>
                                                    <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                                                        {config?.edgeUplinkMessagesRateLimitsPerEdge || "Not set"}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-x-4">
                                                <div>
                                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                        WS updates per session
                                                    </label>
                                                    <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                                                        {config?.wsUpdatesPerSessionRateLimit || "Not set"}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ConfigSection>


                            {/* Queue Configuration Section */}
                            <ConfigSection title={`Queues (${formState.queueConfiguration.length})`}>
                                <div className="mb-4">
                                    <button
                                        type="button"
                                        onClick={handleAddQueue}
                                        disabled={!formState.isolatedTbRuleEngine}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Queue
                                    </button>
                                    {!formState.isolatedTbRuleEngine && (
                                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                            Enable "Use isolated ThingsBoard Rule Engine queues" to configure queues.
                                        </p>
                                    )}
                                </div>

                                {formState.queueConfiguration.length === 0 ? (
                                    <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                                        No queues configured. Click "Add Queue" to create one.
                                    </div>
                                ) : (
                                    formState.queueConfiguration.map((queue, index) => {
                                        // Helper function to format strategy type
                                        const formatStrategyType = (type: string) => {
                                            const typeMap: Record<string, string> = {
                                                'BURST': 'Burst',
                                                'BATCH': 'Batch',
                                                'SEQUENTIAL': 'Sequential',
                                                'SEQUENTIAL_BY_ORIGINATOR': 'Sequential by originator',
                                                'SEQUENTIAL_BY_TENANT': 'Sequential by tenant'
                                            };
                                            return typeMap[type] || type;
                                        };

                                        // Helper function to format processing type
                                        const formatProcessingType = (type: string) => {
                                            const typeMap: Record<string, string> = {
                                                'SKIP_ALL_FAILURES': 'Skip all failures',
                                                'SKIP_ALL_FAILURES_AND_TIMEOUTS': 'Skip all failures and timeouts',
                                                'RETRY_ALL': 'Retry all',
                                                'RETRY_FAILED': 'Retry failed',
                                                'RETRY_TIMED_OUT': 'Retry timeout',
                                                'RETRY_FAILED_AND_TIMED_OUT': 'Retry failed and timeout'
                                            };
                                            return typeMap[type] || type;
                                        };

                                        return (
                                            <div key={index} className="mb-6 last:mb-0 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                        {queue.name}
                                                    </h4>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEditQueue(index)}
                                                            className="p-2 text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                                                            title="Edit queue"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteQueue(index)}
                                                            className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                                                            title="Delete queue"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    {/* Basic queue info */}
                                                    <div className="grid grid-cols-2 gap-x-4">
                                                        <div>
                                                            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                                Topic
                                                            </label>
                                                            <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                                                                {queue.topic}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Submit settings */}
                                                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg">
                                                        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-700">
                                                            <h5 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                                                Submit settings
                                                            </h5>
                                                        </div>
                                                        <div className="p-4 space-y-3">
                                                            <div>
                                                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                                    Strategy type
                                                                </label>
                                                                <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                                                                    {formatStrategyType(queue.submitStrategy.type)}
                                                                </div>
                                                            </div>
                                                            {(queue.submitStrategy.type === 'BURST' || queue.submitStrategy.type === 'BATCH') && (
                                                                <div>
                                                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                                        Batch size
                                                                    </label>
                                                                    <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                                                                        {queue.submitStrategy.batchSize}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Retries processing settings */}
                                                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg">
                                                        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-700">
                                                            <h5 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                                                Retries processing settings
                                                            </h5>
                                                        </div>
                                                        <div className="p-4 space-y-3">
                                                            <div>
                                                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                                    Processing type
                                                                </label>
                                                                <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                                                                    {formatProcessingType(queue.processingStrategy.type)}
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-x-4">
                                                                <div>
                                                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                                        Number of retries (0 – unlimited)
                                                                    </label>
                                                                    <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                                                                        {queue.processingStrategy.retries}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                                        Failure messages for skipping retries, %
                                                                    </label>
                                                                    <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                                                                        {queue.processingStrategy.failurePercentage}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-x-4">
                                                                <div>
                                                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                                        Retry within, sec
                                                                    </label>
                                                                    <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                                                                        {queue.processingStrategy.pauseBetweenRetries}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                                        Additional retry within, sec
                                                                    </label>
                                                                    <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                                                                        {queue.processingStrategy.maxPauseBetweenRetries}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Polling settings */}
                                                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg">
                                                        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-700">
                                                            <h5 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                                                Polling settings
                                                            </h5>
                                                        </div>
                                                        <div className="p-4 space-y-4">
                                                            {/* Batch processing */}
                                                            <div>
                                                                <h6 className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-3">
                                                                    Batch processing
                                                                </h6>
                                                                <div className="grid grid-cols-2 gap-x-4">
                                                                    <div>
                                                                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                                            Poll interval (ms)
                                                                        </label>
                                                                        <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                                                                            {queue.pollInterval}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                                            Partitions
                                                                        </label>
                                                                        <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                                                                            {queue.partitions}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Immediate processing */}
                                                            <div>
                                                                <h6 className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-3">
                                                                    Immediate processing
                                                                </h6>
                                                                <div className="grid grid-cols-2 gap-x-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={queue.consumerPerPartition}
                                                                            disabled
                                                                            className="w-4 h-4 text-cyan-600 bg-slate-100 border-slate-300 rounded focus:ring-cyan-500 dark:bg-slate-700 dark:border-slate-600"
                                                                        />
                                                                        <label className="text-xs text-slate-600 dark:text-slate-400">
                                                                            Send message poll for each consumer
                                                                        </label>
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                                            Processing within, ms
                                                                        </label>
                                                                        <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                                                                            {queue.packProcessingTimeout}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </ConfigSection>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: "attributes",
            label: "Attributes",
            content: <AttributesTabContent profileId={tenantProfile.id.id} />,
        },
        {
            id: "alarms",
            label: "Alarms",
            content: <AlarmsTabContent profileId={tenantProfile.id.id} />,
        },
    ];

    const actionButtons = activeTab === "details" ? [
        {
            label: isSaving ? "Saving..." : "Save",
            onClick: handleSave,
            variant: "primary" as const,
            icon: <Save className="w-4 h-4" />,
            disabled: !hasChanges || isSaving,
        },
        {
            label: "Cancel",
            onClick: handleCancel,
            variant: "secondary" as const,
            icon: <X className="w-4 h-4" />,
            disabled: !hasChanges,
        },
    ] : [];

    return (
        <>
            <EntityDetailPanel
                isOpen={isOpen}
                onClose={onClose}
                title={tenantProfile?.name || "Tenant Profile Details"}
                subtitle={`ID: ${tenantProfile?.id.id || ""}`}
                tabs={tabs}
                onTabChange={setActiveTab}
                actionButtons={actionButtons}
            />
            <EditQueueDialog
                isOpen={isQueueDialogOpen}
                queue={editingQueue}
                onClose={() => setIsQueueDialogOpen(false)}
                onSave={handleSaveQueue}
            />
        </>
    );
}
