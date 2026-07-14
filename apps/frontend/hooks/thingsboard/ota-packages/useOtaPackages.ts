"use client";

import useSWR from "swr";
import { useState } from "react";
import { OtaPackageService } from "@/lib/services/thingsboardServices/otaPackageService";
import {
  OtaPackagesPageResponse,
  CreateOtaPackageRequest,
} from "@/types/otaPackageTypes";

export const useOtaPackages = (
  page: number = 0,
  pageSize: number = 10,
  sortProperty: string = "createdTime",
  sortOrder: "ASC" | "DESC" = "DESC",
) => {
  const key = ["otaPackages", page, pageSize, sortProperty, sortOrder];
  const { data, error, isLoading, mutate } = useSWR<OtaPackagesPageResponse>(
    key,
    () =>
      OtaPackageService.getOtaPackages(page, pageSize, sortProperty, sortOrder),
    {
      revalidateOnFocus: false,
    },
  );

  return {
    packages: data?.data ?? [],
    totalPages: data?.totalPages ?? 0,
    totalElements: data?.totalElements ?? 0,
    hasNext: data?.hasNext ?? false,
    isLoading,
    error,
    mutate,
  };
};

export const useManageOtaPackage = () => {
  const [isSaving, setIsSaving] = useState(false);

  const createOtaPackage = async (payload: CreateOtaPackageRequest) => {
    setIsSaving(true);
    try {
      const result = await OtaPackageService.createOtaPackage(payload);
      return result;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteOtaPackage = async (id: string) => {
    try {
      await OtaPackageService.deleteOtaPackage(id);
    } catch (error) {
      throw error;
    }
  };

  const downloadOtaPackage = async (id: string, fileName: string) => {
    try {
      const blob = await OtaPackageService.downloadOtaPackage(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      throw error;
    }
  };

  return {
    isSaving,
    createOtaPackage,
    deleteOtaPackage,
    downloadOtaPackage,
  };
};
