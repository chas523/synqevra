"use client";

import { useState, useCallback } from "react";
import { ResourcesTable } from "@/components/organisms/ResourcesTable";
import { ResourceDetailPanel } from "@/components/organisms/ResourceDetailPanel";
import { AddResourceDialog } from "@/components/organisms/AddResourceDialog";
import {
  useResources,
  useManageResource,
} from "@/hooks/thingsboard/resources/useResources";
import {
  Resource,
  ResourceType,
  ResourceCreateRequest,
} from "@/types/resourceTypes";
import { toast } from "sonner";

const PAGE_SIZE = 10;

export const ResourceLibraryPage = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [resourceTypeFilter, setResourceTypeFilter] = useState<
    ResourceType | undefined
  >(undefined);
  const [sortProperty, setSortProperty] = useState("createdTime");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null,
  );
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const { resources, totalPages, totalElements, isLoading, mutate } =
    useResources(
      currentPage,
      PAGE_SIZE,
      sortProperty,
      sortOrder,
      resourceTypeFilter,
    );

  const { isSaving, createResource, deleteResource, downloadResource } =
    useManageResource();

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleResourceTypeChange = useCallback(
    (type: ResourceType | undefined) => {
      setResourceTypeFilter(type);
      setCurrentPage(0);
    },
    [],
  );

  const handleSortChange = useCallback(
    (property: string, order: "ASC" | "DESC") => {
      setSortProperty(property);
      setSortOrder(order);
      setCurrentPage(0); // Reset to first page on sort change
    },
    [],
  );

  const handleRefresh = useCallback(() => {
    mutate();
  }, [mutate]);

  const handleRowClick = useCallback((resource: Resource) => {
    setSelectedResource(resource);
    setShowDetailsDialog(true);
  }, []);

  const handleAdd = useCallback(
    async (resource: ResourceCreateRequest) => {
      try {
        await createResource(resource);
        toast.success("Resource added successfully");
        mutate();
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to add resource";
        toast.error(errorMessage);
        throw error;
      }
    },
    [createResource, mutate],
  );

  const handleDownload = useCallback(
    async (resource: Resource) => {
      try {
        if (!resource.id?.id) {
          toast.error("Resource ID not found");
          return;
        }
        await downloadResource(resource.id.id, resource.fileName);
        toast.success("Resource downloaded successfully");
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to download resource";
        toast.error(errorMessage);
      }
    },
    [downloadResource],
  );

  const handleDelete = useCallback(
    async (resource: Resource) => {
      try {
        if (!resource.id?.id) {
          toast.error("Resource ID not found");
          return;
        }
        await deleteResource(resource.id.id);
        toast.success("Resource deleted successfully");
        mutate();
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to delete resource";
        toast.error(errorMessage);
      }
    },
    [deleteResource, mutate],
  );

  return (
    <div className="container mx-auto p-6">
      <ResourcesTable
        resources={resources}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={PAGE_SIZE}
        resourceTypeFilter={resourceTypeFilter ?? "ALL"}
        sortProperty={sortProperty}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onPageChange={handlePageChange}
        onResourceTypeChange={handleResourceTypeChange}
        onRefresh={handleRefresh}
        onAdd={() => setShowAddDialog(true)}
        onRowClick={handleRowClick}
        onDownload={handleDownload}
        onDelete={handleDelete}
      />

      <ResourceDetailPanel
        isOpen={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        resource={selectedResource}
        onDownload={handleDownload}
        onDelete={handleDelete}
      />

      <AddResourceDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAdd}
        isSaving={isSaving}
      />
    </div>
  );
};
