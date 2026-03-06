"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CopyButton } from "@/components/molecules/CopyButton";
import { AssetService, type AssetDetails } from "@/lib/services/thingsboardServices/assetService";

interface AssetDetailsTabContentProps {
  assetId: string;
}

interface AssetDetailsFormState {
  name: string;
  label: string;
  description: string;
  assetProfileId: string;
}

function toFormState(asset: AssetDetails): AssetDetailsFormState {
  return {
    name: asset.name || "",
    label: asset.label || "",
    description: asset.additionalInfo?.description || "",
    assetProfileId: asset.assetProfileId?.id || "",
  };
}

export function AssetDetailsTabContent({ assetId }: AssetDetailsTabContentProps) {
  const { data: asset, isLoading, mutate } = useSWR(
    assetId ? ["assetDetails", assetId] : null,
    async () => AssetService.fetchAsset(assetId)
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<AssetDetailsFormState | null>(null);
  const [originalForm, setOriginalForm] = useState<AssetDetailsFormState | null>(null);

  useEffect(() => {
    if (!asset) return;
    const nextForm = toFormState(asset);
    setForm(nextForm);
    setOriginalForm(nextForm);
    setIsEditing(false);
  }, [asset]);

  const { data: profileInfosResponse } = useSWR(
    asset ? ["assetProfileInfosForAssetDetails"] : null,
    async () => AssetService.getAssetProfileInfos(0, 100)
  );

  const profileInfos = profileInfosResponse?.data ?? [];

  const hasChanges = useMemo(() => {
    if (!form || !originalForm) return false;
    return JSON.stringify(form) !== JSON.stringify(originalForm);
  }, [form, originalForm]);

  const handleCancel = () => {
    if (!originalForm) return;
    setForm(originalForm);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!asset || !form) return;

    if (!form.name.trim()) {
      toast.error("Asset name is required");
      return;
    }

    if (!form.assetProfileId) {
      toast.error("Asset profile is required");
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<AssetDetails> = {
        ...asset,
        name: form.name.trim(),
        label: form.label.trim() || null,
        assetProfileId: {
          entityType: "ASSET_PROFILE",
          id: form.assetProfileId,
        },
        additionalInfo: {
          ...(asset.additionalInfo || {}),
          description: form.description.trim(),
        },
      };

      const saved = await AssetService.updateAsset(assetId, payload);
      const nextForm = toFormState(saved);
      await mutate(saved, false);
      setForm(nextForm);
      setOriginalForm(nextForm);
      setIsEditing(false);
      toast.success("Asset details updated successfully");
    } catch {
      toast.error("Failed to update asset details");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!asset) {
    return <div className="p-4 text-center text-slate-500">Asset details not found.</div>;
  }

  if (!form) {
    return <div className="p-4 text-center text-slate-500">Preparing asset details...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-2">
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
          >
            Edit
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-md bg-cyan-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-60"
              disabled={isSaving || !hasChanges}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="border-b pb-2 text-sm font-semibold text-slate-900">General Info</h3>

          <div className="space-y-1">
            <label className="ml-1 text-xs font-medium text-slate-500">Asset Name</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-white/10 dark:bg-white/5">
                {isEditing ? (
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      setForm((prev) => (prev ? { ...prev, name: event.target.value } : prev))
                    }
                    className="w-full bg-transparent outline-none"
                  />
                ) : (
                  asset.name
                )}
              </div>
              <CopyButton value={asset.name} size="icon" variant="ghost" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="ml-1 text-xs font-medium text-slate-500">Asset ID</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-mono text-sm text-slate-600 dark:border-white/10 dark:bg-white/5">
                {asset.id?.id}
              </div>
              <CopyButton value={asset.id?.id ?? ""} size="icon" variant="ghost" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="ml-1 text-xs font-medium text-slate-500">Label</label>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-white/10 dark:bg-white/5">
              {isEditing ? (
                <input
                  type="text"
                  value={form.label}
                  onChange={(event) =>
                    setForm((prev) => (prev ? { ...prev, label: event.target.value } : prev))
                  }
                  placeholder="Optional label"
                  className="w-full bg-transparent outline-none"
                />
              ) : (
                asset.label || "-"
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="ml-1 text-xs font-medium text-slate-500">Description</label>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-white/10 dark:bg-white/5">
              {isEditing ? (
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) =>
                      prev ? { ...prev, description: event.target.value } : prev
                    )
                  }
                  rows={3}
                  placeholder="Optional description"
                  className="w-full resize-none bg-transparent outline-none"
                />
              ) : (
                asset.additionalInfo?.description || "-"
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="border-b pb-2 text-sm font-semibold text-slate-900">Profile</h3>

          <div className="space-y-1">
            <label className="ml-1 text-xs font-medium text-slate-500">Asset Profile</label>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-white/10 dark:bg-white/5">
              {isEditing ? (
                <select
                  value={form.assetProfileId}
                  onChange={(event) =>
                    setForm((prev) =>
                      prev ? { ...prev, assetProfileId: event.target.value } : prev
                    )
                  }
                  className="w-full bg-transparent outline-none"
                >
                  {profileInfos.map((profile) => (
                    <option key={profile.id.id} value={profile.id.id}>
                      {profile.name}
                    </option>
                  ))}
                </select>
              ) : (
                asset.assetProfileName || "-"
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label className="ml-1 text-xs font-medium text-slate-500">Created At</label>
              <div className="ml-1 text-sm text-slate-700">
                {asset.createdTime ? new Date(asset.createdTime).toLocaleString() : "-"}
              </div>
            </div>

            <div className="space-y-1">
              <label className="ml-1 text-xs font-medium text-slate-500">Type</label>
              <div className="ml-1 text-sm text-slate-700">{asset.type || "-"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
