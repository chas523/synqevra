"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { DeviceService } from "@/lib/services/thingsboardServices/deviceService";
import { CopyButton } from "@/components/molecules/CopyButton";
import type { DeviceDetails } from "@/types/thingsboardDeviceTypes";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeviceDetailsTabContentProps {
    deviceId: string;
}

interface DeviceDetailsFormState {
    name: string;
    label: string;
    description: string;
    deviceProfileId: string;
    firmwareId: string;
    softwareId: string;
    isGateway: boolean;
    overwriteActivityTime: boolean;
}

function toFormState(device: DeviceDetails): DeviceDetailsFormState {
    return {
        name: device.name || "",
        label: device.label || "",
        description: device.additionalInfo?.description || "",
        deviceProfileId: device.deviceProfileId?.id || "",
        firmwareId: device.firmwareId?.id || "",
        softwareId: device.softwareId?.id || "",
        isGateway: Boolean(device.additionalInfo?.gateway),
        overwriteActivityTime: Boolean(device.additionalInfo?.overwriteActivityTime),
    };
}

export function DeviceDetailsTabContent({ deviceId }: DeviceDetailsTabContentProps) {
    const {
        data: device,
        isLoading,
        mutate,
    } = useSWR(
        deviceId ? ["deviceDetails", deviceId] : null,
        async () => {
            return DeviceService.fetchDevice(deviceId);
        }
    );

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState<DeviceDetailsFormState | null>(null);
    const [originalForm, setOriginalForm] = useState<DeviceDetailsFormState | null>(null);

    useEffect(() => {
        if (!device) {
            return;
        }

        const nextForm = toFormState(device);
        setForm(nextForm);
        setOriginalForm(nextForm);
        setIsEditing(false);
    }, [device]);

    const selectedDeviceProfileId = form?.deviceProfileId ?? "";

    const { data: profileInfosResponse } = useSWR(
        device ? ["deviceProfileInfosForDeviceDetails"] : null,
        async () => DeviceService.getDeviceProfileInfos(0, 100)
    );

    const { data: firmwarePackagesResponse } = useSWR(
        selectedDeviceProfileId
            ? ["deviceFirmwarePackages", selectedDeviceProfileId]
            : null,
        async () =>
            DeviceService.getOtaPackages("FIRMWARE", selectedDeviceProfileId, 0, 100)
    );

    const { data: softwarePackagesResponse } = useSWR(
        selectedDeviceProfileId
            ? ["deviceSoftwarePackages", selectedDeviceProfileId]
            : null,
        async () =>
            DeviceService.getOtaPackages("SOFTWARE", selectedDeviceProfileId, 0, 100)
    );

    const profileInfos = profileInfosResponse?.data ?? [];
    const firmwarePackages = firmwarePackagesResponse?.data ?? [];
    const softwarePackages = softwarePackagesResponse?.data ?? [];

    const hasChanges = useMemo(() => {
        if (!form || !originalForm) {
            return false;
        }

        return JSON.stringify(form) !== JSON.stringify(originalForm);
    }, [form, originalForm]);

    const getPackageLabel = (
        packageId: string,
        packages: Array<{ id: { id: string }; title?: string; version?: string }>
    ) => {
        if (!packageId) {
            return "-";
        }

        const match = packages.find((item) => item.id?.id === packageId);

        if (!match) {
            return packageId;
        }

        if (match.version) {
            return `${match.title || "Unnamed"} (${match.version})`;
        }

        return match.title || "Unnamed";
    };

    const handleCancel = () => {
        if (!originalForm) {
            return;
        }

        setForm(originalForm);
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!device || !form) {
            return;
        }

        if (!form.name.trim()) {
            toast.error("Device name is required");
            return;
        }

        if (!form.deviceProfileId) {
            toast.error("Device profile is required");
            return;
        }

        setIsSaving(true);
        try {
            const payload: Partial<DeviceDetails> = {
                ...device,
                name: form.name.trim(),
                label: form.label.trim() || null,
                deviceProfileId: {
                    entityType: "DEVICE_PROFILE",
                    id: form.deviceProfileId,
                },
                firmwareId: form.firmwareId
                    ? {
                        entityType: "OTA_PACKAGE",
                        id: form.firmwareId,
                    }
                    : null,
                softwareId: form.softwareId
                    ? {
                        entityType: "OTA_PACKAGE",
                        id: form.softwareId,
                    }
                    : null,
                additionalInfo: {
                    ...(device.additionalInfo || {
                        gateway: false,
                        overwriteActivityTime: false,
                        description: "",
                    }),
                    gateway: form.isGateway,
                    overwriteActivityTime: form.isGateway
                        ? form.overwriteActivityTime
                        : false,
                    description: form.description.trim(),
                },
            };

            const savedDevice = await DeviceService.updateDevice(deviceId, payload);
            const nextForm = toFormState(savedDevice);

            await mutate(savedDevice, false);
            setForm(nextForm);
            setOriginalForm(nextForm);
            setIsEditing(false);
            toast.success("Device details updated successfully");
        } catch (error) {
            toast.error("Failed to update device details");
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

    if (!device) {
        return <div className="p-4 text-center text-slate-500">Device details not found.</div>;
    }

    if (!form) {
        return <div className="p-4 text-center text-slate-500">Preparing device details...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-end gap-2">
                {!isEditing ? (
                    <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="px-3 py-1.5 text-sm font-medium rounded-md border border-slate-300 hover:bg-slate-50"
                    >
                        Edit
                    </button>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-3 py-1.5 text-sm font-medium rounded-md border border-slate-300 hover:bg-slate-50"
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-3 py-1.5 text-sm font-medium rounded-md bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-60"
                            disabled={isSaving || !hasChanges}
                        >
                            {isSaving ? "Saving..." : "Save"}
                        </button>
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">General Info</h3>

                    <div className="space-y-1">
                        <label className="text-xs text-slate-500 font-medium ml-1">Device Name</label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(event) =>
                                            setForm((prev) =>
                                                prev
                                                    ? { ...prev, name: event.target.value }
                                                    : prev
                                            )
                                        }
                                        className="w-full bg-transparent outline-none"
                                    />
                                ) : (
                                    device.name
                                )}
                            </div>
                            <CopyButton value={device.name} size="icon" variant="ghost" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-slate-500 font-medium ml-1">Device ID</label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-600">
                                {device.id?.id}
                            </div>
                            <CopyButton value={device.id?.id ?? ""} size="icon" variant="ghost" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-slate-500 font-medium ml-1">Label</label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={form.label}
                                        onChange={(event) =>
                                            setForm((prev) =>
                                                prev
                                                    ? { ...prev, label: event.target.value }
                                                    : prev
                                            )
                                        }
                                        placeholder="Optional label"
                                        className="w-full bg-transparent outline-none"
                                    />
                                ) : (
                                    device.label || "-"
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-slate-500 font-medium ml-1">Description</label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm">
                                {isEditing ? (
                                    <textarea
                                        value={form.description}
                                        onChange={(event) =>
                                            setForm((prev) =>
                                                prev
                                                    ? {
                                                        ...prev,
                                                        description: event.target.value,
                                                    }
                                                    : prev
                                            )
                                        }
                                        rows={3}
                                        placeholder="Optional description"
                                        className="w-full bg-transparent outline-none resize-none"
                                    />
                                ) : (
                                    device.additionalInfo?.description || "-"
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">Profile</h3>

                    <div className="space-y-1">
                        <label className="text-xs text-slate-500 font-medium ml-1">Device Profile</label>
                        <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm">
                            {isEditing ? (
                                <select
                                    value={form.deviceProfileId}
                                    onChange={(event) =>
                                        setForm((prev) =>
                                            prev
                                                ? {
                                                    ...prev,
                                                    deviceProfileId: event.target.value,
                                                }
                                                : prev
                                        )
                                    }
                                    className="w-full bg-transparent outline-none"
                                >
                                    {profileInfos.map((profile) => (
                                        <option key={profile.id.id} value={profile.id.id}>
                                            {profile.name}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                device.deviceProfileName || "-"
                            )}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-slate-500 font-medium ml-1">Assigned Firmware</label>
                        <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm">
                            {isEditing ? (
                                <select
                                    value={form.firmwareId}
                                    onChange={(event) =>
                                        setForm((prev) =>
                                            prev
                                                ? {
                                                    ...prev,
                                                    firmwareId: event.target.value,
                                                }
                                                : prev
                                        )
                                    }
                                    className="w-full bg-transparent outline-none"
                                >
                                    <option value="">None</option>
                                    {firmwarePackages.map((item) => (
                                        <option key={item.id.id} value={item.id.id}>
                                            {item.version
                                                ? `${item.title || "Unnamed"} (${item.version})`
                                                : item.title || "Unnamed"}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                getPackageLabel(device.firmwareId?.id || "", firmwarePackages)
                            )}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-slate-500 font-medium ml-1">Assigned Software</label>
                        <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm">
                            {isEditing ? (
                                <select
                                    value={form.softwareId}
                                    onChange={(event) =>
                                        setForm((prev) =>
                                            prev
                                                ? {
                                                    ...prev,
                                                    softwareId: event.target.value,
                                                }
                                                : prev
                                        )
                                    }
                                    className="w-full bg-transparent outline-none"
                                >
                                    <option value="">None</option>
                                    {softwarePackages.map((item) => (
                                        <option key={item.id.id} value={item.id.id}>
                                            {item.version
                                                ? `${item.title || "Unnamed"} (${item.version})`
                                                : item.title || "Unnamed"}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                getPackageLabel(device.softwareId?.id || "", softwarePackages)
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500 font-medium ml-1">Created At</label>
                            <div className="text-sm text-slate-700 ml-1">
                                {device.createdTime ? new Date(device.createdTime).toLocaleString() : "-"}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-slate-500 font-medium ml-1">Is Gateway</label>
                            <div className="text-sm text-slate-700 ml-1">
                                {isEditing ? (
                                    <label className="inline-flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={form.isGateway}
                                            onChange={(event) =>
                                                setForm((prev) =>
                                                    prev
                                                        ? {
                                                            ...prev,
                                                            isGateway: event.target.checked,
                                                            overwriteActivityTime: event.target.checked
                                                                ? prev.overwriteActivityTime
                                                                : false,
                                                        }
                                                        : prev
                                                )
                                            }
                                        />
                                        <span>{form.isGateway ? "Yes" : "No"}</span>
                                    </label>
                                ) : (
                                    device.additionalInfo?.gateway ? "Yes" : "No"
                                )}
                            </div>
                        </div>
                    </div>

                    {(isEditing ? form.isGateway : device.additionalInfo?.gateway) && (
                        <div className="space-y-1 pt-2">
                            <label className="text-xs text-slate-500 font-medium ml-1">
                                Overwrite Activity Time
                            </label>
                            <div className="text-sm text-slate-700 ml-1">
                                {isEditing ? (
                                    <label className="inline-flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={form.overwriteActivityTime}
                                            onChange={(event) =>
                                                setForm((prev) =>
                                                    prev
                                                        ? {
                                                            ...prev,
                                                            overwriteActivityTime:
                                                                event.target.checked,
                                                        }
                                                        : prev
                                                )
                                            }
                                        />
                                        <span>
                                            {form.overwriteActivityTime ? "Enabled" : "Disabled"}
                                        </span>
                                    </label>
                                ) : (
                                    device.additionalInfo?.overwriteActivityTime
                                        ? "Enabled"
                                        : "Disabled"
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
