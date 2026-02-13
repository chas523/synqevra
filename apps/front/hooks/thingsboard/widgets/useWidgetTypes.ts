"use client";

import useSWR from "swr";
import { useState } from "react";
import { WidgetService } from "@/lib/services/thingsboardServices/widgetService";
import { CreateWidgetTypeRequest, WidgetTypesPage, WidgetType } from "@/types/widgetTypes";

export const useWidgetTypes = (
    page: number = 0,
    pageSize: number = 10,
    sortProperty: string = 'createdTime',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
    tenantOnly: boolean = false,
    fullSearch: boolean = false,
    scadaFirst: boolean = false,
    deprecatedFilter: string = 'ALL'
) => {
    const { data, error, isLoading, mutate } = useSWR<WidgetTypesPage>(
        ['widgetTypes', page, pageSize, sortProperty, sortOrder, tenantOnly, fullSearch, scadaFirst, deprecatedFilter],
        () => WidgetService.getWidgetTypes(page, pageSize, sortProperty, sortOrder, tenantOnly, fullSearch, scadaFirst, deprecatedFilter),
        {
            revalidateOnFocus: false,
        }
    );

    return {
        widgetTypes: data?.data ?? [],
        totalPages: data?.totalPages ?? 0,
        totalElements: data?.totalElements ?? 0,
        hasNext: data?.hasNext ?? false,
        isLoading,
        error,
        mutate,
    };
};

export const useManageWidgetType = () => {
    const [isCreating, setIsCreating] = useState(false);

    const createWidgetType = async (request: CreateWidgetTypeRequest) => {
        setIsCreating(true);
        try {
            const result = await WidgetService.createWidgetType(request);
            return result;
        } finally {
            setIsCreating(false);
        }
    };

    const deleteWidgetType = async (widgetTypeId: string) => {
        try {
            await WidgetService.deleteWidgetType(widgetTypeId);
        } catch (error) {
            throw error;
        }
    };

    return {
        isCreating,
        createWidgetType,
        deleteWidgetType,
    };
};

export const useWidgetType = (widgetTypeId: string) => {
    const { data, error, isLoading, mutate } = useSWR<WidgetType>(
        widgetTypeId ? ['widgetType', widgetTypeId] : null,
        () => WidgetService.getWidgetTypeById(widgetTypeId),
        {
            revalidateOnFocus: false,
        }
    );

    return {
        widgetType: data,
        isLoading,
        error,
        mutate,
    };
};
