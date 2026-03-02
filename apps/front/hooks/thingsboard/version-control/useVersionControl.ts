"use client";

import useSWR from "swr";
import { useState } from "react";
import { VersionControlService } from "@/lib/services/thingsboardServices/versionControlService";
import { RepoSettingsInfo, RepoSettings, VersionsPageResponse, BranchInfo } from "@/types/versionControlTypes";

export const useRepoSettingsInfo = () => {
    const { data, error, isLoading, mutate } = useSWR<RepoSettingsInfo>(
        'repoSettingsInfo',
        () => VersionControlService.getRepoSettingsInfo(),
        {
            revalidateOnFocus: false,
        }
    );

    return {
        settingsInfo: data,
        isConfigured: data?.configured ?? false,
        readOnly: data?.readOnly ?? null,
        isLoading,
        error,
        mutate,
    };
};

export const useRepoSettings = (enabled: boolean = true) => {
    const { data, error, isLoading, mutate } = useSWR<RepoSettings>(
        enabled ? 'repoSettings' : null,
        () => VersionControlService.getRepoSettings(),
        {
            revalidateOnFocus: false,
        }
    );

    return {
        settings: data ?? null,
        isLoading,
        error,
        mutate,
    };
};

export const useBranches = (enabled: boolean = true) => {
    const { data, error, isLoading, mutate } = useSWR<BranchInfo[]>(
        enabled ? 'repoBranches' : null,
        () => VersionControlService.getBranches(),
        {
            revalidateOnFocus: false,
        }
    );

    return {
        branches: data ?? [],
        isLoading,
        error,
        mutate,
    };
};

export const useVersions = (
    page: number = 0,
    pageSize: number = 10,
    sortProperty: string = 'timestamp',
    sortOrder: string = 'DESC',
    branch: string = 'main',
    enabled: boolean = true,
) => {
    const key = enabled ? ['versions', page, pageSize, sortProperty, sortOrder, branch] : null;
    const { data, error, isLoading, mutate } = useSWR<VersionsPageResponse>(
        key,
        () => VersionControlService.getVersions(page, pageSize, sortProperty, sortOrder, branch),
        {
            revalidateOnFocus: false,
        }
    );

    return {
        versions: data?.data ?? [],
        totalPages: data?.totalPages ?? 0,
        totalElements: data?.totalElements ?? 0,
        hasNext: data?.hasNext ?? false,
        isLoading,
        error,
        mutate,
    };
};

export const useEntityVersions = (
    entityType: string,
    id: string,
    page: number = 0,
    pageSize: number = 10,
    sortProperty: string = 'timestamp',
    sortOrder: string = 'DESC',
    branch: string = 'main',
    enabled: boolean = true,
) => {
    const key = (enabled && entityType && id) ? ['entityVersions', entityType, id, page, pageSize, sortProperty, sortOrder, branch] : null;
    const { data, error, isLoading, mutate } = useSWR<VersionsPageResponse>(
        key,
        () => VersionControlService.getEntityVersions(entityType, id, page, pageSize, sortProperty, sortOrder, branch),
        {
            revalidateOnFocus: false,
        }
    );

    return {
        versions: data?.data ?? [],
        totalPages: data?.totalPages ?? 0,
        totalElements: data?.totalElements ?? 0,
        hasNext: data?.hasNext ?? false,
        isLoading,
        error,
        mutate,
    };
};

export const useManageRepoSettings = () => {
    const [isChecking, setIsChecking] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const checkAccess = async (payload: RepoSettings) => {
        setIsChecking(true);
        try {
            const result = await VersionControlService.checkRepoAccess(payload);
            return result;
        } finally {
            setIsChecking(false);
        }
    };

    const saveSettings = async (payload: RepoSettings) => {
        setIsSaving(true);
        try {
            const result = await VersionControlService.saveRepoSettings(payload);
            return result;
        } finally {
            setIsSaving(false);
        }
    };

    const deleteSettings = async () => {
        setIsDeleting(true);
        try {
            const result = await VersionControlService.deleteRepoSettings();
            return result;
        } finally {
            setIsDeleting(false);
        }
    };

    return {
        isChecking,
        isSaving,
        isDeleting,
        checkAccess,
        saveSettings,
        deleteSettings,
    };
};
