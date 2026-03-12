"use client";

import { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WidgetTypesTable } from "@/components/organisms/WidgetTypesTable";
import { SelectWidgetTypeDialog } from "@/components/organisms/SelectWidgetTypeDialog";
import { ImportWidgetDialog } from "@/components/organisms/ImportWidgetDialog";
import { AddWidgetMenu } from "@/components/organisms/AddWidgetMenu";
import {
  useWidgetTypes,
  useManageWidgetType,
} from "@/hooks/thingsboard/widgets/useWidgetTypes";
import { useWidgetBundles } from "@/hooks/thingsboard/widgets/useWidgetBundles";
import { WidgetBundlesTable } from "@/components/organisms/WidgetBundlesTable";
import { CreateWidgetBundleDialog } from "@/components/organisms/CreateWidgetBundleDialog";
import {
  WidgetType,
  CreateWidgetTypeRequest,
  WidgetBundle,
} from "@/types/widgetTypes";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const PAGE_SIZE = 10;

export const WidgetLibraryPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("widget-types");

  // Widget Types State
  const [currentPage, setCurrentPage] = useState(0);
  const [deprecatedFilter, setDeprecatedFilter] = useState("ALL");
  const [sortProperty, setSortProperty] = useState("createdTime");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [showSelectTypeDialog, setShowSelectTypeDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showCreateBundleDialog, setShowCreateBundleDialog] = useState(false);

  const { widgetTypes, totalPages, totalElements, isLoading, mutate } =
    useWidgetTypes(
      currentPage,
      PAGE_SIZE,
      sortProperty,
      sortOrder,
      false, // tenantOnly
      false, // fullSearch
      false, // scadaFirst
      deprecatedFilter,
    );

  // Widget Bundles State
  const [bundlesPage, setBundlesPage] = useState(0);
  const [bundlesSortProperty, setBundlesSortProperty] = useState("title");
  const [bundlesSortOrder, setBundlesSortOrder] = useState<"ASC" | "DESC">(
    "ASC",
  );

  const {
    widgetBundles,
    totalPages: bundlesTotalPages,
    totalElements: bundlesTotalElements,
    isLoading: isBundlesLoading,
    mutate: mutateBundles,
  } = useWidgetBundles(
    bundlesPage,
    PAGE_SIZE,
    bundlesSortProperty,
    bundlesSortOrder,
  );

  const handleBundlesPageChange = useCallback((page: number) => {
    setBundlesPage(page);
  }, []);

  const handleBundlesSortChange = useCallback(
    (property: string, order: "ASC" | "DESC") => {
      setBundlesSortProperty(property);
      setBundlesSortOrder(order);
      setBundlesPage(0);
    },
    [],
  );

  const handleBundlesRefresh = useCallback(() => {
    mutateBundles();
  }, [mutateBundles]);

  const { isCreating, createWidgetType, deleteWidgetType } =
    useManageWidgetType();

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleDeprecatedFilterChange = useCallback((filter: string) => {
    setDeprecatedFilter(filter);
    setCurrentPage(0);
  }, []);

  const handleSortChange = useCallback(
    (property: string, order: "ASC" | "DESC") => {
      setSortProperty(property);
      setSortOrder(order);
      setCurrentPage(0);
    },
    [],
  );

  const handleRefresh = useCallback(() => {
    mutate();
  }, [mutate]);

  const handleDelete = useCallback(
    async (widgetType: WidgetType) => {
      try {
        await deleteWidgetType(widgetType.id.id);
        toast.success("Widget type deleted successfully");
        mutate();
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to delete widget type";
        toast.error(errorMessage);
      }
    },
    [deleteWidgetType, mutate],
  );

  const handleRowClick = useCallback(
    (widgetType: WidgetType) => {
      router.push(
        `/resources/widgets-library/widget-types/${widgetType.id.id}`,
      );
    },
    [router],
  );

  const handleBundleRowClick = useCallback(
    (bundle: WidgetBundle) => {
      router.push(`/resources/widgets-library/widgets-bundles/${bundle.id.id}`);
    },
    [router],
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight dark:text-white">
          Widgets Library
        </h1>
        <p className="text-muted-foreground">
          Manage your widget types and bundles.
        </p>
      </div>

      <Tabs
        defaultValue="widget-types"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="widget-types">Widget Types</TabsTrigger>
          <TabsTrigger value="widget-bundles">Widget Bundles</TabsTrigger>
        </TabsList>
        <TabsContent value="widget-types" className="space-y-4">
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
        </TabsContent>
        <TabsContent value="widget-bundles" className="space-y-4">
          <WidgetBundlesTable
            widgetBundles={widgetBundles}
            isLoading={isBundlesLoading}
            currentPage={bundlesPage}
            totalPages={bundlesTotalPages}
            totalElements={bundlesTotalElements}
            pageSize={PAGE_SIZE}
            sortProperty={bundlesSortProperty}
            sortOrder={bundlesSortOrder}
            onSortChange={handleBundlesSortChange}
            onPageChange={handleBundlesPageChange}
            onRefresh={handleBundlesRefresh}
            onRowClick={handleBundleRowClick}
            customAction={
              <Button onClick={() => setShowCreateBundleDialog(true)} size="sm">
                Add Widget Bundle
              </Button>
            }
          />
        </TabsContent>
      </Tabs>

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
                dataKeySettingsSchema: "",
              },
            };

            await createWidgetType(request);
            toast.success("Widget type created successfully");
            mutate();
          } catch (error: any) {
            console.error("Failed to create widget type", error);
            const errorMessage =
              error?.response?.data?.message ||
              error?.message ||
              "Failed to create widget type";
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

      <CreateWidgetBundleDialog
        open={showCreateBundleDialog}
        onOpenChange={setShowCreateBundleDialog}
        onSuccess={() => {
          mutateBundles();
        }}
      />
    </div>
  );
};
