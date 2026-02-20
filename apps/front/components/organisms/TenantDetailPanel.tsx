"use client";

import { TimeRangeFilter, type TimeRange } from "../molecules/TimeRangeFilter";
import { EventFilters, type EventType } from "../molecules/EventFilters";
import { AddRelationDialog } from "../molecules/AddRelationDialog";
import Select from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Tenant } from "@/lib/types/dashboardTypes";
import {
    TenantService,
    TenantAttribute,
    AlarmInfo,
    EventInfo,
    EntityRelation,
    EntityAlarmsResponse,
    EntityEventsResponse,
    UpdateTenantRequest,
} from "@/lib/services/adminServices/tenantService";
import { EntityDetailPanel } from "@/components/templates/EntityDetailPanel";
import { DetailPanelSection } from "@/components/molecules/DetailPanelSection";
import { AddAttributeModal, AttributeValueType } from "@/components/molecules/AddAttributeModal";
import { Copy, Save, X, AlertTriangle, Link2, Plus, ArrowRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export interface TenantDetailPanelProps {
    tenant: Tenant | null;
    isOpen: boolean;
    onClose: () => void;
    onTenantUpdated?: (tenant: Tenant) => void;
}

// Editable input component
function EditableField({
    label,
    value,
    onChange,
    type = "text",
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    placeholder?: string;
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
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
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

// Tab content components
function AttributesTabContent({ tenantId }: { tenantId: string }) {
    const [attributes, setAttributes] = useState<TenantAttribute[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const fetchAttributes = useCallback(async () => {
        try {
            setLoading(true);
            const data = await TenantService.getTenantAttributes(tenantId);
            setAttributes(data);
            setError(null);
        } catch (err) {
            setError("Failed to fetch attributes");
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        fetchAttributes();
    }, [fetchAttributes]);

    const handleAddAttribute = useCallback(
        async (key: string, value: unknown, _valueType: AttributeValueType) => {
            await TenantService.saveTenantAttributes(tenantId, { [key]: value });
            toast.success(`Attribute "${key}" added successfully`);
            await fetchAttributes();
        },
        [tenantId, fetchAttributes]
    );

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
            {/* Header with Add button */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700/50">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Attributes ({attributes.length})
                </span>
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

import { AlarmFilters, type AlarmStatus, type AlarmSeverity } from "../molecules/AlarmFilters";

function AlarmsTabContent({ tenantId }: { tenantId: string }) {
    const [alarms, setAlarms] = useState<AlarmInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedStatuses, setSelectedStatuses] = useState<AlarmStatus[]>(['ACTIVE']);
    const [selectedSeverities, setSelectedSeverities] = useState<AlarmSeverity[]>([]);
    const [timeRange, setTimeRange] = useState<TimeRange>({
        type: "ALL_TIME",
    });

    const fetchAlarms = useCallback(async () => {
        try {
            setLoading(true);
            const data = await TenantService.getTenantAlarms(
                tenantId,
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
    }, [tenantId, selectedStatuses, selectedSeverities, timeRange]);

    useEffect(() => {
        fetchAlarms();
    }, [fetchAlarms]);

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
                                {new Date(alarm.startTs).toLocaleString("en-US")}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function EventsTabContent({ tenantId }: { tenantId: string }) {
    const [events, setEvents] = useState<EventInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [eventType, setEventType] = useState<EventType>('LC_EVENT');
    const [timeRange, setTimeRange] = useState<TimeRange>({
        type: "ALL_TIME",
    });

    const fetchEvents = useCallback(async () => {
        try {
            setLoading(true);
            const data = await TenantService.getTenantEvents(
                tenantId,
                0,
                50,
                eventType,
                timeRange.startTime,
                timeRange.endTime
            );
            setEvents(data.data || []);
            setError(null);
        } catch (err) {
            setError("Failed to fetch events");
        } finally {
            setLoading(false);
        }
    }, [tenantId, eventType, timeRange]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    if (loading) {
        return (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                Loading events...
            </div>
        );
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">{error}</div>;
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-700/50">
                <EventFilters
                    selectedType={eventType}
                    onTypeChange={setEventType}
                />
                <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
            </div>

            {events.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    No events
                </div>
            ) : (
                <div className="space-y-3">
                    {events.map((event) => (
                        <div
                            key={event.id.id}
                            className="p-3 rounded-lg border border-slate-200 dark:border-slate-700"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-slate-900 dark:text-white">
                                    {event.type}
                                </span>
                            </div>
                            <div className="text-xs text-slate-400">
                                {new Date(event.createdTime).toLocaleString("en-US")}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function RelationsTabContent({ tenant }: { tenant: Tenant }) {
    const [relations, setRelations] = useState<EntityRelation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [direction, setDirection] = useState<'FROM' | 'TO'>('FROM');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const fetchRelations = useCallback(async () => {
        if (!tenant?.id?.id) return;
        try {
            setLoading(true);
            const data = await TenantService.getTenantRelations(tenant.id.id, direction);
            setRelations(data || []);
            setError(null);
        } catch (err) {
            setError("Failed to fetch relations");
        } finally {
            setLoading(false);
        }
    }, [tenant?.id?.id, direction]);

    useEffect(() => {
        fetchRelations();
    }, [fetchRelations]);

    return (
        <div className="space-y-4">
            {/* Header with Filters and Add button */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700/50">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Relations ({relations.length})
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Direction:</span>
                        <Select
                            value={direction}
                            onValueChange={(val) => setDirection(val as 'FROM' | 'TO')}
                            options={[
                                { value: "FROM", label: "From" },
                                { value: "TO", label: "To" },
                            ]}
                            className="w-[100px]"
                        />
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setIsAddDialogOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add
                </button>
            </div>

            {loading ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    Loading relations...
                </div>
            ) : error ? (
                <div className="text-center py-8 text-red-500">{error}</div>
            ) : relations.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    No relations found
                </div>
            ) : (
                <div className="space-y-3">
                    {relations.map((relation, index) => (
                        <div
                            key={`${relation.from.id}-${relation.to.id}-${index}`}
                            className="p-3 rounded-lg border border-slate-200 dark:border-slate-700"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Link2 className="w-4 h-4 text-cyan-500" />
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            {relation.type}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="flex flex-col gap-1 min-w-[150px]">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-slate-400 uppercase tracking-tighter font-semibold">Type</span>
                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal text-slate-500">
                                                    {relation.from.entityType}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-slate-400 uppercase tracking-tighter font-semibold">Name</span>
                                                <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[150px]" title={relation.fromName}>
                                                    {relation.from.id === tenant.id.id ? (tenant.title || tenant.name) : (relation.fromName || relation.from.id)}
                                                </span>
                                            </div>
                                        </div>

                                        <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />

                                        <div className="flex flex-col gap-1 min-w-[150px]">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-slate-400 uppercase tracking-tighter font-semibold">Type</span>
                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal text-slate-500">
                                                    {relation.to.entityType}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-slate-400 uppercase tracking-tighter font-semibold">Name</span>
                                                <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[150px]" title={relation.toName}>
                                                    {relation.to.id === tenant.id.id ? (tenant.title || tenant.name) : (relation.toName || relation.to.id)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (!confirm("Are you sure you want to delete this relation?")) return;
                                        try {
                                            if (!tenant?.id?.id) return;
                                            await TenantService.deleteRelation(tenant.id.id, {
                                                fromId: relation.from.id,
                                                fromType: relation.from.entityType,
                                                relationType: relation.type,
                                                toId: relation.to.id,
                                                toType: relation.to.entityType,
                                            });
                                            toast.success("Relation deleted");
                                            fetchRelations();
                                        } catch (error) {
                                            toast.error("Failed to delete relation");
                                        }
                                    }}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AddRelationDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                sourceEntityId={tenant.id.id}
                sourceEntityType="TENANT"
                onSuccess={fetchRelations}
            />
        </div>
    );
}

function MedplumTabContent({ tenantId }: { tenantId: string }) {
    const [medplumEnabled, setMedplumEnabled] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const fetchStatus = useCallback(async () => {
        try {
            setLoading(true);
            const status = await TenantService.getTenantConnectionStatus(tenantId);
            setMedplumEnabled(status.medplum === true);
            setError(null);
        } catch {
            setError("Failed to fetch Medplum status");
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    const handleToggle = (checked: boolean) => {
        if (checked && !medplumEnabled) {
            setShowConfirm(true);
            setFormError(null);
        }
    };

    const handleConfirm = async () => {
        try {
            setProcessing(true);
            setFormError(null);
            await TenantService.createMedplumTenant({ tenantId });
            toast.success("Medplum integration enabled successfully");
            setMedplumEnabled(true);
            setShowConfirm(false);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to enable Medplum integration";
            toast.error(msg);
            setFormError(msg);
        } finally {
            setProcessing(false);
        }
    };

    const handleCancel = () => {
        setShowConfirm(false);
        setFormError(null);
    };

    if (loading) {
        return (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                Loading Medplum status...
            </div>
        );
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">{error}</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <div className="space-y-0.5">
                    <label className="text-sm font-medium text-slate-900 dark:text-white">
                        Medplum Integration
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {medplumEnabled
                            ? "Medplum integration is active for this tenant."
                            : "Enable Medplum integration for this tenant."}
                    </p>
                </div>
                <Switch
                    checked={medplumEnabled === true || showConfirm}
                    onCheckedChange={handleToggle}
                    disabled={medplumEnabled === true || processing}
                />
            </div>

            {showConfirm && (
                <div className="p-4 rounded-lg border border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20 space-y-3">
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                        ⚠ This action is irreversible
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                        Clicking <strong>Accept</strong> will create a Medplum project for this tenant.
                        This action cannot be undone. An admin password will be generated automatically.
                    </p>
                    {formError && <p className="text-xs text-red-500">{formError}</p>}
                    <div className="flex gap-2 pt-1">
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={processing}
                            className="flex-1 rounded bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm py-1.5 font-medium transition-colors"
                        >
                            {processing ? "Enabling..." : "Accept"}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={processing}
                            className="flex-1 rounded border border-slate-300 dark:border-slate-600 text-sm py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}


interface EditFormState {
    title: string;
    country: string;
    state: string;
    city: string;
    address: string;
    address2: string;
    zip: string;
    phone: string;
    email: string;
    description: string;
}

export function TenantDetailPanel({
    tenant,
    isOpen,
    onClose,
    onTenantUpdated,
}: TenantDetailPanelProps) {
    // Form state
    const [formState, setFormState] = useState<EditFormState>({
        title: "",
        country: "",
        state: "",
        city: "",
        address: "",
        address2: "",
        zip: "",
        phone: "",
        email: "",
        description: "",
    });
    const [isSaving, setIsSaving] = useState(false);

    // Initialize form when tenant changes
    useEffect(() => {
        if (tenant) {
            setFormState({
                title: tenant.title || "",
                country: tenant.country || "",
                state: tenant.state || "",
                city: tenant.city || "",
                address: tenant.address || "",
                address2: tenant.address2 || "",
                zip: tenant.zip || "",
                phone: tenant.phone || "",
                email: tenant.email || "",
                description: tenant.additionalInfo?.description || "",
            });
        }
    }, [tenant]);

    const [activeTab, setActiveTab] = useState("details");

    // Check if form has changes
    const hasChanges = useMemo(() => {
        if (!tenant) return false;
        return (
            formState.title !== (tenant.title || "") ||
            formState.country !== (tenant.country || "") ||
            formState.state !== (tenant.state || "") ||
            formState.city !== (tenant.city || "") ||
            formState.address !== (tenant.address || "") ||
            formState.address2 !== (tenant.address2 || "") ||
            formState.zip !== (tenant.zip || "") ||
            formState.phone !== (tenant.phone || "") ||
            formState.email !== (tenant.email || "") ||
            formState.description !== (tenant.additionalInfo?.description || "")
        );
    }, [formState, tenant]);

    const updateField = (field: keyof EditFormState) => (value: string) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!tenant || !hasChanges) return;

        setIsSaving(true);
        try {
            const updateData: UpdateTenantRequest = {
                title: formState.title,
                country: formState.country || undefined,
                state: formState.state || undefined,
                city: formState.city || undefined,
                address: formState.address || undefined,
                address2: formState.address2 || undefined,
                zip: formState.zip || undefined,
                phone: formState.phone || undefined,
                email: formState.email || undefined,
                additionalInfo: {
                    ...tenant.additionalInfo,
                    description: formState.description || undefined,
                },
            };

            const updatedTenant = await TenantService.updateTenant(tenant.id.id, updateData);
            toast.success("Tenant updated successfully");
            onTenantUpdated?.(updatedTenant);
        } catch (error) {
            toast.error("Failed to update tenant");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (!tenant) return;
        setFormState({
            title: tenant.title || "",
            country: tenant.country || "",
            state: tenant.state || "",
            city: tenant.city || "",
            address: tenant.address || "",
            address2: tenant.address2 || "",
            zip: tenant.zip || "",
            phone: tenant.phone || "",
            email: tenant.email || "",
            description: tenant.additionalInfo?.description || "",
        });
    };

    const handleCopyId = () => {
        if (!tenant) return;
        navigator.clipboard.writeText(tenant.id.id);
        toast.success("Tenant ID copied to clipboard");
    };

    if (!tenant) return null;

    const tabs = [
        {
            id: "details",
            label: "Details",
            content: (
                <div className="space-y-0">
                    {/* Copy ID Button */}
                    <div className="pb-4 border-b border-slate-200 dark:border-slate-700/50">
                        <button
                            type="button"
                            onClick={handleCopyId}
                            className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                        >
                            <Copy className="w-4 h-4" />
                            Copy tenant ID
                        </button>
                    </div>

                    {/* Editable Fields */}
                    <EditableField
                        label="Title"
                        value={formState.title}
                        onChange={updateField("title")}
                    />

                    <EditableTextarea
                        label="Description"
                        value={formState.description}
                        onChange={updateField("description")}
                    />

                    <DetailPanelSection title="Location">
                        <div className="space-y-0">
                            <EditableField
                                label="Country"
                                value={formState.country}
                                onChange={updateField("country")}
                            />
                            <div className="grid grid-cols-3 gap-4">
                                <EditableField
                                    label="City"
                                    value={formState.city}
                                    onChange={updateField("city")}
                                />
                                <EditableField
                                    label="State/Province"
                                    value={formState.state}
                                    onChange={updateField("state")}
                                />
                                <EditableField
                                    label="Zip code"
                                    value={formState.zip}
                                    onChange={updateField("zip")}
                                />
                            </div>
                            <EditableField
                                label="Address"
                                value={formState.address}
                                onChange={updateField("address")}
                            />
                            <EditableField
                                label="Address 2"
                                value={formState.address2}
                                onChange={updateField("address2")}
                            />
                        </div>
                    </DetailPanelSection>

                    <DetailPanelSection title="Contact">
                        <EditableField
                            label="Phone"
                            value={formState.phone}
                            onChange={updateField("phone")}
                            type="tel"
                        />
                        <EditableField
                            label="E-mail"
                            value={formState.email}
                            onChange={updateField("email")}
                            type="email"
                        />
                    </DetailPanelSection>
                </div>
            ),
        },
        {
            id: "medplum",
            label: "Medplum",
            content: <MedplumTabContent tenantId={tenant.id.id} />,
        },
        {
            id: "attributes",
            label: "Attributes",
            content: <AttributesTabContent tenantId={tenant.id.id} />,
        },
        {
            id: "alarms",
            label: "Alarms",
            content: <AlarmsTabContent tenantId={tenant.id.id} />,
        },
        {
            id: "events",
            label: "Events",
            content: <EventsTabContent tenantId={tenant.id.id} />,
        },
        {
            id: "relations",
            label: "Relations",
            content: <RelationsTabContent tenant={tenant} />,
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
        <EntityDetailPanel
            isOpen={isOpen}
            onClose={onClose}
            title={tenant.title}
            subtitle="Tenant data"
            tabs={tabs}
            actionButtons={actionButtons}
            defaultTab="details"
            onTabChange={setActiveTab}
        />
    );
}
