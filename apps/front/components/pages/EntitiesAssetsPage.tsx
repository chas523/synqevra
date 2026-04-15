"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { AddAssetDialog } from "@/components/organisms/AddAssetDialog";
import { AssetDetailPanel } from "@/components/organisms/AssetDetailPanel";
import { EntitiesAssetsTable } from "@/components/organisms/EntitiesAssetsTable";
import { useEntityAssets } from "@/hooks/thingsboard/asset/useEntityAssets";
import { AssetService } from "@/lib/services/thingsboardServices/assetService";
import type { Asset, CreateAssetRequest } from "@/types/thingsboardAssetTypes";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Upload } from "lucide-react";
const PAGE_SIZE = 10;

export const EntitiesAssetsPage = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortProperty, setSortProperty] = useState("createdTime");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [addAssetOpen, setAddAssetOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const importFileInputRef = useRef<HTMLInputElement>(null);

  const { assets, totalPages, totalElements, isLoading, mutate } =
    useEntityAssets(currentPage, PAGE_SIZE, sortProperty, sortOrder);

  const handleImport = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const json = JSON.parse(text);

        // Detect bundle (has "asset" key) vs plain asset JSON
        const isBundle = json.asset !== undefined;
        const assetData = isBundle ? json.asset : json;

        // Strip server-generated and tenant-specific reference fields
        const {
          id,
          createdTime,
          tenantId,
          customerId,
          ownerId,
          externalId,
          assetProfileId: _assetProfileIdObj,
          version,
          customerIsPublic,
          customerTitle,
          assetProfileName: _assetProfileNameInAsset,
          type: _legacyType,
          ...payload
        } = assetData;

        // Resolve the profile name from bundle metadata or asset field (fallback "default")
        const profileName =
          json.profileName ?? _assetProfileNameInAsset ?? "default";

        // Look up profile + public customer (same logic as AddAssetDialog)
        const [profileInfos, customerInfos] = await Promise.all([
          AssetService.getAssetProfileInfos(0, 100, "name", "ASC"),
          AssetService.getCustomers(0, 50, "title", "ASC"),
        ]);

        const profile =
          profileInfos.data.find((p: any) => p.name === profileName) ??
          profileInfos.data[0];

        const publicCustomer =
          customerInfos.data.find((c: any) => c.additionalInfo?.isPublic) ??
          customerInfos.data[0];

        if (!profile) throw new Error("No asset profiles available");
        if (!publicCustomer) throw new Error("No customers available");

        const createPayload = {
          ...payload,
          assetProfileId: profile.id?.id ?? "",
          customerId: publicCustomer.id?.id ?? "",
        };

        const created = await AssetService.createAsset(createPayload);
        const assetId = created.id?.id ?? "";

        if (isBundle) {
          // Restore attributes
          if (
            Array.isArray(json.serverAttributes) &&
            json.serverAttributes.length > 0
          ) {
            const record = Object.fromEntries(
              json.serverAttributes.map(({ key, value }: any) => [key, value]),
            );
            await AssetService.updateAssetServerAttributes(assetId, record);
          }
          // Restore latest telemetry
          if (json.telemetry && Object.keys(json.telemetry).length > 0) {
            const telemetryRecord = Object.fromEntries(
              Object.entries(json.telemetry).map(
                ([key, points]: [string, any]) => [
                  key,
                  Array.isArray(points) && points.length > 0
                    ? points[0].value
                    : null,
                ],
              ),
            );
            await AssetService.addAssetLatestTelemetry(
              assetId,
              telemetryRecord,
            );
          }
          // Restore calculated fields
          if (
            Array.isArray(json.calculatedFields) &&
            json.calculatedFields.length > 0
          ) {
            for (const field of json.calculatedFields) {
              const {
                id: _fid,
                createdTime: _fct,
                version: _fv,
                ...fieldPayload
              } = field;
              // Strip refEntityId from arguments that reference external entities
              if (Array.isArray(fieldPayload.arguments)) {
                fieldPayload.arguments = fieldPayload.arguments.map(
                  (arg: any) => {
                    if (arg.entityType !== "current_entity") {
                      const { refEntityId: _ref, ...safeArg } = arg;
                      return safeArg;
                    }
                    return arg;
                  },
                );
              }
              await AssetService.createAssetCalculatedField(
                assetId,
                fieldPayload,
              );
            }
          }
        }

        toast.success(`Asset "${payload.name ?? file.name}" imported`);
        mutate();
      } catch (error: any) {
        const message =
          error?.response?.data?.message ??
          "Failed to import asset – invalid JSON file";
        toast.error(message);
      } finally {
        if (importFileInputRef.current) importFileInputRef.current.value = "";
      }
    },
    [mutate],
  );

  const importAction = (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => importFileInputRef.current?.click()}
              className="text-muted-foreground hover:text-foreground"
            >
              <Upload className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Import asset from JSON</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <input
        ref={importFileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleImport}
      />
    </>
  );

  const handleAddAssetSubmit = useCallback(
    async (payload: CreateAssetRequest) => {
      try {
        await AssetService.createAsset(payload);
        toast.success(`Asset "${payload.name}" created successfully`);
        setAddAssetOpen(false);
        mutate();
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to create asset");
        throw error;
      }
    },
    [mutate],
  );

  const handleSortChange = useCallback(
    (property: string, order: "ASC" | "DESC") => {
      setSortProperty(property);
      setSortOrder(order);
      setCurrentPage(0);
    },
    [],
  );

  const handleMakePublic = useCallback(
    async (asset: Asset) => {
      try {
        const response = await AssetService.makeAssetPublic(asset.id?.id ?? "");

        if (
          typeof response === "object" &&
          response !== null &&
          "info" in response &&
          response.info
        ) {
          toast.info(response.message || `"${asset.name}" is already public`);
        } else {
          toast.success(`"${asset.name}" is now public`);
        }

        mutate();
      } catch (error: any) {
        toast.info(
          error?.response?.data?.message || "Asset public state unchanged",
        );
      }
    },
    [mutate],
  );

  const handleMakePrivate = useCallback(
    async (asset: Asset) => {
      try {
        const response = await AssetService.makeAssetPrivate(
          asset.id?.id ?? "",
        );

        if (
          typeof response === "object" &&
          response !== null &&
          "info" in response &&
          response.info
        ) {
          toast.info(response.message || `"${asset.name}" is already private`);
        } else {
          toast.success(`"${asset.name}" is now private`);
        }

        mutate();
      } catch (error: any) {
        toast.info(
          error?.response?.data?.message || "Asset private state unchanged",
        );
      }
    },
    [mutate],
  );

  const handleDelete = useCallback(
    async (asset: Asset) => {
      try {
        await AssetService.deleteAsset(asset.id?.id ?? "");
        toast.success(`"${asset.name}" deleted`);
        mutate();
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to delete asset");
      }
    },
    [mutate],
  );

  const handleExport = useCallback(async (asset: Asset) => {
    try {
      const id = asset.id?.id ?? "";
      const {
        id: _id,
        createdTime,
        tenantId,
        customerId,
        ownerId,
        externalId,
        assetProfileId: _assetProfileId,
        version: _version,
        customerIsPublic: _customerIsPublic,
        customerTitle: _customerTitle,
        assetProfileName,
        ...assetPayload
      } = asset as any;

      const [serverAttrs, calcFieldsResp, telemetryKeys] = await Promise.all([
        AssetService.fetchAssetServerAttributes(id),
        AssetService.fetchAssetCalculatedFields(id, 0, 1000),
        AssetService.fetchAssetLatestTelemetryKeys(id),
      ]);

      const telemetry =
        telemetryKeys.length > 0
          ? await AssetService.fetchAssetLatestTelemetry(id, telemetryKeys)
          : {};

      const bundle = {
        asset: assetPayload,
        profileName: assetProfileName ?? "default",
        serverAttributes: serverAttrs,
        telemetry,
        calculatedFields: calcFieldsResp.data,
      };

      const blob = new Blob([JSON.stringify(bundle, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${asset.name ?? "asset"}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to export asset");
    }
  }, []);

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
        onExport={handleExport}
        customAction={importAction}
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
