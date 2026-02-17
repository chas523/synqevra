"use client";

import { useState, useCallback } from "react";
import { WidgetTypesTable } from "@/components/organisms/WidgetTypesTable";
import { SelectWidgetTypeDialog } from "@/components/organisms/SelectWidgetTypeDialog";
import { ImportWidgetDialog } from "@/components/organisms/ImportWidgetDialog";
import { AddWidgetMenu } from "@/components/organisms/AddWidgetMenu";
import { useWidgetTypes, useManageWidgetType } from "@/hooks/thingsboard/widgets/useWidgetTypes";
import { WidgetType, CreateWidgetTypeRequest } from "@/types/widgetTypes";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const PAGE_SIZE = 10;

export const WidgetTypesPage = () => {
    const router = useRouter();

    // Widget Types State
    const [currentPage, setCurrentPage] = useState(0);
    const [deprecatedFilter, setDeprecatedFilter] = useState("ALL");
    const [sortProperty, setSortProperty] = useState("createdTime");
    const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
    const [showSelectTypeDialog, setShowSelectTypeDialog] = useState(false);
    const [showImportDialog, setShowImportDialog] = useState(false);

    const { widgetTypes, totalPages, totalElements, isLoading, mutate } = useWidgetTypes(
        currentPage,
        PAGE_SIZE,
        sortProperty,
        sortOrder,
        false, // tenantOnly
        false, // fullSearch
        false, // scadaFirst
        deprecatedFilter
    );

    const { isCreating, createWidgetType, deleteWidgetType } = useManageWidgetType();

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handleDeprecatedFilterChange = useCallback((filter: string) => {
        setDeprecatedFilter(filter);
        setCurrentPage(0);
    }, []);

    const handleSortChange = useCallback((property: string, order: "ASC" | "DESC") => {
        setSortProperty(property);
        setSortOrder(order);
        setCurrentPage(0);
    }, []);

    const handleRefresh = useCallback(() => {
        mutate();
    }, [mutate]);


    const handleDelete = useCallback(async (widgetType: WidgetType) => {
        try {
            await deleteWidgetType(widgetType.id.id);
            toast.success("Widget type deleted successfully");
            mutate();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete widget type";
            toast.error(errorMessage);
        }
    }, [deleteWidgetType, mutate]);

    const handleRowClick = useCallback((widgetType: WidgetType) => {
        router.push(`/resources/widgets-library/widget-types/${widgetType.id.id}`);
    }, [router]);

    return (
        <>
            <WidgetTypesTable
                widgetTypes={widgetTypes}
                isLoading={isLoading}
                currentPage={currentPage}
                totalPages={totalPages}
                totalElements={totalElements}
                pageSize={PAGE_SIZE}
                deprecatedFilter={deprecatedFilter}
                sortProperty={sortProperty}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                onPageChange={handlePageChange}
                onDeprecatedFilterChange={handleDeprecatedFilterChange}
                onRefresh={handleRefresh}
                onAdd={() => setShowSelectTypeDialog(true)}
                onRowClick={handleRowClick}
                onDelete={handleDelete}
                customAction={
                    <AddWidgetMenu
                        onCreate={() => setShowSelectTypeDialog(true)}
                        onImport={() => setShowImportDialog(true)}
                    />
                }
            />

            <SelectWidgetTypeDialog
                open={showSelectTypeDialog}
                onOpenChange={setShowSelectTypeDialog}
                onSelectType={async (type) => {
                    setShowSelectTypeDialog(false);
                    try {
                        const alias = `new_${type}_${Date.now()}`;
                        const request: CreateWidgetTypeRequest = {
                            name: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Widget`,
                            bundleAlias: "my_widgets",
                            alias: alias,
                            description: "",
                            descriptor: {
                                type: type,
                                sizeX: 1,
                                sizeY: 1,
                                resources: [],
                                templateHtml: "",
                                templateCss: "",
                                controllerScript: "",
                                settingsSchema: "",
                                dataKeySettingsSchema: ""
                            },
                        };

                        await createWidgetType(request);
                        toast.success("Widget type created successfully");
                        mutate();
                    } catch (error: any) {
                        console.error("Failed to create widget type", error);
                        const errorMessage = error?.response?.data?.message || error?.message || "Failed to create widget type";
                        toast.error(errorMessage);
                    }
                }}
            />

            <ImportWidgetDialog
                open={showImportDialog}
                onOpenChange={setShowImportDialog}
                onImportSuccess={() => {
                    mutate();
                }}
            />
        </>
    );
};
