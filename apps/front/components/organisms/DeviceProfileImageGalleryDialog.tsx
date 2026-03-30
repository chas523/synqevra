"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { ImageService } from "@/lib/services/thingsboardServices/imageService";
import { cn, getImagePreviewUrl } from "@/lib/utils";
import type { Image } from "@/types/imageTypes";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import { toast } from "sonner";

const PAGE_SIZE = 10;

/**
 * ThingsBoard does not generate /preview for SVG images.
 * Fall back to the direct download URL in that case.
 */
const getImageDisplayUrl = (image: Image): string => {
  const isSvg =
    image.descriptor?.mediaType === "image/svg+xml" ||
    image.fileName?.toLowerCase().endsWith(".svg");

  if (isSvg) {
    let cleanLink = image.link;
    if (cleanLink.startsWith("tb-image;")) {
      cleanLink = cleanLink.replace("tb-image;", "");
    }
    return `/api/thingsboard/images/download/${encodeURIComponent(cleanLink)}`;
  }

  return getImagePreviewUrl(image.link);
};

interface DeviceProfileImageGalleryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (imageLink: string) => void;
}

export function DeviceProfileImageGalleryDialog({
  open,
  onOpenChange,
  onSelect,
}: DeviceProfileImageGalleryDialogProps) {
  const [images, setImages] = useState<Image[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [includeSystemImages, setIncludeSystemImages] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [appliedSearchText, setAppliedSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadImages = async (
    nextPage: number,
    nextIncludeSystemImages: boolean,
    nextTextSearch: string = appliedSearchText,
  ) => {
    try {
      setIsLoading(true);
      const response = await ImageService.getImages(
        nextPage,
        PAGE_SIZE,
        "createdTime",
        "DESC",
        "IMAGE",
        nextIncludeSystemImages,
        nextTextSearch,
      );

      setImages(response.data ?? []);
      setPage(nextPage);
      setTotalPages(response.totalPages ?? 0);
      setTotalElements(response.totalElements ?? 0);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to load image gallery",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setImages([]);
      setPage(0);
      setTotalPages(0);
      setTotalElements(0);
      setIncludeSystemImages(false);
      setSearchText("");
      setAppliedSearchText("");
      setIsLoading(false);
      return;
    }

    void loadImages(0, false, "");
  }, [open]);

  const handleIncludeSystemImagesChange = (checked: boolean) => {
    setIncludeSystemImages(checked);
    void loadImages(0, checked, appliedSearchText);
  };

  const handleSearch = () => {
    const normalized = searchText.trim();
    setAppliedSearchText(normalized);
    void loadImages(0, includeSystemImages, normalized);
  };

  const handleRefresh = () => {
    void loadImages(page, includeSystemImages, appliedSearchText);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 0 || nextPage >= totalPages || isLoading) {
      return;
    }

    void loadImages(nextPage, includeSystemImages, appliedSearchText);
  };

  const formatSize = (size?: number) => {
    if (!size) {
      return "-";
    }

    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Image gallery</DialogTitle>
          <DialogDescription className="sr-only">
            Select an image for the device profile.
          </DialogDescription>
        </DialogHeader>

        <div className="border-b px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm">
              <Switch
                checked={includeSystemImages}
                onCheckedChange={handleIncludeSystemImagesChange}
                disabled={isLoading}
                id="device-profile-image-gallery-system-switch"
              />
              <label
                htmlFor="device-profile-image-gallery-system-switch"
                className="cursor-pointer font-medium"
              >
                Include system images
              </label>
            </div>

            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
              <div className="relative min-w-64 flex-1 sm:flex-none">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleSearch();
                    }
                  }}
                  placeholder="Search by image name"
                  className="pl-9"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleSearch}
                disabled={isLoading}
                className="gap-2"
              >
                <Search className="h-4 w-4" />
                Search
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="max-h-[55vh] overflow-y-auto px-6 py-2">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading images...
            </div>
          ) : images.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              No images found.
            </div>
          ) : (
            <div className="divide-y">
              {images.map((image) => (
                <div
                  key={image.id.id}
                  className="grid grid-cols-[88px_minmax(0,1fr)_auto] items-center gap-4 py-3"
                >
                  <div className="flex h-16 w-20 items-center justify-center overflow-hidden rounded border bg-muted/30">
                    <img
                      src={getImageDisplayUrl(image)}
                      alt={image.title}
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        // If preview fails (e.g. format not supported), try direct download
                        const target = e.currentTarget;
                        const directUrl = `/api/thingsboard/images/download/${encodeURIComponent(
                          image.link.startsWith("tb-image;")
                            ? image.link.replace("tb-image;", "")
                            : image.link,
                        )}`;
                        if (target.src !== window.location.origin + directUrl) {
                          target.src = directUrl;
                        }
                      }}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {image.title}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        {image.descriptor?.width ?? "-"}x
                        {image.descriptor?.height ?? "-"}
                      </span>
                      <span>{formatSize(image.descriptor?.size)}</span>
                      <span className="truncate">{image.fileName}</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      onSelect(image.link);
                      onOpenChange(false);
                    }}
                  >
                    Select
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t px-6 py-4 text-sm">
          <span className="text-muted-foreground">
            {totalElements === 0
              ? "0 images"
              : `${page * PAGE_SIZE + 1}-${Math.min((page + 1) * PAGE_SIZE, totalElements)} of ${totalElements}`}
          </span>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(page - 1)}
              disabled={isLoading || page === 0}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-20 text-center text-muted-foreground">
              {totalPages === 0
                ? "Page 0 / 0"
                : `Page ${page + 1} / ${totalPages}`}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(page + 1)}
              disabled={isLoading || totalPages === 0 || page >= totalPages - 1}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
