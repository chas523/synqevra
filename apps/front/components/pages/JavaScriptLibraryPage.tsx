"use client";

import { useState, useCallback } from "react";
import { JavaScriptLibraryTable } from "@/components/organisms/JavaScriptLibraryTable";
import { JavaScriptResourceDetails } from "@/components/organisms/JavaScriptResourceDetails";
import { AddJavaScriptResourceDialog } from "@/components/organisms/AddJavaScriptResourceDialog";
import { useResources, useManageResource } from "@/hooks/thingsboard/resources/useResources";
import { Resource, ResourceCreateRequest } from "@/types/resourceTypes";
import { toast } from "sonner";

const PAGE_SIZE = 10;

export const JavaScriptLibraryPage = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [resourceSubTypeFilter, setResourceSubTypeFilter] = useState<string | undefined>(undefined);
    const [sortProperty, setSortProperty] = useState("createdTime");
    const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);

    const { resources, totalPages, totalElements, isLoading, mutate } = useResources(
        currentPage,
        PAGE_SIZE,
        sortProperty,
        sortOrder,
        "JS_MODULE", // Fixed ResourceType
        resourceSubTypeFilter
    );

    const { isSaving, createResource, deleteResource, downloadResource } = useManageResource();

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handleResourceSubTypeChange = useCallback((subType: string | undefined) => {
        setResourceSubTypeFilter(subType);
        setCurrentPage(0);
    }, []);

    const handleSortChange = useCallback((property: string, order: "ASC" | "DESC") => {
        setSortProperty(property);
        setSortOrder(order);
        setCurrentPage(0); // Reset to first page on sort change
    }, []);

    const handleRefresh = useCallback(() => {
        mutate();
    }, [mutate]);

    const handleRowClick = useCallback((resource: Resource) => {
        setSelectedResource(resource);
        setShowDetailsDialog(true);
    }, []);

    const handleAdd = useCallback(async (resource: ResourceCreateRequest) => {
        try {
            await createResource(resource);
            mutate();
        } catch (error: any) {
            // Error handled in dialog or service, but we might want to re-throw or handle here
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to add resource";
            // toast.error(errorMessage); // Already toasted in dialog
            throw error;
        }
    }, [createResource, mutate]);

    const handleDownload = useCallback(async (resource: Resource) => {
        try {
            if (!resource.id?.id) {
                toast.error("Resource ID not found");
                return;
            }
            await downloadResource(resource.id.id, resource.fileName);
            toast.success("Resource downloaded successfully");
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to download resource";
            toast.error(errorMessage);
        }
    }, [downloadResource]);

    const handleDelete = useCallback(async (resource: Resource) => {
        try {
            if (!resource.id?.id) {
                toast.error("Resource ID not found");
                return;
            }
            await deleteResource(resource.id.id);
            toast.success("Resource deleted successfully");
            setShowDetailsDialog(false);
            mutate();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete resource";
            toast.error(errorMessage);
        }
    }, [deleteResource, mutate]);

    const handleUpdate = useCallback(() => {
        mutate();
    }, [mutate]);

    return (
        <div className="container mx-auto p-6">
            <JavaScriptLibraryTable
                resources={resources}
                isLoading={isLoading}
                currentPage={currentPage}
                totalPages={totalPages}
                totalElements={totalElements}
                pageSize={PAGE_SIZE}
                resourceSubTypeFilter={resourceSubTypeFilter ?? "ALL"}
                sortProperty={sortProperty}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                onPageChange={handlePageChange}
                onResourceSubTypeChange={handleResourceSubTypeChange}
                onRefresh={handleRefresh}
                onAdd={() => setShowAddDialog(true)}
                onRowClick={handleRowClick}
                onDownload={handleDownload}
                onDelete={handleDelete}
            />

            <JavaScriptResourceDetails
                isOpen={showDetailsDialog}
                onClose={() => setShowDetailsDialog(false)}
                resource={selectedResource}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
            />

            <AddJavaScriptResourceDialog
                open={showAddDialog}
                onOpenChange={setShowAddDialog}
                onAdd={handleAdd}
                isSaving={isSaving}
            />
        </div>
    );
};
