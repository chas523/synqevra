"use client";

import { useState, useCallback } from "react";
import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import { Dashboard } from "@/types/dashboardTypes";
import { useDashboards } from "@/hooks/thingsboard/useDashboards";
import { DashboardService } from "@/lib/services/thingsboardServices/dashboardService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  CheckSquare,
  Square,
  Download,
  Share2,
  Reply,
  Contact,
  Pencil,
  Trash2,
  Plus,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { DashboardPublicLinkModal } from "@/components/organisms/DashboardPublicLinkModal";
import { ManageDashboardCustomersModal } from "@/components/organisms/ManageDashboardCustomersModal";
import { DashboardDetailPanel } from "@/components/organisms/DashboardDetailPanel";
import { AddDashboardModal } from "@/components/organisms/AddDashboardModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PAGE_SIZE = 10;

export default function DashboardsPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [sortProperty, setSortProperty] = useState("createdTime");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

  const [publicModalOpen, setPublicModalOpen] = useState(false);
  const [customersModalOpen, setCustomersModalOpen] = useState(false);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState<{
    id: string;
    name: string;
    publicId?: string;
  } | null>(null);
  const [fullSelectedDashboard, setFullSelectedDashboard] =
    useState<Dashboard | null>(null);

  const { dashboards, totalPages, totalElements, isLoading, mutate } =
    useDashboards(currentPage, PAGE_SIZE, sortProperty, sortOrder);

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

  const handleRowClick = useCallback(
    (dashboard: Dashboard) => {
      router.push(`/dashboards/${dashboard.id.id}`);
    },
    [router],
  );

  const isPublic = (dashboard: Dashboard) => {
    return dashboard.assignedCustomers?.some((c) => c.public) || false;
  };

  const getPublicId = (dashboard: Dashboard) => {
    const publicCustomer = dashboard.assignedCustomers?.find((c) => c.public);
    return publicCustomer?.customerId?.id;
  };

  const handleExport = async (
    e: React.MouseEvent | null,
    dashboard: Dashboard,
  ) => {
    if (e) e.stopPropagation();
    try {
      const raw = await DashboardService.getDashboardById(
        dashboard.id.id,
        true,
      );

      // Strip server-generated fields so the export is compatible with
      // the official ThingsBoard import format.
      const {
        id,
        createdTime,
        tenantId,
        assignedCustomers,
        version,
        externalId,
        ...data
      } = raw;

      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${dashboard.title}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error("Failed to export dashboard");
    }
  };

  const handleMakePublic = async (
    e: React.MouseEvent | null,
    dashboard: Dashboard,
  ) => {
    if (e) e.stopPropagation();
    try {
      const data = await DashboardService.makeDashboardCustomerPublic(
        dashboard.id.id,
      );

      if (data && data.assignedCustomers) {
        const publicCustomer = data.assignedCustomers.find(
          (c: any) => c.public,
        );
        if (publicCustomer) {
          setSelectedDashboard({
            id: dashboard.id.id,
            name: dashboard.title || dashboard.name,
            publicId: publicCustomer.customerId.id,
          });
          setPublicModalOpen(true);
        }
      }

      mutate();
      toast.success("Dashboard is now public");
    } catch (error) {
      toast.error("Failed to make dashboard public");
    }
  };

  const handleMakePrivate = async (
    e: React.MouseEvent | null,
    dashboard: Dashboard,
  ) => {
    if (e) e.stopPropagation();
    try {
      await DashboardService.makeDashboardCustomerPrivate(dashboard.id.id);
      mutate();
      toast.success("Dashboard is now private");
    } catch (error) {
      toast.error("Failed to make dashboard private");
    }
  };

  const handleEdit = (e: React.MouseEvent | null, dashboard: Dashboard) => {
    if (e) e.stopPropagation();
    setFullSelectedDashboard(dashboard);
    setDetailPanelOpen(true);
  };

  const handleDelete = async (
    e: React.MouseEvent | null,
    dashboard: Dashboard,
  ) => {
    if (e) e.stopPropagation();
    if (
      confirm(`Are you sure you want to delete dashboard "${dashboard.title}"?`)
    ) {
      try {
        await DashboardService.deleteDashboard(dashboard.id.id);
        toast.success("Dashboard deleted successfully");
        mutate();
        if (detailPanelOpen) setDetailPanelOpen(false);
      } catch (error) {
        toast.error("Failed to delete dashboard");
      }
    }
  };

  const handleManageCustomers = (
    e: React.MouseEvent | null,
    dashboard: Dashboard,
  ) => {
    if (e) e.stopPropagation();
    setFullSelectedDashboard(dashboard);
    setCustomersModalOpen(true);
  };

  const columns: DataTableColumn<Dashboard>[] = [
    {
      key: "createdTime",
      header: "Created time",
      sortable: true,
      render: (d) => (
        <span className="dark:text-white">
          {new Date(d.createdTime).toLocaleString()}
        </span>
      ),
    },
    {
      key: "title",
      header: "Title",
      sortable: true,
      render: (d) => (
        <span className="dark:text-white font-medium">{d.title}</span>
      ),
    },
    {
      key: "assignedCustomers",
      header: "Assigned to customers",
      render: (d) => (
        <span className="dark:text-gray-300">
          {d.assignedCustomers
            ?.filter((c) => !c.public)
            ?.map((c) => c.title)
            .join(", ") || ""}
        </span>
      ),
    },
    {
      key: "public",
      header: "Public",
      render: (d) => (
        <div className="flex items-center text-muted-foreground">
          {isPublic(d) ? (
            <CheckSquare className="h-4 w-4 text-primary dark:text-blue-400" />
          ) : (
            <Square className="h-4 w-4 dark:text-gray-400" />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6 h-[calc(100vh-(--spacing(16)))] flex flex-col">
      <DataTable
        title="Dashboards"
        data={dashboards}
        columns={columns}
        getRowId={(d) => d.id.id}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
        sortProperty={sortProperty}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onRefresh={handleRefresh}
        onRowClick={handleRowClick}
        customAction={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              title="Search"
              className="text-muted-foreground hover:text-foreground"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Add Dashboard"
              onClick={() => setAddModalOpen(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        }
        rowActions={(d) => (
          <div className="flex items-center gap-1 justify-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleExport(e, d)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export dashboard</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {isPublic(d) ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleMakePrivate(e, d)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <Reply className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Make dashboard private</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleMakePublic(e, d)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Make dashboard public</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleManageCustomers(e, d)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Contact className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Manage assigned customers</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleEdit(e, d)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Dashboard details</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDelete(e, d)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete dashboard</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        emptyMessage="No dashboards found."
      />

      <DashboardPublicLinkModal
        isOpen={publicModalOpen}
        onClose={() => setPublicModalOpen(false)}
        dashboardName={selectedDashboard?.name || ""}
        publicId={selectedDashboard?.publicId}
        dashboardId={selectedDashboard?.id}
      />

      <ManageDashboardCustomersModal
        isOpen={customersModalOpen}
        onClose={() => setCustomersModalOpen(false)}
        dashboard={fullSelectedDashboard}
        onSuccess={mutate}
      />

      <DashboardDetailPanel
        isOpen={detailPanelOpen}
        onClose={() => setDetailPanelOpen(false)}
        onRefresh={mutate}
        dashboard={fullSelectedDashboard}
        onExport={(d) => handleExport(null as any, d)}
        onMakePublic={(d) => handleMakePublic(null as any, d)}
        onMakePrivate={(d) => handleMakePrivate(null as any, d)}
        onManageCustomers={(d) => handleManageCustomers(null as any, d)}
        onDelete={(d) => handleDelete(null as any, d)}
      />

      <AddDashboardModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={mutate}
      />
    </div>
  );
}
