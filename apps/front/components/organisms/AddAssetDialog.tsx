"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FormField from "@/components/molecules/FormField";
import LoadingButton from "@/components/atoms/LoadingButton";
import { AssetService } from "@/lib/services/thingsboardServices/assetService";
import type {
  AssetProfileInfo,
  CreateAssetRequest,
  CustomerInfo,
} from "@/types/thingsboardAssetTypes";

export interface AddAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateAssetRequest) => Promise<void>;
  isLoading?: boolean;
}

const DEFAULT_PROFILE_NAME = "default";

export function AddAssetDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: AddAssetDialogProps) {
  const [profiles, setProfiles] = useState<AssetProfileInfo[]>([]);
  const [customers, setCustomers] = useState<CustomerInfo[]>([]);
  const [isBootstrapLoading, setIsBootstrapLoading] = useState(false);

  const [profileSearch, setProfileSearch] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const [formData, setFormData] = useState<CreateAssetRequest>({
    name: "",
    label: "",
    assetProfileId: "",
    customerId: "",
    description: "",
  });

  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      setIsBootstrapLoading(true);
      try {
        const [profileInfos, customerInfos] = await Promise.all([
          AssetService.getAssetProfileInfos(0, 100, "name", "ASC"),
          AssetService.getCustomers(0, 50, "title", "ASC"),
        ]);

        setProfiles(profileInfos.data);
        setCustomers(customerInfos.data);

        const defaultProfile =
          profileInfos.data.find((p) => p.name === DEFAULT_PROFILE_NAME) ??
          profileInfos.data[0];

        const publicCustomer = customerInfos.data.find(
          (customer) => customer.additionalInfo?.isPublic,
        );

        setFormData((prev) => ({
          ...prev,
          assetProfileId: prev.assetProfileId || defaultProfile?.id?.id || "",
          customerId:
            prev.customerId ||
            publicCustomer?.id?.id ||
            customerInfos.data[0]?.id?.id ||
            "",
        }));

        if (defaultProfile) {
          setProfileSearch(defaultProfile.name);
        }
      } finally {
        setIsBootstrapLoading(false);
      }
    };

    loadData();
  }, [open]);

  const filteredProfiles = useMemo(() => {
    const query = profileSearch.trim().toLowerCase();
    if (!query) return profiles;
    return profiles.filter((p) => p.name.toLowerCase().includes(query));
  }, [profileSearch, profiles]);

  const canSubmit = useMemo(() => {
    return (
      !!formData.name.trim() &&
      !!formData.assetProfileId &&
      !isLoading &&
      !isBootstrapLoading
    );
  }, [formData, isLoading, isBootstrapLoading]);

  const handleInputChange = (
    field: keyof CreateAssetRequest,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    try {
      await onSubmit({
        name: formData.name.trim(),
        label: formData.label?.trim() || "",
        assetProfileId: formData.assetProfileId,
        customerId: formData.customerId,
        description: formData.description?.trim() || "",
      });

      setFormData({
        name: "",
        label: "",
        assetProfileId: "",
        customerId: "",
        description: "",
      });
      setProfileSearch("");
      onOpenChange(false);
    } catch {
      // Error is handled by parent via toast.
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(560px,calc(100vw-2rem))] max-w-140">
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <FormField
            label="Name"
            name="name"
            type="text"
            placeholder="Asset name"
            value={formData.name}
            onChange={(event) => handleInputChange("name", event.target.value)}
            required
          />

          <FormField
            label="Label"
            name="label"
            type="text"
            placeholder="Optional label"
            value={formData.label || ""}
            onChange={(event) => handleInputChange("label", event.target.value)}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Asset profile</label>
            <div className="relative">
              <input
                type="text"
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={profileSearch}
                onChange={(e) => {
                  setProfileSearch(e.target.value);
                  setProfileMenuOpen(true);
                  handleInputChange("assetProfileId", "");
                }}
                onFocus={() => setProfileMenuOpen(true)}
                onBlur={() => {
                  setTimeout(() => setProfileMenuOpen(false), 150);
                }}
                placeholder={
                  isBootstrapLoading
                    ? "Loading profiles..."
                    : "Select or type profile name"
                }
                disabled={isBootstrapLoading}
              />
              {profileMenuOpen && filteredProfiles.length > 0 && (
                <div className="absolute z-50 mt-1 w-full max-h-44 overflow-y-auto rounded-md border border-border bg-popover shadow-md">
                  {filteredProfiles.map((profile) => (
                    <button
                      key={profile.id?.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setProfileSearch(profile.name);
                        handleInputChange(
                          "assetProfileId",
                          profile.id?.id ?? "",
                        );
                        setProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      {profile.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Customer</label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={formData.customerId}
              onChange={(event) =>
                handleInputChange("customerId", event.target.value)
              }
              disabled={isBootstrapLoading}
            >
              <option value="">No customer</option>
              {customers.map((customer) => (
                <option key={customer.id?.id} value={customer.id?.id}>
                  {customer.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Optional description"
              value={formData.description || ""}
              onChange={(event) =>
                handleInputChange("description", event.target.value)
              }
            />
          </div>

          <div className="flex justify-end pt-2">
            <LoadingButton
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              isLoading={isLoading || isBootstrapLoading}
              textBeforeClick="Create Asset"
              textAfterClick="Creating..."
              disabled={!canSubmit}
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
