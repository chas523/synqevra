"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Select from "@/components/ui/select";
import { FileDropzone } from "@/components/molecules/FileDropzone";
import {
  ResourceType,
  ResourceCreateRequest,
  RESOURCE_TYPE_OPTIONS,
} from "@/types/resourceTypes";
import { HelpCircle } from "lucide-react";

interface AddResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (resource: ResourceCreateRequest) => Promise<void>;
  isSaving: boolean;
}

export const AddResourceDialog = ({
  open,
  onOpenChange,
  onAdd,
  isSaving,
}: AddResourceDialogProps) => {
  const [resourceType, setResourceType] = useState<ResourceType>("LWM2M_MODEL");
  const [title, setTitle] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const selectedTypeOption = RESOURCE_TYPE_OPTIONS.find(
    (o) => o.value === resourceType,
  );

  const handleFilesSelected = useCallback((files: File[]) => {
    setSelectedFiles(files);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleResourceTypeChange = (value: string) => {
    setResourceType(value as ResourceType);
    setSelectedFiles([]);
    setTitle("");
  };

  const handleClose = () => {
    setResourceType("LWM2M_MODEL");
    setTitle("");
    setSelectedFiles([]);
    onOpenChange(false);
  };

  const handleAdd = async () => {
    if (selectedFiles.length === 0) return;

    const file = selectedFiles[0];
    const reader = new FileReader();

    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];

      const resource: ResourceCreateRequest = {
        title: selectedTypeOption?.requiresTitle
          ? title
          : file.name.split(".")[0],
        resourceType,
        fileName: file.name,
        data: base64,
      };

      try {
        await onAdd(resource);
        handleClose();
      } catch (error) {
        // Error is handled in the parent
      }
    };

    reader.readAsDataURL(file);
  };

  const isValid =
    selectedFiles.length > 0 &&
    (!selectedTypeOption?.requiresTitle || title.trim() !== "");

  const acceptedExtensions =
    selectedTypeOption?.acceptedExtensions.join(",") || "";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-black dark:text-white">
            Add resource
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-black dark:text-white">Resource type*</Label>
            <Select
              value={resourceType}
              onValueChange={handleResourceTypeChange}
              options={RESOURCE_TYPE_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              placeholder="Select resource type"
            />
          </div>

          {selectedTypeOption?.requiresTitle && (
            <div className="space-y-2">
              <Label className="text-black dark:text-white">Title*</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-black dark:text-white">
              {resourceType === "LWM2M_MODEL"
                ? "Resource files*"
                : "Resource file*"}
            </Label>
            <FileDropzone
              accept={acceptedExtensions}
              multiple={resourceType === "LWM2M_MODEL"}
              onFilesSelected={handleFilesSelected}
              selectedFiles={selectedFiles}
              onRemoveFile={handleRemoveFile}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={handleClose}
            className="text-black dark:text-white dark:bg-slate-800"
          >
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!isValid || isSaving}>
            {isSaving ? "Adding..." : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
