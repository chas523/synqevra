"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { AddEntityViewDialog } from "@/components/organisms/AddEntityViewDialog";
import { EntityViewDetailPanel } from "@/components/organisms/EntityViewDetailPanel";
import { EntitiesEntityViewsTable } from "@/components/organisms/EntitiesEntityViewsTable";
import { useEntityViews } from "@/hooks/thingsboard/entityView/useEntityViews";
import { EntityViewService } from "@/lib/services/thingsboardServices/entityViewService";
import type {
  CreateEntityViewRequest,
  EntityView,
} from "@/types/thingsboardEntityViewTypes";

const PAGE_SIZE = 10;

export const EntitiesEntityViewsPage = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortProperty, setSortProperty] = useState("createdTime");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [addEntityViewOpen, setAddEntityViewOpen] = useState(false);
  const [selectedEntityView, setSelectedEntityView] =
    useState<EntityView | null>(null);

  const { entityViews, totalPages, totalElements, isLoading, mutate } =
    useEntityViews(currentPage, PAGE_SIZE, sortProperty, sortOrder);

  const handleAddEntityViewSubmit = useCallback(
    async (payload: CreateEntityViewRequest) => {
      try {
        await EntityViewService.createEntityView(payload);
        toast.success(`Entity view "${payload.name}" created successfully`);
        setAddEntityViewOpen(false);
        mutate();
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Failed to create entity view",
        );
        throw error;
      }
    },
    [mutate],
  );

  const handleSortChange = useCallback(
    (property: string, order: "ASC" | "DESC") => {
      setSortProperty(property);
      setSortOrder(order);
      setCurrentPage(0);
    },
    [],
  );

  const handleMakePublic = useCallback(
    async (entityView: EntityView) => {
      try {
        const response = await EntityViewService.makeEntityViewPublic(
          entityView.id?.id ?? "",
        );

        if (
          typeof response === "object" &&
          response !== null &&
          "info" in response &&
          response.info
        ) {
          toast.info(
            response.message || `"${entityView.name}" is already public`,
          );
        } else {
          toast.success(`"${entityView.name}" is now public`);
        }

        mutate();
      } catch (error: any) {
        toast.info(
          error?.response?.data?.message ||
            "Entity view public state unchanged",
        );
      }
    },
    [mutate],
  );

  const handleMakePrivate = useCallback(
    async (entityView: EntityView) => {
      try {
        const response = await EntityViewService.makeEntityViewPrivate(
          entityView.id?.id ?? "",
        );

        if (
          typeof response === "object" &&
          response !== null &&
          "info" in response &&
          response.info
        ) {
          toast.info(
            response.message || `"${entityView.name}" is already private`,
          );
        } else {
          toast.success(`"${entityView.name}" is now private`);
        }

        mutate();
      } catch (error: any) {
        toast.info(
          error?.response?.data?.message ||
            "Entity view private state unchanged",
        );
      }
    },
    [mutate],
  );

  const handleDelete = useCallback(
    async (entityView: EntityView) => {
      try {
        await EntityViewService.deleteEntityView(entityView.id?.id ?? "");
        toast.success(`"${entityView.name}" deleted`);
        mutate();
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Failed to delete entity view",
        );
      }
    },
    [mutate],
  );

  return (
    <>
      <EntitiesEntityViewsTable
        entityViews={entityViews}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={PAGE_SIZE}
        sortProperty={sortProperty}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onPageChange={setCurrentPage}
        onRefresh={() => mutate()}
        onAdd={() => setAddEntityViewOpen(true)}
        onRowClick={(entityView) => setSelectedEntityView(entityView)}
        onMakePublic={handleMakePublic}
        onMakePrivate={handleMakePrivate}
        onDelete={handleDelete}
      />

      <AddEntityViewDialog
        open={addEntityViewOpen}
        onOpenChange={setAddEntityViewOpen}
        onSubmit={handleAddEntityViewSubmit}
      />

      <EntityViewDetailPanel
        entityView={selectedEntityView}
        isOpen={!!selectedEntityView}
        onClose={() => setSelectedEntityView(null)}
        onRefresh={() => mutate()}
      />
    </>
  );
};
