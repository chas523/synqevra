"use client";

import { useEffect, useState, useCallback } from "react";
import { EntityDetailPanel, TabConfig, ActionButton } from "@/components/templates/EntityDetailPanel";
import { OtaPackage } from "@/types/otaPackageTypes";
import { OtaPackageService } from "@/lib/services/thingsboardServices/otaPackageService";
import { useRepoSettingsInfo, useManageRepoSettings } from "@/hooks/thingsboard/version-control/useVersionControl";
import { RepositorySettingsForm } from "@/components/organisms/RepositorySettingsForm";
import { VersionsTable } from "@/components/organisms/VersionsTable";
import { RepoSettings } from "@/types/versionControlTypes";
import { Download, Trash2, Copy, ClipboardCopy } from "lucide-react";
import { toast } from "sonner";

interface DeviceProfileInfo {
    id: { entityType: string; id: string };
    name: string;
}

interface OtaPackageDetailPanelProps {
    isOpen: boolean;
    onClose: () => void;
    otaPackage: OtaPackage | null;
    onDownload: (pkg: OtaPackage) => void;
    onDelete: (pkg: OtaPackage) => void;
}

function formatFileSize(bytes: number | null): string {
    if (bytes === null || bytes === undefined) return "-";
    return bytes.toString();
}

export const OtaPackageDetailPanel = ({
    isOpen,
    onClose,
    otaPackage,
    onDownload,
    onDelete,
}: OtaPackageDetailPanelProps) => {
    const [deviceProfileName, setDeviceProfileName] = useState<string>("-");
    const [branch, setBranch] = useState("main");
    const { settingsInfo, isConfigured, isLoading: isLoadingVc, mutate: mutateVc } = useRepoSettingsInfo();
    const { isChecking, isSaving, checkAccess, saveSettings } = useManageRepoSettings();

    const handleCheckAccess = useCallback(async (payload: RepoSettings) => {
        try {
            await checkAccess(payload);
            toast.success("Repository access verified successfully");
        } catch (error: any) {
            toast.error("Verification failed. Please check the data and try again.");
        }
    }, [checkAccess]);

    const handleSave = useCallback(async (payload: RepoSettings) => {
        try {
            await saveSettings(payload);
            toast.success("Repository settings saved successfully");
            await mutateVc();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to save repository settings";
            toast.error(errorMessage);
        }
    }, [saveSettings, mutateVc]);

    useEffect(() => {
        if (otaPackage?.deviceProfileId?.id && isOpen) {
            OtaPackageService.getDeviceProfileInfos()
                .then((response) => {
                    const profiles: DeviceProfileInfo[] = response.data || [];
                    const match = profiles.find(
                        (p) => p.id.id === otaPackage.deviceProfileId.id
                    );
                    setDeviceProfileName(match?.name || otaPackage.deviceProfileId.id);
                })
                .catch(() => {
                    setDeviceProfileName(otaPackage.deviceProfileId.id);
                });
        }
    }, [otaPackage, isOpen]);

    if (!otaPackage) return null;

    const handleCopyId = () => {
        if (otaPackage.id?.id) {
            navigator.clipboard.writeText(otaPackage.id.id);
            toast.success("Package ID copied to clipboard");
        }
    };

    const handleCopyChecksum = () => {
        if (otaPackage.checksum) {
            navigator.clipboard.writeText(otaPackage.checksum);
            toast.success("Checksum copied to clipboard");
        }
    };

    const handleDownload = () => {
        onDownload(otaPackage);
    };

    const handleDelete = () => {
        onDelete(otaPackage);
        onClose();
    };

    const actionButtons: ActionButton[] = [
        ...(otaPackage.hasData
            ? [
                {
                    label: "Download package",
                    onClick: handleDownload,
                    variant: "primary" as const,
                    icon: <Download className="h-4 w-4" />,
                },
            ]
            : []),
        {
            label: "Delete package",
            onClick: handleDelete,
            variant: "danger" as const,
            icon: <Trash2 className="h-4 w-4" />,
        },
        {
            label: "Copy package Id",
            onClick: handleCopyId,
            variant: "secondary" as const,
            icon: <Copy className="h-4 w-4" />,
        },
        ...(otaPackage.checksum
            ? [
                {
                    label: "Copy checksum",
                    onClick: handleCopyChecksum,
                    variant: "secondary" as const,
                    icon: <ClipboardCopy className="h-4 w-4" />,
                },
            ]
            : []),
    ];

    const detailsContent = (
        <div className="space-y-6">
            {/* Title + Version row */}
            <div className="grid grid-cols-2 gap-4 border-b border-slate-200 dark:border-slate-700/50 pb-4">
                <div>
                    <label className="text-xs text-muted-foreground dark:text-slate-400">Title*</label>
                    <p className="text-sm font-medium mt-1 dark:text-white">{otaPackage.title}</p>
                </div>
                <div>
                    <label className="text-xs text-muted-foreground dark:text-slate-400">Version*</label>
                    <p className="text-sm font-medium mt-1 dark:text-white">{otaPackage.version}</p>
                </div>
            </div>

            {/* Version tag */}
            <div className="border-b border-slate-200 dark:border-slate-700/50 pb-4">
                <label className="text-xs text-muted-foreground italic dark:text-slate-400">Version tag</label>
                <p className="text-sm font-medium mt-1 dark:text-white">{otaPackage.tag || "-"}</p>
            </div>

            {/* Device profile */}
            <div className="border-b border-slate-200 dark:border-slate-700/50 pb-4">
                <label className="text-xs text-muted-foreground dark:text-slate-400">Device profile*</label>
                <p className="text-sm font-medium mt-1 text-primary dark:text-blue-400">{deviceProfileName}</p>
            </div>

            {/* Package type */}
            <div className="border-b border-slate-200 dark:border-slate-700/50 pb-4">
                <label className="text-xs text-muted-foreground dark:text-slate-400">Package type*</label>
                <p className="text-sm font-medium mt-1 dark:text-white">
                    {otaPackage.type === "FIRMWARE" ? "Firmware" : "Software"}
                </p>
            </div>

            {/* Checksum row */}
            {(otaPackage.checksumAlgorithm || otaPackage.checksum) && (
                <div className="grid grid-cols-2 gap-4 border-b border-slate-200 dark:border-slate-700/50 pb-4">
                    <div>
                        <label className="text-xs text-muted-foreground dark:text-slate-400">Checksum algorithm</label>
                        <p className="text-sm font-medium mt-1 dark:text-white">{otaPackage.checksumAlgorithm || "-"}</p>
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground dark:text-slate-400">Checksum</label>
                        <p className="text-sm font-medium mt-1 dark:text-white break-all">{otaPackage.checksum || "-"}</p>
                    </div>
                </div>
            )}

            {/* File info row */}
            {(otaPackage.fileName || otaPackage.dataSize !== null) && (
                <div className="grid grid-cols-3 gap-4 border-b border-slate-200 dark:border-slate-700/50 pb-4">
                    <div>
                        <label className="text-xs text-muted-foreground dark:text-slate-400">File name</label>
                        <p className="text-sm font-medium mt-1 dark:text-white">{otaPackage.fileName || "-"}</p>
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground dark:text-slate-400">File size in bytes</label>
                        <p className="text-sm font-medium mt-1 dark:text-white">{formatFileSize(otaPackage.dataSize)}</p>
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground dark:text-slate-400">Content type</label>
                        <p className="text-sm font-medium mt-1 dark:text-white">{otaPackage.contentType || "-"}</p>
                    </div>
                </div>
            )}

            {/* URL */}
            {otaPackage.url && (
                <div className="border-b border-slate-200 dark:border-slate-700/50 pb-4">
                    <label className="text-xs text-muted-foreground dark:text-slate-400">Direct URL</label>
                    <p className="text-sm font-medium mt-1 text-primary dark:text-blue-400 break-all">{otaPackage.url}</p>
                </div>
            )}

            {/* Description */}
            <div className="pb-4">
                <label className="text-xs text-muted-foreground dark:text-slate-400">Description</label>
                <p className="text-sm font-medium mt-1 dark:text-white">
                    {otaPackage.additionalInfo?.description || "-"}
                </p>
            </div>
        </div>
    );

    const versionControlContent = (
        <div className="h-full overflow-y-auto pr-2">
            {isLoadingVc ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground dark:text-slate-400">
                    <p className="text-sm">Loading version control settings...</p>
                </div>
            ) : isConfigured ? (
                <VersionsTable
                    branch={branch}
                    onBranchChange={setBranch}
                    entityType="OTA_PACKAGE"
                    entityId={otaPackage.id.id}
                    isReadOnly={settingsInfo?.readOnly === true}
                />
            ) : (
                <div className="p-4">
                    <RepositorySettingsForm
                        onCheckAccess={handleCheckAccess}
                        onSave={handleSave}
                        isChecking={isChecking}
                        isSaving={isSaving}
                    />
                </div>
            )}
        </div>
    );

    const tabs: TabConfig[] = [
        {
            id: "details",
            label: "Details",
            content: detailsContent,
        },
        {
            id: "version-control",
            label: "Version control",
            content: versionControlContent,
        },
    ];

    return (
        <EntityDetailPanel
            isOpen={isOpen}
            onClose={onClose}
            title={otaPackage.title}
            subtitle="OTA update details"
            tabs={tabs}
            actionButtons={actionButtons}
        />
    );
};

export default OtaPackageDetailPanel;
