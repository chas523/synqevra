"use client";

import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FormField from '@/components/molecules/FormField';
import LoadingButton from '@/components/atoms/LoadingButton';
import { AssetService } from '@/lib/services/thingsboardServices/assetService';
import type {
  AssetProfileInfo,
  CreateAssetRequest,
  CustomerInfo,
} from '@/types/thingsboardAssetTypes';

export interface AddAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateAssetRequest) => Promise<void>;
  isLoading?: boolean;
}

const DEFAULT_PROFILE_NAME = 'default';

export function AddAssetDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: AddAssetDialogProps) {
  const [profiles, setProfiles] = useState<AssetProfileInfo[]>([]);
  const [customers, setCustomers] = useState<CustomerInfo[]>([]);
  const [isBootstrapLoading, setIsBootstrapLoading] = useState(false);

  const [formData, setFormData] = useState<CreateAssetRequest>({
    name: '',
    label: '',
    assetProfileId: '',
    customerId: '',
    description: '',
  });

  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      setIsBootstrapLoading(true);
      try {
        const [defaultProfile, profileInfos, customerInfos] = await Promise.all([
          AssetService.getAssetProfileInfoByName(DEFAULT_PROFILE_NAME),
          AssetService.getAssetProfileInfos(0, 10, 'name', 'ASC', DEFAULT_PROFILE_NAME),
          AssetService.getCustomers(0, 50, 'title', 'ASC'),
        ]);

        const mergedProfiles = profileInfos.data.some(
          (profile) => profile.id?.id === defaultProfile.id?.id
        )
          ? profileInfos.data
          : [defaultProfile, ...profileInfos.data];

        setProfiles(mergedProfiles);
        setCustomers(customerInfos.data);

        const publicCustomer = customerInfos.data.find(
          (customer) => customer.additionalInfo?.isPublic
        );

        setFormData((prev) => ({
          ...prev,
          assetProfileId:
            prev.assetProfileId || defaultProfile.id?.id || mergedProfiles[0]?.id?.id || '',
          customerId:
            prev.customerId || publicCustomer?.id?.id || customerInfos.data[0]?.id?.id || '',
        }));
      } finally {
        setIsBootstrapLoading(false);
      }
    };

    loadData();
  }, [open]);

  const canSubmit = useMemo(() => {
    return (
      !!formData.name.trim() &&
      !!formData.assetProfileId &&
      !!formData.customerId &&
      !isLoading &&
      !isBootstrapLoading
    );
  }, [formData, isLoading, isBootstrapLoading]);

  const handleInputChange = (field: keyof CreateAssetRequest, value: string) => {
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
        label: formData.label?.trim() || '',
        assetProfileId: formData.assetProfileId,
        customerId: formData.customerId,
        description: formData.description?.trim() || '',
      });

      setFormData({
        name: '',
        label: '',
        assetProfileId: '',
        customerId: '',
        description: '',
      });
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
            onChange={(event) => handleInputChange('name', event.target.value)}
            required
          />

          <FormField
            label="Label"
            name="label"
            type="text"
            placeholder="Optional label"
            value={formData.label || ''}
            onChange={(event) => handleInputChange('label', event.target.value)}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Asset profile</label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={formData.assetProfileId}
              onChange={(event) => handleInputChange('assetProfileId', event.target.value)}
              required
              disabled={isBootstrapLoading}
            >
              <option value="" disabled>
                Select asset profile
              </option>
              {profiles.map((profile) => (
                <option key={profile.id?.id} value={profile.id?.id}>
                  {profile.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Customer</label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={formData.customerId}
              onChange={(event) => handleInputChange('customerId', event.target.value)}
              required
              disabled={isBootstrapLoading}
            >
              <option value="" disabled>
                Select customer
              </option>
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
              value={formData.description || ''}
              onChange={(event) => handleInputChange('description', event.target.value)}
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
