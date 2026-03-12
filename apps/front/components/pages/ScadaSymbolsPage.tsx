"use client";

import { useState, useCallback } from "react";
import {
  useImages,
  useManageImage,
} from "@/hooks/thingsboard/resources/useImages";
import { ScadaSymbolsTable } from "@/components/organisms/ScadaSymbolsTable";
import { UploadScadaSymbolDialog } from "@/components/organisms/UploadScadaSymbolDialog";
import { EmbedImageDialog } from "@/components/organisms/EmbedImageDialog";
import { Image } from "@/types/imageTypes";
import { toast } from "sonner";

export function ScadaSymbolsPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortProperty, setSortProperty] = useState("createdTime");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

  const { images, totalElements, totalPages, isLoading, mutate } = useImages(
    page,
    pageSize,
    sortProperty,
    sortOrder,
    "SCADA_SYMBOL",
  );

  const { isUploading, uploadImage } = useManageImage();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);

  const handleUpload = async (file: File, title: string) => {
    try {
      await uploadImage(file, title, "SCADA_SYMBOL");
      toast.success("SCADA symbol uploaded successfully");
      mutate();
    } catch (error) {
      toast.error("Failed to upload SCADA symbol");
      throw error;
    }
  };

  const handleEmbedClick = useCallback((image: Image) => {
    setSelectedImage(image);
    setEmbedDialogOpen(true);
  }, []);

  const handleRefresh = useCallback(() => {
    mutate();
  }, [mutate]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleSortChange = useCallback(
    (property: string, order: "ASC" | "DESC") => {
      setSortProperty(property);
      setSortOrder(order);
    },
    [],
  );

  return (
    <div className="p-6">
      <ScadaSymbolsTable
        images={images}
        totalElements={totalElements}
        totalPages={totalPages}
        page={page}
        pageSize={pageSize}
        sortProperty={sortProperty}
        sortOrder={sortOrder}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
        onEmbedClick={handleEmbedClick}
        onRefresh={handleRefresh}
        onAdd={() => setUploadDialogOpen(true)}
      />

      <UploadScadaSymbolDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUpload={handleUpload}
        isUploading={isUploading}
      />

      <EmbedImageDialog
        open={embedDialogOpen}
        onClose={() => setEmbedDialogOpen(false)}
        image={selectedImage}
      />
    </div>
  );
}
