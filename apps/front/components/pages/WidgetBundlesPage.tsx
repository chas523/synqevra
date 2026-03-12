"use client";

import { useState, useCallback } from "react";
import { WidgetBundlesTable } from "@/components/organisms/WidgetBundlesTable";
import { CreateWidgetBundleDialog } from "@/components/organisms/CreateWidgetBundleDialog";
import { useWidgetBundles } from "@/hooks/thingsboard/widgets/useWidgetBundles";
import { WidgetBundle } from "@/types/widgetTypes";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const PAGE_SIZE = 10;

export const WidgetBundlesPage = () => {
  const router = useRouter();

  // Widget Bundles State
  const [bundlesPage, setBundlesPage] = useState(0);
  const [bundlesSortProperty, setBundlesSortProperty] = useState("title");
  const [bundlesSortOrder, setBundlesSortOrder] = useState<"ASC" | "DESC">(
    "ASC",
  );
  const [showCreateBundleDialog, setShowCreateBundleDialog] = useState(false);

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

  const handleBundleRowClick = useCallback(
    (bundle: WidgetBundle) => {
      router.push(`/resources/widgets-library/widgets-bundles/${bundle.id.id}`);
    },
    [router],
  );

  return (
    <>
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

      <CreateWidgetBundleDialog
        open={showCreateBundleDialog}
        onOpenChange={setShowCreateBundleDialog}
        onSuccess={() => {
          mutateBundles();
        }}
      />
    </>
  );
};
