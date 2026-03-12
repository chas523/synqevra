"use client";

import { useState, useCallback } from "react";
import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import {
  useOtaPackages,
  useManageOtaPackage,
} from "@/hooks/thingsboard/ota-packages/useOtaPackages";
import { OtaPackage } from "@/types/otaPackageTypes";
import { AddOtaPackageModal } from "./components/AddOtaPackageModal";
import { OtaPackageDetailPanel } from "./components/OtaPackageDetailPanel";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";

const PAGE_SIZE = 10;

function formatFileSize(bytes: number | null): string {
  if (bytes === null || bytes === undefined) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatChecksum(
  algorithm: string | null,
  checksum: string | null,
): string {
  if (!algorithm || !checksum) return "";
  const shortChecksum =
    checksum.length > 10 ? checksum.substring(0, 10) + "..." : checksum;
  return `${algorithm}: ${shortChecksum}`;
}

export default function OtaUpdatesPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortProperty, setSortProperty] = useState("createdTime");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<OtaPackage | null>(
    null,
  );
  const [showDetailPanel, setShowDetailPanel] = useState(false);

  const { packages, totalPages, totalElements, isLoading, mutate } =
    useOtaPackages(currentPage, PAGE_SIZE, sortProperty, sortOrder);

  const { isSaving, createOtaPackage, deleteOtaPackage, downloadOtaPackage } =
    useManageOtaPackage();

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
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

  const handleRowClick = useCallback((pkg: OtaPackage) => {
    setSelectedPackage(pkg);
    setShowDetailPanel(true);
  }, []);

  const handleAdd = useCallback(
    async (payload: any) => {
      try {
        await createOtaPackage(payload);
        toast.success("OTA package added successfully");
        mutate();
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to add OTA package";
        toast.error(errorMessage);
        throw error;
      }
    },
    [createOtaPackage, mutate],
  );

  const handleDownload = useCallback(
    async (pkg: OtaPackage) => {
      try {
        if (!pkg.id?.id) {
          toast.error("Package ID not found");
          return;
        }
        await downloadOtaPackage(
          pkg.id.id,
          pkg.fileName || `${pkg.title}-${pkg.version}`,
        );
        toast.success("Package downloaded successfully");
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to download package";
        toast.error(errorMessage);
      }
    },
    [downloadOtaPackage],
  );

  const handleDelete = useCallback(
    async (pkg: OtaPackage) => {
      try {
        if (!pkg.id?.id) {
          toast.error("Package ID not found");
          return;
        }
        await deleteOtaPackage(pkg.id.id);
        toast.success("Package deleted successfully");
        mutate();
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to delete package";
        toast.error(errorMessage);
      }
    },
    [deleteOtaPackage, mutate],
  );

  const columns: DataTableColumn<OtaPackage>[] = [
    {
      key: "createdTime",
      header: "Created time",
      sortable: true,
      render: (pkg) => (
        <span className="dark:text-white">
          {new Date(pkg.createdTime).toLocaleString()}
        </span>
      ),
    },
    {
      key: "title",
      header: "Title",
      sortable: true,
      render: (pkg) => <span className="dark:text-white">{pkg.title}</span>,
    },
    {
      key: "version",
      header: "Version",
      render: (pkg) => <span className="dark:text-white">{pkg.version}</span>,
    },
    {
      key: "tag",
      header: "Version tag",
      render: (pkg) => <span className="dark:text-white">{pkg.tag}</span>,
    },
    {
      key: "type",
      header: "Package type",
      sortable: true,
      render: (pkg) => (
        <span className="dark:text-white">
          {pkg.type === "FIRMWARE" ? "Firmware" : "Software"}
        </span>
      ),
    },
    {
      key: "url",
      header: "Direct URL",
      render: (pkg) => <span className="dark:text-white">{pkg.url || ""}</span>,
    },
    {
      key: "fileName",
      header: "File name",
      render: (pkg) => (
        <span className="text-primary dark:text-blue-400">
          {pkg.fileName || ""}
        </span>
      ),
    },
    {
      key: "dataSize",
      header: "File size",
      render: (pkg) => (
        <span className="dark:text-white">{formatFileSize(pkg.dataSize)}</span>
      ),
    },
    {
      key: "checksum",
      header: "Checksum",
      render: (pkg) => (
        <span className="dark:text-white text-xs">
          {formatChecksum(pkg.checksumAlgorithm, pkg.checksum)}
        </span>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <DataTable
        title="Packages repository"
        data={packages}
        columns={columns}
        getRowId={(pkg) => pkg.id.id}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
        sortProperty={sortProperty}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onAdd={() => setShowAddModal(true)}
        onRefresh={handleRefresh}
        onRowClick={handleRowClick}
        rowActions={(pkg) => (
          <div className="flex items-center gap-1">
            {pkg.hasData && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(pkg);
                }}
                title="Download package"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(pkg);
              }}
              title="Delete package"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        emptyMessage="No OTA packages found."
      />

      <AddOtaPackageModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAdd}
        isSaving={isSaving}
      />

      <OtaPackageDetailPanel
        isOpen={showDetailPanel}
        onClose={() => setShowDetailPanel(false)}
        otaPackage={selectedPackage}
        onDownload={handleDownload}
        onDelete={handleDelete}
      />
    </div>
  );
}
