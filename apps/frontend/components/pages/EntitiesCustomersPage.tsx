"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { EntitiesCustomersTable } from "@/components/organisms/EntitiesCustomersTable";
import { CustomerDetailPanel } from "@/components/organisms/CustomerDetailPanel";
import { useEntityCustomers } from "@/hooks/thingsboard/customer/useEntityCustomers";
import { AssetService } from "@/lib/services/thingsboardServices/assetService";
import type { CustomerInfo } from "@/types/thingsboardAssetTypes";

const PAGE_SIZE = 10;

const isPublicCustomer = (customer: CustomerInfo) => {
  if (customer.additionalInfo?.isPublic) {
    return true;
  }

  const title = (customer.title || customer.name || "").trim().toLowerCase();
  return title === "public";
};

export const EntitiesCustomersPage = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortProperty, setSortProperty] = useState("createdTime");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerInfo | null>(
    null,
  );
  const router = useRouter();

  const { customers, totalPages, totalElements, isLoading, mutate } =
    useEntityCustomers(currentPage, PAGE_SIZE, sortProperty, sortOrder);

  const handleSortChange = useCallback(
    (property: string, order: "ASC" | "DESC") => {
      setSortProperty(property);
      setSortOrder(order);
      setCurrentPage(0);
    },
    [],
  );

  const showNotImplemented = useCallback((actionName: string) => {
    toast.info(`${actionName} is not implemented yet.`);
  }, []);

  const handleDelete = useCallback(
    async (customer: CustomerInfo) => {
      if (isPublicCustomer(customer)) {
        return;
      }

      try {
        await AssetService.deleteCustomer(customer.id?.id ?? "");
        toast.success(
          `\"${customer.title || customer.name || "Customer"}\" deleted`,
        );
        mutate();
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Failed to delete customer",
        );
      }
    },
    [mutate],
  );

  return (
    <>
      <EntitiesCustomersTable
        customers={customers}
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
        onRowClick={(customer) => setSelectedCustomer(customer)}
        onManageUsers={() => showNotImplemented("Manage users")}
        onManageAssets={(customer) => {
          router.push(
            `/entities/assets?customerId=${encodeURIComponent(customer.id?.id ?? "")}`,
          );
        }}
        onManageDevices={(customer) => {
          router.push(
            `/entities/devices?customerId=${encodeURIComponent(customer.id?.id ?? "")}`,
          );
        }}
        onManageDashboards={() => showNotImplemented("Manage dashboards")}
        onManageEdges={() => showNotImplemented("Manage edges")}
        onDelete={handleDelete}
      />

      <CustomerDetailPanel
        customer={selectedCustomer}
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    </>
  );
};
