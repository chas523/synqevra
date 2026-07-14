"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // For search if needed
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutGrid,
  List as ListIcon,
  Upload,
  Search,
  RefreshCw,
  FileImage,
  X,
} from "lucide-react";
import { ResourceService } from "@/lib/services/thingsboardServices/resourceService";
import { Resource } from "@/types/resourceTypes";
import { getImagePreviewUrl } from "@/lib/utils";

export interface ImageGalleryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (imageLink: string) => void;
}

export function ImageGalleryDialog({
  open,
  onOpenChange,
  onSelect,
}: ImageGalleryDialogProps) {
  const [images, setImages] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedImage, setSelectedImage] = useState<Resource | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [page, setPage] = useState(0);

  const fetchImages = async (pageParam = 0) => {
    setLoading(true);
    try {
      const pageSize = 36;
      const response = await ResourceService.getResources(
        pageParam,
        pageSize,
        "createdTime",
        "DESC",
        "IMAGE",
        "IMAGE",
      );

      if (pageParam === 0) {
        setImages(response.data);
      } else {
        setImages((prev) => [...prev, ...response.data]);
      }

      setHasNext(response.hasNext);
      setPage(pageParam);
    } catch (e) {
      console.error("Failed to fetch images", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchImages(0);
      setSelectedImage(null);
    }
  }, [open]);

  const handleLoadMore = () => {
    if (!loading && hasNext) {
      fetchImages(page + 1);
    }
  };

  const handleSelect = () => {
    if (selectedImage) {
      onSelect(selectedImage.link || selectedImage.publicLink || "");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-225 h-[80vh] flex flex-col p-0 gap-0 bg-background">
        <div className="flex items-center justify-between border-b border-border p-4">
          <DialogTitle className="text-lg font-semibold">
            Image gallery
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fetchImages(0)}
              title="Refresh"
            >
              <RefreshCw size={18} />
            </Button>
            <div className="flex rounded-md border border-border p-0.5">
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode("list")}
              >
                <ListIcon size={16} />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid size={16} />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              title="Close"
            >
              <X size={18} />
            </Button>
          </div>
        </div>

        <div className="flex gap-4 border-b border-border p-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search images..."
              className="border-border bg-muted pl-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-muted p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Loading...
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((img, index) => (
                <div
                  key={img.id?.id || index}
                  className={`
                              group relative aspect-square rounded-md border bg-background 
                                        flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md
                              ${selectedImage?.id?.id === img.id?.id ? "border-primary ring-2 ring-primary/20" : "border-border"}
                                    `}
                  onClick={() => setSelectedImage(img)}
                >
                  <div className="flex-1 w-full flex items-center justify-center p-4 overflow-hidden">
                    {/* Identify image type and render appropriately. For now standard img tag with link */}
                    {/* We might need to handle auth token for images if they are protected, but usually /api/images are accessible if logged in */}
                    <img
                      src={getImagePreviewUrl(img.link)}
                      alt={img.title}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        const img = e.currentTarget;
                        const placeholderSvg = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
                                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
                                                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                                                        <circle cx="9" cy="9" r="2"/>
                                                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                                                    </svg>
                                                `)}`;
                        img.src = placeholderSvg;
                        img.onerror = null;
                      }}
                    />
                    <FileImage className="fallback-icon hidden text-muted-foreground h-10 w-10" />
                  </div>
                  <div className="w-full truncate border-t border-border/50 bg-background p-2 text-center text-xs font-medium text-foreground/80">
                    {img.title}
                  </div>
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-md pointer-events-none" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {images.map((img, index) => (
                <div
                  key={img.id?.id || index}
                  className={`
                                        flex cursor-pointer items-center rounded-md border bg-background p-2 hover:bg-muted
                                        ${selectedImage?.id?.id === img.id?.id ? "border-primary bg-primary/10" : "border-border"}
                                    `}
                  onClick={() => setSelectedImage(img)}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded border border-border bg-muted">
                    <img
                      src={getImagePreviewUrl(img.link)}
                      alt={img.title}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const img = e.currentTarget;
                        const placeholderSvg = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
                                                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                                                        <circle cx="9" cy="9" r="2"/>
                                                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                                                    </svg>
                                                `)}`;
                        img.src = placeholderSvg;
                        img.onerror = null;
                      }}
                    />
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">
                      {img.title}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {img.resourceKey}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {img.createdTime
                      ? new Date(img.createdTime).toLocaleDateString()
                      : "-"}
                  </div>
                </div>
              ))}
            </div>
          )}

          {loading && (
            <div className="py-4 text-center text-muted-foreground">
              Loading images...
            </div>
          )}

          {!loading && hasNext && (
            <div className="py-4 text-center">
              <Button variant="outline" onClick={handleLoadMore}>
                Load more
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-border p-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSelect}
            disabled={!selectedImage}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Embed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
