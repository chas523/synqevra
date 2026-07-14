"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { EntitiesGatewaysTable } from "@/components/organisms/EntitiesGatewaysTable";
import { GatewayLaunchCommandDialog } from "@/components/organisms/GatewayLaunchCommandDialog";
import { AddGatewayDialog } from "@/components/organisms/AddGatewayDialog";
import { GatewayConfigurationDialog } from "@/components/organisms/GatewayConfigurationDialog";
import { GatewayConnectorsDialog } from "@/components/organisms/GatewayConnectorsDialog";
import { useEntityGateways } from "@/hooks/thingsboard/gateway/useEntityGateways";
import { GatewayService } from "@/lib/services/thingsboardServices/gatewayService";
import type { CreateGatewayPayload } from "@/lib/services/thingsboardServices/gatewayService";
import type { GatewayListItem } from "@/types/thingsboardGatewayTypes";

const PAGE_SIZE = 10;

export const EntitiesGatewaysPage = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortProperty, setSortProperty] = useState("createdTime");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [launchGateway, setLaunchGateway] = useState<GatewayListItem | null>(
    null,
  );
  const [configGateway, setConfigGateway] = useState<GatewayListItem | null>(
    null,
  );
  const [connectorsGateway, setConnectorsGateway] =
    useState<GatewayListItem | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const { gateways, totalPages, totalElements, isLoading, mutate } =
    useEntityGateways(currentPage, PAGE_SIZE, sortProperty, sortOrder);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSortChange = useCallback(
    (property: string, order: "ASC" | "DESC") => {
      setSortProperty(property);
      setSortOrder(order);
      setCurrentPage(0);
    },
    [],
  );

  const handleRefresh = useCallback(() => {
    mutate();
  }, [mutate]);

  const handleLaunchCommand = useCallback((gateway: GatewayListItem) => {
    setLaunchGateway(gateway);
  }, []);

  const handleGeneralConfiguration = useCallback((gateway: GatewayListItem) => {
    setConfigGateway(gateway);
  }, []);

  const handleConnectors = useCallback((gateway: GatewayListItem) => {
    setConnectorsGateway(gateway);
  }, []);

  const handleDelete = useCallback(
    async (gateway: GatewayListItem) => {
      try {
        await GatewayService.deleteGateway(gateway.id?.id ?? "");
        toast.success(`\"${gateway.name}\" deleted`);
        mutate();
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Failed to delete gateway",
        );
      }
    },
    [mutate],
  );

  const handleAddGateway = useCallback(
    async (payload: CreateGatewayPayload) => {
      try {
        const created = await GatewayService.createGateway(payload);
        toast.success(`Gateway "${created.name}" created`);
        setAddOpen(false);
        mutate();
        // open Launch Command for the freshly created gateway
        setLaunchGateway({
          id: created.id,
          createdTime: Date.now(),
          name: created.name,
          type: payload.type,
          label: payload.label,
          version: 0,
          active: false,
          enabledConnectors: 0,
          gatewayVersion: null,
          additionalInfo: { gateway: true },
        });
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Failed to create gateway",
        );
        throw error;
      }
    },
    [mutate],
  );

  return (
    <>
      <EntitiesGatewaysTable
        gateways={gateways}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={PAGE_SIZE}
        sortProperty={sortProperty}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onPageChange={handlePageChange}
        onRefresh={handleRefresh}
        onAdd={() => setAddOpen(true)}
        onLaunchCommand={handleLaunchCommand}
        onGeneralConfiguration={handleGeneralConfiguration}
        onConnectors={handleConnectors}
        onDelete={handleDelete}
      />
      <AddGatewayDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleAddGateway}
      />
      <GatewayConfigurationDialog
        gateway={configGateway}
        onClose={() => setConfigGateway(null)}
      />
      <GatewayLaunchCommandDialog
        gateway={launchGateway}
        onClose={() => setLaunchGateway(null)}
      />
      <GatewayConnectorsDialog
        gateway={connectorsGateway}
        onClose={() => setConnectorsGateway(null)}
        onUpdated={mutate}
      />
    </>
  );
};
