"use client";

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { AddAssetDialog } from '@/components/organisms/AddAssetDialog';
import { AssetDetailPanel } from '@/components/organisms/AssetDetailPanel';
import { EntitiesAssetsTable } from '@/components/organisms/EntitiesAssetsTable';
import { useEntityAssets } from '@/hooks/thingsboard/asset/useEntityAssets';
import { AssetService } from '@/lib/services/thingsboardServices/assetService';
import type { Asset, CreateAssetRequest } from '@/types/thingsboardAssetTypes';

const PAGE_SIZE = 10;

export const EntitiesAssetsPage = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortProperty, setSortProperty] = useState('createdTime');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [addAssetOpen, setAddAssetOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const { assets, totalPages, totalElements, isLoading, mutate } =
    useEntityAssets(currentPage, PAGE_SIZE, sortProperty, sortOrder);

  const handleAddAssetSubmit = useCallback(
    async (payload: CreateAssetRequest) => {
      try {
        await AssetService.createAsset(payload);
        toast.success(`Asset "${payload.name}" created successfully`);
        setAddAssetOpen(false);
        mutate();
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to create asset');
        throw error;
      }
    },
    [mutate]
  );

  const handleSortChange = useCallback(
    (property: string, order: 'ASC' | 'DESC') => {
      setSortProperty(property);
      setSortOrder(order);
      setCurrentPage(0);
    },
    []
  );

  const handleMakePublic = useCallback(
    async (asset: Asset) => {
      try {
        const response = await AssetService.makeAssetPublic(asset.id?.id ?? '');

        if (
          typeof response === 'object' &&
          response !== null &&
          'info' in response &&
          response.info
        ) {
          toast.info(response.message || `"${asset.name}" is already public`);
        } else {
          toast.success(`"${asset.name}" is now public`);
        }

        mutate();
      } catch (error: any) {
        toast.info(error?.response?.data?.message || 'Asset public state unchanged');
      }
    },
    [mutate]
  );

  const handleMakePrivate = useCallback(
    async (asset: Asset) => {
      try {
        const response = await AssetService.makeAssetPrivate(asset.id?.id ?? '');

        if (
          typeof response === 'object' &&
          response !== null &&
          'info' in response &&
          response.info
        ) {
          toast.info(response.message || `"${asset.name}" is already private`);
        } else {
          toast.success(`"${asset.name}" is now private`);
        }

        mutate();
      } catch (error: any) {
        toast.info(error?.response?.data?.message || 'Asset private state unchanged');
      }
    },
    [mutate]
  );

  const handleDelete = useCallback(
    async (asset: Asset) => {
      try {
        await AssetService.deleteAsset(asset.id?.id ?? '');
        toast.success(`"${asset.name}" deleted`);
        mutate();
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to delete asset');
      }
    },
    [mutate]
  );

  return (
    <>
      <EntitiesAssetsTable
        assets={assets}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={PAGE_SIZE}
        sortProperty={sortProperty}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onPageChange={setCurrentPage}
        onRefresh={() => mutate()}
        onAdd={() => setAddAssetOpen(true)}
        onRowClick={(asset) => setSelectedAsset(asset)}
        onMakePublic={handleMakePublic}
        onMakePrivate={handleMakePrivate}
        onDelete={handleDelete}
      />

      <AddAssetDialog
        open={addAssetOpen}
        onOpenChange={setAddAssetOpen}
        onSubmit={handleAddAssetSubmit}
      />

      <AssetDetailPanel
        asset={selectedAsset}
        isOpen={!!selectedAsset}
        onClose={() => setSelectedAsset(null)}
        onRefresh={() => mutate()}
      />
    </>
  );
};
