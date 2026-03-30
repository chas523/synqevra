"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, Link2, Loader2, X } from "lucide-react";
import { DeviceProfileImageGalleryDialog } from "@/components/organisms/DeviceProfileImageGalleryDialog";
import { cn, getImagePreviewUrl } from "@/lib/utils";
import { DeviceService } from "@/lib/services/thingsboardServices/deviceService";
import { SettingsService } from "@/lib/services/thingsboardServices/settingsService";
import type { Queue } from "@/types/queueTypes";
import Select from "@/components/ui/select";
import type { CreateAssetProfileRequest } from "@/lib/services/thingsboardServices/assetService";

type FormState = {
  name: string;
  image: string;
  defaultRuleChainId: string;
  defaultQueueName: string;
  defaultEdgeRuleChainId: string;
  description: string;
};

const INITIAL_FORM: FormState = {
  name: "",
  image: "",
  defaultRuleChainId: "",
  defaultQueueName: "",
  defaultEdgeRuleChainId: "",
  description: "",
};

export interface AddAssetProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateAssetProfileRequest) => Promise<void>;
}

export function AddAssetProfileDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddAssetProfileDialogProps) {
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM);
  const [coreRuleChains, setCoreRuleChains] = useState<
    Awaited<ReturnType<typeof DeviceService.getRuleChains>>
  >([]);
  const [edgeRuleChains, setEdgeRuleChains] = useState<
    Awaited<ReturnType<typeof DeviceService.getRuleChains>>
  >([]);
  const [queues, setQueues] = useState<Queue[]>([]);
  const [hasLoadedCoreRuleChains, setHasLoadedCoreRuleChains] = useState(false);
  const [hasLoadedEdgeRuleChains, setHasLoadedEdgeRuleChains] = useState(false);
  const [hasLoadedQueues, setHasLoadedQueues] = useState(false);
  const [isLoadingCoreRuleChains, setIsLoadingCoreRuleChains] = useState(false);
  const [isLoadingEdgeRuleChains, setIsLoadingEdgeRuleChains] = useState(false);
  const [isLoadingQueues, setIsLoadingQueues] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<"none" | "link">("none");
  const openRef = useRef(open);

  openRef.current = open;

  useEffect(() => {
    if (!open) {
      setFormState(INITIAL_FORM);
      setCoreRuleChains([]);
      setEdgeRuleChains([]);
      setQueues([]);
      setHasLoadedCoreRuleChains(false);
      setHasLoadedEdgeRuleChains(false);
      setHasLoadedQueues(false);
      setIsLoadingCoreRuleChains(false);
      setIsLoadingEdgeRuleChains(false);
      setIsLoadingQueues(false);
      setIsSaving(false);
      setGalleryOpen(false);
      setImageInputMode("none");
    }
  }, [open]);

  const loadCoreRuleChains = async () => {
    if (hasLoadedCoreRuleChains || isLoadingCoreRuleChains) {
      return;
    }

    try {
      setIsLoadingCoreRuleChains(true);
      const response = await DeviceService.getRuleChains("CORE");

      if (!openRef.current) {
        return;
      }

      setCoreRuleChains(response);
      setHasLoadedCoreRuleChains(true);
    } finally {
      if (openRef.current) {
        setIsLoadingCoreRuleChains(false);
      }
    }
  };

  const loadEdgeRuleChains = async () => {
    if (hasLoadedEdgeRuleChains || isLoadingEdgeRuleChains) {
      return;
    }

    try {
      setIsLoadingEdgeRuleChains(true);
      const response = await DeviceService.getRuleChains("EDGE");

      if (!openRef.current) {
        return;
      }

      setEdgeRuleChains(response);
      setHasLoadedEdgeRuleChains(true);
    } finally {
      if (openRef.current) {
        setIsLoadingEdgeRuleChains(false);
      }
    }
  };

  const loadQueues = async () => {
    if (hasLoadedQueues || isLoadingQueues) {
      return;
    }

    try {
      setIsLoadingQueues(true);
      const response = await SettingsService.getQueues(0, 50, "name", "ASC");

      if (!openRef.current) {
        return;
      }

      setQueues(response.data ?? []);
      setHasLoadedQueues(true);
    } finally {
      if (openRef.current) {
        setIsLoadingQueues(false);
      }
    }
  };

  const coreRuleChainOptions = useMemo(
    () =>
      coreRuleChains.map((ruleChain) => ({
        value: ruleChain.id.id,
        label: ruleChain.name,
      })),
    [coreRuleChains],
  );

  const edgeRuleChainOptions = useMemo(
    () =>
      edgeRuleChains.map((ruleChain) => ({
        value: ruleChain.id.id,
        label: ruleChain.name,
      })),
    [edgeRuleChains],
  );

  const queueOptions = useMemo(
    () =>
      queues.map((queue) => ({
        value: queue.name,
        label: queue.name,
        description: `Submit Strategy: ${queue.submitStrategy.type}, Processing Strategy: ${queue.processingStrategy.type}`,
      })),
    [queues],
  );

  const clearImage = () => {
    setFormState((prev) => ({ ...prev, image: "" }));
    setImageInputMode("none");
  };

  const hasSelectedImage = Boolean(formState.image.trim());

  const renderImagePreview = () => {
    if (!hasSelectedImage && imageInputMode !== "link") {
      return (
        <div className="grid gap-2 md:grid-cols-[104px_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex h-26.5 items-center justify-center rounded-md border bg-muted/20 p-4 text-center text-sm text-muted-foreground">
            No image selected
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setGalleryOpen(true)}
            className="flex h-26.5 flex-col items-center justify-center gap-3"
            disabled={isSaving}
          >
            <ImageIcon className="h-6 w-6" />
            <span>Browse from gallery</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setImageInputMode("link")}
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
                src={getImagePreviewUrl(formState.image)}
                alt="Asset profile"
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
              htmlFor="asset-profile-image-link"
              className="text-sm font-medium"
            >
              Image link
            </label>
            <Input
              id="asset-profile-image-link"
              value={formState.image}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, image: event.target.value }))
              }
              placeholder="https://example.com/image.png"
              disabled={isSaving}
            />
          </div>

          <div className="flex items-center gap-2 md:pb-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={clearImage}
              disabled={isSaving && !formState.image}
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
            src={getImagePreviewUrl(formState.image)}
            alt="Asset profile"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0 rounded-md border p-4">
          <div className="truncate text-sm font-medium">Selected image</div>
          <div className="mt-1 truncate text-sm text-muted-foreground">
            {formState.image}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setGalleryOpen(true)}
              disabled={isSaving}
            >
              Browse from gallery
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setImageInputMode("link")}
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
          onClick={clearImage}
          disabled={isSaving}
          className="text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const handleSubmit = async () => {
    if (!formState.name.trim()) {
      return;
    }

    const payload: CreateAssetProfileRequest = {
      name: formState.name.trim(),
      image: formState.image.trim() || null,
      defaultRuleChainId: formState.defaultRuleChainId
        ? {
            entityType: "RULE_CHAIN",
            id: formState.defaultRuleChainId,
          }
        : null,
      defaultDashboardId: null,
      defaultQueueName: formState.defaultQueueName || null,
      defaultEdgeRuleChainId: formState.defaultEdgeRuleChainId
        ? {
            entityType: "RULE_CHAIN",
            id: formState.defaultEdgeRuleChainId,
          }
        : null,
      description: formState.description.trim() || null,
    };

    try {
      setIsSaving(true);
      await onSubmit(payload);
      setFormState(INITIAL_FORM);
      setImageInputMode("none");
      onOpenChange(false);
    } catch {
      // handled by caller
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add asset profile</DialogTitle>
            <DialogDescription>
              Create a new asset profile and configure default behavior.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label
                className="text-sm font-medium"
                htmlFor="asset-profile-name"
              >
                Name*
              </label>
              <Input
                id="asset-profile-name"
                value={formState.name}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                placeholder="Enter asset profile name"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Default rule chain</label>
              <Select
                options={coreRuleChainOptions}
                value={formState.defaultRuleChainId}
                onValueChange={(value) =>
                  setFormState((prev) => ({
                    ...prev,
                    defaultRuleChainId: value,
                  }))
                }
                onOpenChange={(nextOpen) => {
                  if (nextOpen) {
                    void loadCoreRuleChains();
                  }
                }}
                placeholder={
                  isLoadingCoreRuleChains
                    ? "Loading rule chains..."
                    : "Select rule chain"
                }
                emptyMessage={
                  isLoadingCoreRuleChains
                    ? "Loading rule chains..."
                    : "No rule chains found"
                }
                allowClear
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Queue</label>
              <Select
                options={queueOptions}
                value={formState.defaultQueueName}
                onValueChange={(value) =>
                  setFormState((prev) => ({ ...prev, defaultQueueName: value }))
                }
                onOpenChange={(nextOpen) => {
                  if (nextOpen) {
                    void loadQueues();
                  }
                }}
                placeholder={
                  isLoadingQueues ? "Loading queues..." : "Select queue"
                }
                emptyMessage={
                  isLoadingQueues ? "Loading queues..." : "No queues found"
                }
                allowClear
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Default edge rule chain
              </label>
              <Select
                options={edgeRuleChainOptions}
                value={formState.defaultEdgeRuleChainId}
                onValueChange={(value) =>
                  setFormState((prev) => ({
                    ...prev,
                    defaultEdgeRuleChainId: value,
                  }))
                }
                onOpenChange={(nextOpen) => {
                  if (nextOpen) {
                    void loadEdgeRuleChains();
                  }
                }}
                placeholder={
                  isLoadingEdgeRuleChains
                    ? "Loading edge rule chains..."
                    : "Select edge rule chain"
                }
                emptyMessage={
                  isLoadingEdgeRuleChains
                    ? "Loading edge rule chains..."
                    : "No edge rule chains found"
                }
                allowClear
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Asset profile image</label>
              <div
                className={cn(
                  "rounded-lg border p-2",
                  imageInputMode === "link" && "pt-3",
                )}
              >
                {renderImagePreview()}
              </div>
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium"
                htmlFor="asset-profile-description"
              >
                Description
              </label>
              <Textarea
                id="asset-profile-description"
                value={formState.description}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="Add a short description"
                disabled={isSaving}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving || !formState.name.trim()}
              className="gap-2"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isSaving ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeviceProfileImageGalleryDialog
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        onSelect={(imageLink) => {
          setFormState((prev) => ({ ...prev, image: imageLink }));
          setImageInputMode("none");
        }}
      />
    </>
  );
}
