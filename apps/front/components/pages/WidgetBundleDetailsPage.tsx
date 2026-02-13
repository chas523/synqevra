"use client";

import { useParams, useRouter } from "next/navigation";
import { WidgetService } from "@/lib/services/thingsboardServices/widgetService";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BundleWidgetsTable } from "@/components/organisms/BundleWidgetsTable";
import useSWR from "swr";
import { AddWidgetMenu } from "@/components/organisms/AddWidgetMenu";
import { SelectWidgetTypeDialog } from "@/components/organisms/SelectWidgetTypeDialog";
import { ImportWidgetDialog } from "@/components/organisms/ImportWidgetDialog";
import { useManageWidgetType } from "@/hooks/thingsboard/widgets/useWidgetTypes";
import { CreateWidgetTypeRequest } from "@/types/widgetTypes";
import { toast } from "sonner";

import { useState, useCallback } from "react";

export const WidgetBundleDetailsPage = () => {
    const params = useParams();
    const router = useRouter();
    const bundleId = params.id as string;

    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [sortProperty, setSortProperty] = useState("createdTime");
    const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

    const [showSelectTypeDialog, setShowSelectTypeDialog] = useState(false);
    const [showImportDialog, setShowImportDialog] = useState(false);

    const { createWidgetType } = useManageWidgetType();

    const { data: bundle, isLoading: isBundleLoading } = useSWR(
        bundleId ? ["widgetBundle", bundleId] : null,
        () => WidgetService.getWidgetBundleById(bundleId)
    );

    const { data: widgetsPage, isLoading: isWidgetsLoading, mutate } = useSWR(
        bundleId ? ["bundleWidgets", bundleId, page, pageSize, sortProperty, sortOrder] : null,
        () =>
            WidgetService.getWidgetTypes(
                page,
                pageSize,
                sortProperty,
                sortOrder,
                false, // tenantOnly
                false, // fullSearch
                false, // scadaFirst
                "ALL", // deprecatedFilter
                bundleId
            )
    );

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const handleRefresh = useCallback(() => {
        mutate();
    }, [mutate]);

    if (isBundleLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!bundle) {
        return <div>Bundle not found</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="h-8 w-8"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{bundle.title}</h1>
                        <p className="text-muted-foreground">{bundle.description}</p>
                    </div>
                </div>
                <AddWidgetMenu
                    onCreate={() => setShowSelectTypeDialog(true)}
                    onImport={() => setShowImportDialog(true)}
                />
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold">Widgets</h2>
                </div>
                <BundleWidgetsTable
                    widgets={widgetsPage?.data || []}
                    isLoading={isWidgetsLoading}
                    currentPage={page}
                    totalPages={widgetsPage?.totalPages || 0}
                    totalElements={widgetsPage?.totalElements || 0}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onRefresh={handleRefresh}
                />
            </div>

            <SelectWidgetTypeDialog
                open={showSelectTypeDialog}
                onOpenChange={setShowSelectTypeDialog}
                onSelectType={async (type) => {
                    setShowSelectTypeDialog(false);
                    try {
                        const alias = `new_${type}_${Date.now()}`;
                        const request: CreateWidgetTypeRequest = {
                            name: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Widget`,
                            bundleAlias: bundle.alias,
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
        </div>
    );
};
