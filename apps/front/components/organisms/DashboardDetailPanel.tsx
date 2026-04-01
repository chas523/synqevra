"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import {
  EntityDetailPanel,
  TabConfig,
  ActionButton,
} from "@/components/templates/EntityDetailPanel";
import { DashboardDetailsTabContent } from "./DashboardDetailsTabContent";
import { DashboardAuditLogsTabContent } from "./DashboardAuditLogsTabContent";
import { VersionsTable } from "./VersionsTable";
import { Dashboard } from "@/types/dashboardTypes";
import {
  ExternalLink,
  Download,
  Reply,
  Share2,
  Contact,
  Trash2,
  Check,
  X,
  Loader2,
  Save,
} from "lucide-react";
import { DashboardService } from "@/lib/services/thingsboardServices/dashboardService";
import { toast } from "sonner";

export interface DashboardDetailPanelProps {
  dashboard: Dashboard | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  onExport: (dashboard: Dashboard) => void;
  onMakePublic: (dashboard: Dashboard) => void;
  onMakePrivate: (dashboard: Dashboard) => void;
  onManageCustomers: (dashboard: Dashboard) => void;
  onDelete: (dashboard: Dashboard) => void;
}

export function DashboardDetailPanel({
  dashboard,
  isOpen,
  onClose,
  onRefresh,
  onExport,
  onMakePublic,
  onMakePrivate,
  onManageCustomers,
  onDelete,
}: DashboardDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<string>("details");
  const [branch, setBranch] = useState("main");
  const [isEdit, setIsEdit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fullDashboard, setFullDashboard] = useState<Dashboard | null>(null);
  const [editedDashboard, setEditedDashboard] = useState<Dashboard | null>(
    null,
  );
  const [isLoadingFull, setIsLoadingFull] = useState(false);

  useEffect(() => {
    if (isOpen && dashboard) {
      loadFullDashboard();
    }
    if (!isOpen) {
      setIsEdit(false);
      setEditedDashboard(null);
      setFullDashboard(null);
    }
  }, [isOpen, dashboard?.id?.id]);

  const loadFullDashboard = async () => {
    if (!dashboard) return;
    setIsLoadingFull(true);
    try {
      const data = await DashboardService.getDashboardById(dashboard.id.id);
      setFullDashboard(data);
    } catch (error) {
      console.error("Failed to load full dashboard details", error);
    } finally {
      setIsLoadingFull(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleStartEdit = () => {
    if (!fullDashboard) {
      toast.error("Full dashboard details not loaded yet");
      return;
    }
    setEditedDashboard(fullDashboard);
    setIsEdit(true);
  };

  const handleCancelEdit = () => {
    setIsEdit(false);
    setEditedDashboard(null);
  };

  const handleSaveChanges = async () => {
    if (!editedDashboard) return;
    setIsSaving(true);
    try {
      await DashboardService.saveDashboard(editedDashboard);
      toast.success("Dashboard saved successfully");
      if (onRefresh) onRefresh();

      // Update local full dashboard with saved changes
      setFullDashboard(editedDashboard);
      setIsEdit(false);
      setEditedDashboard(null);
    } catch (error) {
      toast.error("Failed to save dashboard");
    } finally {
      setIsSaving(false);
    }
  };

  const currentDashboard = fullDashboard || dashboard;
  const isPublic =
    currentDashboard?.assignedCustomers?.some((c) => c.public) || false;

  const wrapAction = useCallback(
    (fn: (d: Dashboard) => void) => {
      return async (d: Dashboard) => {
        await fn(d);
        await loadFullDashboard();
        if (onRefresh) onRefresh();
      };
    },
    [loadFullDashboard, onRefresh],
  );

  const actionButtons: ActionButton[] = useMemo(() => {
    if (!dashboard) return [];

    if (isEdit) {
      return [
        {
          label: isSaving ? "Saving..." : "Save",
          onClick: handleSaveChanges,
          variant: "primary",
          icon: isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          ),
          disabled: isSaving,
        },
        {
          label: "Cancel",
          onClick: handleCancelEdit,
          variant: "secondary",
          icon: <X className="h-4 w-4" />,
          disabled: isSaving,
        },
      ];
    }

    const buttons: ActionButton[] = [
      {
        label: "Open dashboard",
        onClick: () => {
          window.open(`/dashboard/${dashboard.id.id}`, "_blank");
        },
        variant: "primary",
        icon: <ExternalLink className="h-4 w-4" />,
      },
      {
        label: "Export dashboard",
        onClick: () => onExport(dashboard),
        variant: "secondary",
        icon: <Download className="h-4 w-4" />,
      },
    ];

    if (isPublic) {
      buttons.push({
        label: "Make dashboard private",
        onClick: () => wrapAction(onMakePrivate)(dashboard),
        variant: "secondary",
        icon: <Reply className="h-4 w-4" />,
      });
    } else {
      buttons.push({
        label: "Make dashboard public",
        onClick: () => wrapAction(onMakePublic)(dashboard),
        variant: "secondary",
        icon: <Share2 className="h-4 w-4" />,
      });
    }

    buttons.push({
      label: "Manage assigned customers",
      onClick: () => onManageCustomers(dashboard),
      variant: "secondary",
      icon: <Contact className="h-4 w-4" />,
    });

    buttons.push({
      label: "Delete dashboard",
      onClick: () => onDelete(dashboard),
      variant: "secondary",
      icon: <Trash2 className="h-4 w-4 text-red-500" />,
    });

    return buttons;
  }, [
    dashboard,
    isPublic,
    isEdit,
    isSaving,
    editedDashboard,
    fullDashboard,
    onExport,
    onMakePublic,
    onMakePrivate,
    onManageCustomers,
    onDelete,
    loadFullDashboard,
    onRefresh,
  ]);

  const tabs: TabConfig[] = useMemo(() => {
    if (!dashboard) return [];

    return [
      {
        id: "details",
        label: "Details",
        content: (
          <DashboardDetailsTabContent
            dashboard={isEdit ? editedDashboard : fullDashboard || dashboard}
            isEdit={isEdit}
            onChange={setEditedDashboard}
            isLoading={!isEdit && isLoadingFull && !fullDashboard}
          />
        ),
      },
      {
        id: "audit-logs",
        label: "Audit logs",
        content: <DashboardAuditLogsTabContent dashboardId={dashboard.id.id} />,
        disabled: isEdit,
      },
      {
        id: "version-control",
        label: "Version control",
        content: (
          <VersionsTable
            branch={branch}
            onBranchChange={setBranch}
            entityType="DASHBOARD"
            entityId={dashboard.id.id}
            hideCard={true}
          />
        ),
        disabled: isEdit,
      },
    ];
  }, [
    dashboard,
    branch,
    isEdit,
    editedDashboard,
    fullDashboard,
    isLoadingFull,
  ]);

  if (!dashboard) return null;

  return (
    <EntityDetailPanel
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEdit
          ? editedDashboard?.title || dashboard.title
          : fullDashboard?.title || dashboard.title || dashboard.name || ""
      }
      subtitle="Dashboard details"
      tabs={tabs}
      actionButtons={actionButtons}
      onEdit={!isEdit ? handleStartEdit : undefined}
      defaultTab={activeTab}
      onTabChange={handleTabChange}
    />
  );
}
