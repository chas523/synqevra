"use client";

import useSWR from "swr";
import { useState } from "react";
import { ResourceService } from "@/lib/services/thingsboardServices/resourceService";
import { Resource, ResourceCreateRequest, ResourcesPageResponse, ResourceType } from "@/types/resourceTypes";

export const useResources = (
    page: number = 0,
    pageSize: number = 10,
    sortProperty: string = 'createdTime',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
    resourceType?: ResourceType,
    resourceSubType?: string
) => {
    const key = ['resources', page, pageSize, sortProperty, sortOrder, resourceType, resourceSubType];
    const { data, error, isLoading, mutate } = useSWR<ResourcesPageResponse>(
        key,
        () => ResourceService.getResources(page, pageSize, sortProperty, sortOrder, resourceType, resourceSubType),
        {
            revalidateOnFocus: false,
        }
    );

    return {
        resources: data?.data ?? [],
        totalPages: data?.totalPages ?? 0,
        totalElements: data?.totalElements ?? 0,
        hasNext: data?.hasNext ?? false,
        isLoading,
        error,
        mutate,
    };
};

export const useManageResource = () => {
    const [isSaving, setIsSaving] = useState(false);

    const createResource = async (resource: ResourceCreateRequest) => {
        setIsSaving(true);
        try {
            const result = await ResourceService.createResource(resource);
            return result;
        } finally {
            setIsSaving(false);
        }
    };

    const deleteResource = async (resourceId: string, force: boolean = false) => {
        try {
            await ResourceService.deleteResource(resourceId, force);
        } catch (error) {
            throw error;
        }
    };

    const downloadResource = async (resourceId: string, fileName: string) => {
        try {
            const blob = await ResourceService.downloadResource(resourceId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            throw error;
        }
    };

    return {
        isSaving,
        createResource,
        deleteResource,
        downloadResource,
    };
};
