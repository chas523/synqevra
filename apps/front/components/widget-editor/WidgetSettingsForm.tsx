"use client";

import React, { useState } from "react";
import { useWidgetEditor } from "@/context/WidgetEditorContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  SelectAdmin as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/admin_select";
import { Image as ImageIcon, X } from "lucide-react";
import { ImageGalleryDialog } from "./ImageGalleryDialog";
import { getImagePreviewUrl } from "@/lib/utils";

export function WidgetSettingsForm() {
  const { widgetType, updateWidgetType } = useWidgetEditor();
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  if (!widgetType) return null;

  const handleImageSelect = (link: string) => {
    updateWidgetType({
      ...widgetType,
      image: link,
    });
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    updateWidgetType({
      ...widgetType,
      description: e.target.value,
    });
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    updateWidgetType({
      ...widgetType,
      tags,
    });
  };

  const handleScadaChange = (checked: boolean) => {
    updateWidgetType({
      ...widgetType,
      scada: checked,
    });
  };

  const handleDeprecatedChange = (checked: boolean) => {
    updateWidgetType({
      ...widgetType,
      deprecated: checked,
    });
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateWidgetType({
      ...widgetType,
      image: "",
    });
  };

  return (
    <div className="flex flex-col h-full space-y-6 pt-2">
      {/* Image Preview Section */}
      <div className="space-y-2">
        <Label>Image preview</Label>
        <div className="flex gap-4 h-32">
          <div className="w-32 h-32 border border-gray-200 dark:border-gray-800 rounded-md flex items-center justify-center bg-gray-50 dark:bg-slate-900 overflow-hidden relative group">
            {widgetType.image ? (
              <>
                <img
                  src={getImagePreviewUrl(widgetType.image)}
                  alt="Preview"
                  className="w-full h-full object-contain"
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
                <button
                  onClick={clearImage}
                  className="absolute top-1 right-1 p-1 bg-white/80 dark:bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-black text-gray-500 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <div className="text-center p-2">
                <span className="text-xs text-gray-400">No image selected</span>
              </div>
            )}
          </div>

          <div className="flex-1 grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-full flex flex-col gap-2 items-center justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 border-dashed"
              onClick={() => setIsGalleryOpen(true)}
            >
              <ImageIcon size={24} />
              Browse from gallery
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          placeholder="Enter description"
          className="min-h-25 resize-y"
          value={widgetType.description || ""}
          onChange={handleDescriptionChange}
        />
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <Input
          placeholder="Enter tags"
          defaultValue={widgetType.tags?.join(", ")}
          onChange={handleTagsChange}
        />
      </div>

      <div className="space-y-4 pt-2">
        <div className="flex items-center space-x-2">
          <Switch
            id="scada"
            checked={widgetType.scada}
            onCheckedChange={handleScadaChange}
          />
          <Label htmlFor="scada">SCADA symbol</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="deprecated"
            checked={widgetType.deprecated}
            onCheckedChange={handleDeprecatedChange}
          />
          <Label htmlFor="deprecated">Deprecated</Label>
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
        <Label>Settings form selector</Label>
        <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-md border border-gray-200 dark:border-gray-800 text-sm text-gray-500">
          Default
        </div>
      </div>

      <div className="space-y-2">
        <Label>Data key settings form selector</Label>
        <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-md border border-gray-200 dark:border-gray-800 text-sm text-gray-500">
          Default
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center space-x-2">
          <Switch id="basic-mode" />
          <Label htmlFor="basic-mode">Has basic mode</Label>
        </div>
        <div className="space-y-2 opacity-50 pointer-events-none">
          <Label>Basic mode form selector</Label>
          <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-md border border-gray-200 dark:border-gray-800 text-sm text-gray-500">
            Default
          </div>
        </div>
      </div>

      <ImageGalleryDialog
        open={isGalleryOpen}
        onOpenChange={setIsGalleryOpen}
        onSelect={handleImageSelect}
      />
    </div>
  );
}
