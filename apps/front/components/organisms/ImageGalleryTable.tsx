"use client";

import { useState } from "react";
import { Image } from "@/types/imageTypes";
import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import { Button } from "@/components/ui/button";
import { Download, FileJson, Code, Trash2 } from "lucide-react";

import { toast } from "sonner";
import { useManageImage } from "@/hooks/thingsboard/resources/useImages";
import { formatTenantDate } from "@/lib/utils";

interface ImageGalleryTableProps {
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

export function ImageGalleryTable({
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
}: ImageGalleryTableProps) {
    const { downloadImage, exportImage, deleteImage } = useManageImage();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDownload = async (image: Image, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await downloadImage(image.link, image.fileName);
            toast.success("Image downloaded");
        } catch (error) {
            toast.error("Failed to download image");
        }
    };

    const handleExport = async (image: Image, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await exportImage(image.link, image.fileName);
            toast.success("Image exported to JSON");
        } catch (error) {
            toast.error("Failed to export image");
        }
    };

    const handleEmbed = (image: Image, e: React.MouseEvent) => {
        e.stopPropagation();
        onEmbedClick(image);
    };

    const handleDelete = async (image: Image, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeletingId(image.id.id);
        try {
            await deleteImage(image.link, false);
            toast.success("Image deleted");
            onRefresh();
        } catch (error: any) {
            // Check if it's a 400 error with references (indicating force delete is needed)
            if (error?.response?.status === 400 && error?.response?.data?.references) {
                const shouldForce = window.confirm("Image is referenced by other entities. Do you want to force delete?");
                if (shouldForce) {
                    try {
                        await deleteImage(image.link, true);
                        toast.success("Image force deleted");
                        onRefresh();
                    } catch (forceError) {
                        toast.error("Failed to force delete image");
                    }
                }
            } else {
                toast.error("Failed to delete image");
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
                <div className="w-12 h-12 flex items-center justify-center">
                    <img
                        src={`/api/thingsboard/images/download/${encodeURIComponent(image.link + '/preview')}`}
                        alt={image.title}
                        className="max-w-full max-h-full object-contain rounded"
                        onError={(e) => {
                            // detailed error logging
                            console.error(`Failed to load image: ${image.title}`, e);
                            (e.target as HTMLImageElement).style.display = 'none';
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
                title="Download Image"
            >
                <Download className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={(e) => handleExport(image, e)}
                title="Export Image to JSON"
            >
                <FileJson className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={(e) => handleEmbed(image, e)}
                title="Embed Image"
            >
                <Code className="h-4 w-4" />
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
            title="Image gallery"
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
            emptyMessage="No images found."
        />
    );
}
