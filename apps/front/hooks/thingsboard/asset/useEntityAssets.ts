"use client";

import useSWR from 'swr';
import { AssetService } from '@/lib/services/thingsboardServices/assetService';
import type { AssetsResponse } from '@/types/thingsboardAssetTypes';

export const useEntityAssets = (
  page: number = 0,
  pageSize: number = 10,
  sortProperty: string = 'createdTime',
  sortOrder: 'ASC' | 'DESC' = 'DESC',
  assetProfileId: string = ''
) => {
  const { data, error, isLoading, mutate } = useSWR<AssetsResponse>(
    ['entityAssets', page, pageSize, sortProperty, sortOrder, assetProfileId],
    () =>
      AssetService.fetchAssets(
        page,
        pageSize,
        sortProperty,
        sortOrder,
        assetProfileId
      ),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    assets: data?.data ?? [],
    totalPages: data?.totalPages ?? 0,
    totalElements: data?.totalElements ?? 0,
    hasNext: data?.hasNext ?? false,
    isLoading,
    error,
    mutate,
  };
};
