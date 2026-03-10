"use client";

import { useCallback, useState } from "react";
import { useRepoSettingsInfo, useManageRepoSettings } from "@/hooks/thingsboard/version-control/useVersionControl";
import { RepositorySettingsForm } from "@/components/organisms/RepositorySettingsForm";
import { VersionsTable } from "@/components/organisms/VersionsTable";
import { RepoSettings } from "@/types/versionControlTypes";
import { toast } from "sonner";

export default function VersionControlPage() {
    const [branch, setBranch] = useState("main");
    const { settingsInfo, isConfigured, isLoading, mutate } = useRepoSettingsInfo();
    const { isChecking, isSaving, isDeleting, checkAccess, saveSettings, deleteSettings } = useManageRepoSettings();

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
            // Refresh the settings info to transition to the versions view
            await mutate();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to save repository settings";
            toast.error(errorMessage);
        }
    }, [saveSettings, mutate]);

    const handleUnlink = useCallback(async () => {
        if (confirm("Are you sure you want to unlink the repository? This will remove all version control settings.")) {
            try {
                await deleteSettings();
                toast.success("Repository unlinked successfully");
                await mutate();
            } catch (error: any) {
                toast.error("Failed to unlink repository");
            }
        }
    }, [deleteSettings, mutate]);

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground dark:text-slate-400">Loading version control settings...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            {isConfigured ? (
                <VersionsTable
                    branch={branch}
                    onBranchChange={setBranch}
                    onUnlink={handleUnlink}
                    isReadOnly={settingsInfo?.readOnly === true}
                />
            ) : (
                <RepositorySettingsForm
                    onCheckAccess={handleCheckAccess}
                    onSave={handleSave}
                    isChecking={isChecking}
                    isSaving={isSaving}
                />
            )}
        </div>
    );
}
