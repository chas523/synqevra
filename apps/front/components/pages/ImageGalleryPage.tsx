"use client";

import { useState, useCallback } from "react";
import {
  useImages,
  useManageImage,
} from "@/hooks/thingsboard/resources/useImages";
import { ImageGalleryTable } from "@/components/organisms/ImageGalleryTable";
import { UploadImageDialog } from "@/components/organisms/UploadImageDialog";
import { EmbedImageDialog } from "@/components/organisms/EmbedImageDialog";
import { Image } from "@/types/imageTypes";
import { toast } from "sonner";

export function ImageGalleryPage() {
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [sortProperty, setSortProperty] = useState("createdTime");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [includeSystemImages, setIncludeSystemImages] = useState(false);

  const { images, totalElements, totalPages, isLoading, mutate } = useImages(
    page,
    pageSize,
    sortProperty,
    sortOrder,
    "IMAGE",
    includeSystemImages,
  );

  const { isUploading, uploadImage } = useManageImage();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);

  const handleUpload = async (file: File, title: string) => {
    try {
      await uploadImage(file, title);
      toast.success("Image uploaded successfully");
      mutate();
    } catch (error) {
      toast.error("Failed to upload image");
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

  const handleIncludeSystemImagesChange = useCallback((include: boolean) => {
    setIncludeSystemImages(include);
    setPage(0);
  }, []);

  return (
    <div className="p-6">
      <ImageGalleryTable
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
        includeSystemImages={includeSystemImages}
        onIncludeSystemImagesChange={handleIncludeSystemImagesChange}
      />

      <UploadImageDialog
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
