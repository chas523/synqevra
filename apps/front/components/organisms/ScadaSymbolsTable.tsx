"use client";

import { useState } from "react";
import { Image } from "@/types/imageTypes";
import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import { Button } from "@/components/ui/button";
import { Download, FileJson, Code, Trash2 } from "lucide-react";

import { toast } from "sonner";
import { useManageImage } from "@/hooks/thingsboard/resources/useImages";
import { formatTenantDate } from "@/lib/utils";

interface ScadaSymbolsTableProps {
  images: Image[];
  totalElements: number;
  totalPages: number;
  page: number;
  pageSize: number;
  sortProperty: string;
  sortOrder: "ASC" | "DESC";
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onSortChange: (property: string, order: "ASC" | "DESC") => void;
  onEmbedClick: (image: Image) => void;
  onRefresh: () => void;
  onAdd: () => void;
}

export function ScadaSymbolsTable({
  images,
  totalElements,
  totalPages,
  page,
  pageSize,
  sortProperty,
  sortOrder,
  isLoading,
  onPageChange,
  onSortChange,
  onEmbedClick,
  onRefresh,
  onAdd,
}: ScadaSymbolsTableProps) {
  const { downloadImage, exportImage, deleteImage } = useManageImage();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDownload = async (image: Image, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await downloadImage(image.link, image.fileName);
      toast.success("SCADA symbol downloaded");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download SCADA symbol");
    }
  };

  const handleExport = async (image: Image, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await exportImage(image.link, image.fileName);
      toast.success("SCADA symbol exported to JSON");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export SCADA symbol");
    }
  };

  const handleDelete = async (image: Image, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(image.id.id);
    try {
      await deleteImage(image.link, false);
      toast.success("SCADA symbol deleted");
      onRefresh();
    } catch (error: any) {
      // Check if it's a 400 error with references (indicating force delete is needed)
      if (
        error?.response?.status === 400 &&
        error?.response?.data?.references
      ) {
        const shouldForce = window.confirm(
          "SCADA symbol is referenced by other entities. Do you want to force delete?",
        );
        if (shouldForce) {
          try {
            await deleteImage(image.link, true);
            toast.success("SCADA symbol force deleted");
            onRefresh();
          } catch (forceError) {
            console.error("Force delete failed:", forceError);
            toast.error("Failed to force delete SCADA symbol");
          }
        }
      } else {
        console.error("Delete failed:", error);
        toast.error("Failed to delete SCADA symbol");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const columns: DataTableColumn<Image>[] = [
    {
      key: "thumbnail",
      header: "",
      render: (image) => (
        <div className="w-12 h-12 flex items-center justify-center bg-muted rounded overflow-hidden">
          <img
            src={`/api/thingsboard/images/download/${encodeURIComponent(image.link + "/preview")}`}
            alt={image.title}
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              const img = e.currentTarget;
              // Set a placeholder SVG if the image fails to load
              const placeholderSvg = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                                    <circle cx="9" cy="9" r="2"/>
                                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                                </svg>
                            `)}`;
              img.src = placeholderSvg;
              img.onerror = null; // Prevent infinite loop
            }}
          />
        </div>
      ),
    },
    {
      key: "title",
      header: "Name",
      sortable: true,
      render: (image) => (
        <span className="font-medium dark:text-white">{image.title}</span>
      ),
    },
    {
      key: "createdTime",
      header: "Created time",
      sortable: true,
      render: (image) => (
        <span className="text-muted-foreground">
          {formatTenantDate(image.createdTime)}
        </span>
      ),
    },
    {
      key: "resolution",
      header: "Resolution",
      render: (image) => (
        <span className="text-muted-foreground">
          {image.descriptor?.width}x{image.descriptor?.height}
        </span>
      ),
    },
    {
      key: "size",
      header: "Size",
      render: (image) => (
        <span className="text-muted-foreground">
          {formatSize(image.descriptor?.size ?? 0)}
        </span>
      ),
    },
  ];

  const rowActions = (image: Image) => (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => handleDownload(image, e)}
        title="Download SCADA symbol"
      >
        <Download className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => handleExport(image, e)}
        title="Export SCADA symbol to JSON"
      >
        <FileJson className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => handleDelete(image, e)}
        disabled={deletingId === image.id.id}
        title="Delete"
        className="text-red-500 hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <DataTable
      title="SCADA symbols"
      data={images}
      columns={columns}
      getRowId={(image) => image.id.id}
      isLoading={isLoading}
      currentPage={page}
      totalPages={totalPages}
      totalElements={totalElements}
      pageSize={pageSize}
      onPageChange={onPageChange}
      sortProperty={sortProperty}
      sortOrder={sortOrder}
      onSortChange={onSortChange}
      onAdd={onAdd}
      onRefresh={onRefresh}
      rowActions={rowActions}
      emptyMessage="No SCADA symbols found."
      addButtonLabel="Upload SCADA symbol"
      onRowClick={(image) =>
        (window.location.href = `/resources/scada-symbols/system/${image.fileName}`)
      }
    />
  );
}
