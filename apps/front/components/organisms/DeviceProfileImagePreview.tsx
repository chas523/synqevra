"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getImagePreviewUrl } from "@/lib/utils";
import { ImageIcon, Link2, X } from "lucide-react";

type DeviceProfileImagePreviewProps = {
  image: string;
  imageInputMode: "none" | "link";
  isSaving: boolean;
  onOpenGallery: () => void;
  onSwitchToLink: () => void;
  onClearImage: () => void;
  onImageChange: (value: string) => void;
};

export function DeviceProfileImagePreview({
  image,
  imageInputMode,
  isSaving,
  onOpenGallery,
  onSwitchToLink,
  onClearImage,
  onImageChange,
}: DeviceProfileImagePreviewProps) {
  const hasSelectedImage = Boolean(image.trim());

  if (!hasSelectedImage && imageInputMode !== "link") {
    return (
      <div className="grid gap-2 md:grid-cols-[104px_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex h-26.5 items-center justify-center rounded-md border bg-muted/20 p-4 text-center text-sm text-muted-foreground">
          No image selected
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onOpenGallery}
          className="flex h-26.5 flex-col items-center justify-center gap-3"
          disabled={isSaving}
        >
          <ImageIcon className="h-6 w-6" />
          <span>Browse from gallery</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onSwitchToLink}
          className="flex h-26.5 flex-col items-center justify-center gap-3"
          disabled={isSaving}
        >
          <Link2 className="h-6 w-6" />
          <span>Set link</span>
        </Button>
      </div>
    );
  }

  if (imageInputMode === "link") {
    return (
      <div className="grid gap-3 md:grid-cols-[104px_minmax(0,1fr)_auto] md:items-end">
        <div className="flex h-26.5 items-center justify-center overflow-hidden rounded-md border bg-muted/20">
          {hasSelectedImage ? (
            <img
              src={getImagePreviewUrl(image)}
              alt="Device profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="px-3 text-center text-sm text-muted-foreground">
              No image selected
            </span>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="device-profile-image-link"
            className="text-sm font-medium"
          >
            Image link
          </label>
          <Input
            id="device-profile-image-link"
            value={image}
            onChange={(event) => onImageChange(event.target.value)}
            placeholder="https://example.com/image.png"
            disabled={isSaving}
          />
        </div>

        <div className="flex items-center gap-2 md:pb-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClearImage}
            disabled={isSaving && !image}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-[104px_minmax(0,1fr)_auto] md:items-center">
      <div className="flex h-26.5 items-center justify-center overflow-hidden rounded-md border bg-muted/20">
        <img
          src={getImagePreviewUrl(image)}
          alt="Device profile"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="min-w-0 rounded-md border p-4">
        <div className="truncate text-sm font-medium">Selected image</div>
        <div className="mt-1 truncate text-sm text-muted-foreground">
          {image}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onOpenGallery}
            disabled={isSaving}
          >
            Browse from gallery
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onSwitchToLink}
            disabled={isSaving}
          >
            Set link
          </Button>
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onClearImage}
        disabled={isSaving}
        className="text-muted-foreground"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
