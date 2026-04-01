"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { ImageIcon, Link2, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { AssetService } from "@/lib/services/thingsboardServices/assetService";
import { DeviceService } from "@/lib/services/thingsboardServices/deviceService";
import type { Queue } from "@/types/queueTypes";
import { getImagePreviewUrl } from "@/lib/utils";
import { CopyButton } from "@/components/molecules/CopyButton";
import { DeviceProfileImageGalleryDialog } from "@/components/organisms/DeviceProfileImageGalleryDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Select from "@/components/ui/select";
import { SettingsService } from "@/lib/services/thingsboardServices/settingsService";

interface AssetProfileDetailsTabContentProps {
  profileId: string;
}

type DetailsFormState = {
  name: string;
  description: string;
  image: string;
  defaultQueueName: string;
  defaultRuleChainId: string;
  defaultEdgeRuleChainId: string;
};

const formatDate = (timestamp?: number) => {
  if (!timestamp) {
    return "-";
  }

  return new Date(timestamp).toLocaleString();
};

const toFormState = (profile: any): DetailsFormState => ({
  name: profile.name || "",
  description: profile.description || "",
  image: profile.image || "",
  defaultQueueName: profile.defaultQueueName || "",
  defaultRuleChainId: profile.defaultRuleChainId?.id || "",
  defaultEdgeRuleChainId: profile.defaultEdgeRuleChainId?.id || "",
});

const ImagePreview = ({ src, alt }: { src?: string; alt: string }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return <ImageIcon className="h-5 w-5 text-muted-foreground" />;
  }

  return (
    <img
      src={getImagePreviewUrl(src)}
      alt={alt}
      className="h-full w-full object-cover"
      onError={() => setHasError(true)}
    />
  );
};

export function AssetProfileDetailsTabContent({
  profileId,
}: AssetProfileDetailsTabContentProps) {
  const {
    data: profile,
    isLoading,
    mutate,
  } = useSWR(profileId ? ["assetProfileDetails", profileId] : null, async () =>
    AssetService.fetchAssetProfile(profileId),
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<DetailsFormState | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<"none" | "link">("none");
  const [originalForm, setOriginalForm] = useState<DetailsFormState | null>(
    null,
  );
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

  const defaultQueueName = form?.defaultQueueName.trim() ?? "";
  const defaultRuleChainId = form?.defaultRuleChainId.trim() ?? "";
  const defaultEdgeRuleChainId = form?.defaultEdgeRuleChainId.trim() ?? "";

  const { data: defaultQueue, isLoading: isLoadingDefaultQueue } = useSWR(
    !isEditing && defaultQueueName
      ? ["assetProfileDefaultQueueByName", defaultQueueName]
      : null,
    async () => SettingsService.getQueueByName(defaultQueueName),
  );

  const { data: defaultRuleChain, isLoading: isLoadingDefaultRuleChain } =
    useSWR(
      !isEditing && defaultRuleChainId
        ? ["assetProfileDefaultRuleChainById", defaultRuleChainId]
        : null,
      async () => DeviceService.getRuleChainById(defaultRuleChainId),
    );

  const {
    data: defaultEdgeRuleChain,
    isLoading: isLoadingDefaultEdgeRuleChain,
  } = useSWR(
    !isEditing && defaultEdgeRuleChainId
      ? ["assetProfileDefaultEdgeRuleChainById", defaultEdgeRuleChainId]
      : null,
    async () => DeviceService.getRuleChainById(defaultEdgeRuleChainId),
  );

  useEffect(() => {
    if (!profile) {
      return;
    }

    const nextForm = toFormState(profile);
    setForm(nextForm);
    setOriginalForm(nextForm);
    setGalleryOpen(false);
    setImageInputMode("none");
    setIsEditing(false);
  }, [profile]);

  const loadCoreRuleChains = async () => {
    if (hasLoadedCoreRuleChains || isLoadingCoreRuleChains) {
      return;
    }

    try {
      setIsLoadingCoreRuleChains(true);
      const response = await DeviceService.getRuleChains("CORE");
      setCoreRuleChains(response);
      setHasLoadedCoreRuleChains(true);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to load rule chains",
      );
    } finally {
      setIsLoadingCoreRuleChains(false);
    }
  };

  const loadEdgeRuleChains = async () => {
    if (hasLoadedEdgeRuleChains || isLoadingEdgeRuleChains) {
      return;
    }

    try {
      setIsLoadingEdgeRuleChains(true);
      const response = await DeviceService.getRuleChains("EDGE");
      setEdgeRuleChains(response);
      setHasLoadedEdgeRuleChains(true);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to load edge rule chains",
      );
    } finally {
      setIsLoadingEdgeRuleChains(false);
    }
  };

  const loadQueues = async () => {
    if (hasLoadedQueues || isLoadingQueues) {
      return;
    }

    try {
      setIsLoadingQueues(true);
      const response = await SettingsService.getQueues(0, 50, "name", "ASC");
      setQueues(response.data ?? []);
      setHasLoadedQueues(true);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load queues");
    } finally {
      setIsLoadingQueues(false);
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

  const hasChanges = useMemo(() => {
    if (!form || !originalForm) {
      return false;
    }

    return JSON.stringify(form) !== JSON.stringify(originalForm);
  }, [form, originalForm]);

  const handleCancel = () => {
    if (!originalForm) {
      return;
    }

    setForm(originalForm);
    setGalleryOpen(false);
    setImageInputMode("none");
    setIsEditing(false);
  };

  const clearImage = () => {
    setForm((prev) => (prev ? { ...prev, image: "" } : prev));
    setImageInputMode("none");
  };

  const renderImageEditor = (currentForm: DetailsFormState) => {
    const hasSelectedImage = Boolean(currentForm.image?.trim());

    if (!hasSelectedImage && imageInputMode !== "link") {
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setGalleryOpen(true)}
            disabled={isSaving}
            className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-4 text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ImageIcon className="h-6 w-6" />
            Choose from gallery
          </button>

          <button
            type="button"
            onClick={() => setImageInputMode("link")}
            disabled={isSaving}
            className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-4 text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Link2 className="h-6 w-6" />
            Set image link
          </button>
        </div>
      );
    }

    if (imageInputMode === "link") {
      return (
        <div className="grid gap-3 md:grid-cols-[104px_minmax(0,1fr)_auto] md:items-end">
          <div className="flex h-26.5 items-center justify-center overflow-hidden rounded-md border bg-muted/20">
            {currentForm.image ? (
              <ImagePreview src={currentForm.image} alt="Asset profile" />
            ) : (
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="asset-profile-details-image-link"
              className="text-sm font-medium"
            >
              Image link
            </label>
            <Input
              id="asset-profile-details-image-link"
              value={currentForm.image}
              onChange={(event) =>
                setForm((prev) =>
                  prev ? { ...prev, image: event.target.value } : prev,
                )
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
              disabled={isSaving && !currentForm.image}
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
          <ImagePreview src={currentForm.image} alt="Asset profile" />
        </div>

        <div className="min-w-0 rounded-md border p-4">
          <div className="truncate text-sm font-medium">Selected image</div>
          <div className="mt-1 truncate text-sm text-muted-foreground">
            {currentForm.image}
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

  const handleSave = async () => {
    if (!profile || !form) {
      return;
    }

    const name = form.name.trim();
    if (!name) {
      toast.error("Profile name is required");
      return;
    }

    const payload = {
      ...profile,
      name,
      description: form.description.trim() || null,
      image: form.image.trim() || null,
      defaultQueueName: form.defaultQueueName.trim() || null,
      defaultRuleChainId: form.defaultRuleChainId.trim()
        ? {
            entityType: "RULE_CHAIN",
            id: form.defaultRuleChainId.trim(),
          }
        : null,
      defaultEdgeRuleChainId: form.defaultEdgeRuleChainId.trim()
        ? {
            entityType: "RULE_CHAIN",
            id: form.defaultEdgeRuleChainId.trim(),
          }
        : null,
    };

    setIsSaving(true);
    try {
      const saved = await AssetService.saveAssetProfile(payload);
      await mutate(saved, false);
      const nextForm = toFormState(saved);
      setForm(nextForm);
      setOriginalForm(nextForm);
      toast.success("Profile details updated");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update details");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!profile || !form) {
    return (
      <div className="p-4 text-center text-slate-500">
        Asset profile details not found.
      </div>
    );
  }

  const currentForm = form;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-2">
        {!isEditing ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsEditing(true);
              void loadCoreRuleChains();
              void loadEdgeRuleChains();
              void loadQueues();
            }}
          >
            Edit
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">
            General
          </h3>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium ml-1">
              Name
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm">
                {isEditing ? (
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      setForm((prev) =>
                        prev ? { ...prev, name: event.target.value } : prev,
                      )
                    }
                    className="w-full bg-transparent outline-none"
                    disabled={isSaving}
                  />
                ) : (
                  profile.name || "-"
                )}
              </div>
              <CopyButton
                value={profile.name || ""}
                size="icon"
                variant="ghost"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium ml-1">
              Profile ID
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-600 break-all">
                {profile.id?.id || "-"}
              </div>
              <CopyButton
                value={profile.id?.id || ""}
                size="icon"
                variant="ghost"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium ml-1">
              Description
            </label>
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm">
              {isEditing ? (
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) =>
                      prev
                        ? { ...prev, description: event.target.value }
                        : prev,
                    )
                  }
                  rows={3}
                  placeholder="Optional description"
                  className="w-full bg-transparent outline-none resize-none"
                  disabled={isSaving}
                />
              ) : (
                profile.description || "-"
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium ml-1">
              Image
            </label>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
              {isEditing ? (
                renderImageEditor(currentForm)
              ) : currentForm.image ? (
                <div className="grid gap-3 md:grid-cols-[104px_minmax(0,1fr)] md:items-center">
                  <div className="flex h-26.5 items-center justify-center overflow-hidden rounded-md border bg-muted/20">
                    <ImagePreview src={currentForm.image} alt="Asset profile" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium">Selected image</div>
                    <div className="mt-1 truncate text-sm text-muted-foreground">
                      {currentForm.image}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">-</div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium ml-1">
              Created time
            </label>
            <div className="text-sm text-slate-700 ml-1">
              {formatDate(profile.createdTime)}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">
            Configuration
          </h3>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium ml-1">
              Type
            </label>
            <div className="text-sm text-slate-700 ml-1">
              {profile.type || "-"}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium ml-1">
              Default rule chain
            </label>
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm">
              {isEditing ? (
                <Select
                  value={form.defaultRuleChainId}
                  onValueChange={(value) =>
                    setForm((prev) =>
                      prev ? { ...prev, defaultRuleChainId: value } : prev,
                    )
                  }
                  options={coreRuleChainOptions}
                  onOpenChange={(open) => {
                    if (open) {
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
              ) : defaultRuleChainId ? (
                isLoadingDefaultRuleChain ? (
                  "Loading..."
                ) : (
                  defaultRuleChain?.name || "-"
                )
              ) : (
                "-"
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium ml-1">
              Default queue
            </label>
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm">
              {isEditing ? (
                <Select
                  value={form.defaultQueueName}
                  onValueChange={(value) =>
                    setForm((prev) =>
                      prev ? { ...prev, defaultQueueName: value } : prev,
                    )
                  }
                  options={queueOptions}
                  onOpenChange={(open) => {
                    if (open) {
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
              ) : defaultQueueName ? (
                isLoadingDefaultQueue ? (
                  "Loading..."
                ) : (
                  defaultQueue?.name || "-"
                )
              ) : (
                "-"
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium ml-1">
              Default edge rule chain
            </label>
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm">
              {isEditing ? (
                <Select
                  value={form.defaultEdgeRuleChainId}
                  onValueChange={(value) =>
                    setForm((prev) =>
                      prev ? { ...prev, defaultEdgeRuleChainId: value } : prev,
                    )
                  }
                  options={edgeRuleChainOptions}
                  onOpenChange={(open) => {
                    if (open) {
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
              ) : defaultEdgeRuleChainId ? (
                isLoadingDefaultEdgeRuleChain ? (
                  "Loading..."
                ) : (
                  defaultEdgeRuleChain?.name || "-"
                )
              ) : (
                "-"
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium ml-1">
              Default profile
            </label>
            <div className="text-sm text-slate-700 ml-1">
              {profile.default ? "Yes" : "No"}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium ml-1">
              Version
            </label>
            <div className="text-sm text-slate-700 ml-1">
              {String(profile.version ?? "-")}
            </div>
          </div>
        </div>
      </div>

      <DeviceProfileImageGalleryDialog
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        onSelect={(imageLink) => {
          setForm((prev) => (prev ? { ...prev, image: imageLink } : prev));
          setImageInputMode("none");
        }}
      />
    </div>
  );
}
