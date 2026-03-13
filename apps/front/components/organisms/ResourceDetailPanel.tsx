"use client";

import {
  EntityDetailPanel,
  TabConfig,
  ActionButton,
} from "@/components/templates/EntityDetailPanel";
import { Resource, RESOURCE_TYPE_OPTIONS } from "@/types/resourceTypes";
import { Download, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";

interface ResourceDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  resource: Resource | null;
  onDownload: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
}

const getResourceTypeLabel = (type: string) => {
  const option = RESOURCE_TYPE_OPTIONS.find((o) => o.value === type);
  return option?.label ?? type;
};

export const ResourceDetailPanel = ({
  isOpen,
  onClose,
  resource,
  onDownload,
  onDelete,
}: ResourceDetailPanelProps) => {
  if (!resource) return null;

  const handleCopyId = () => {
    if (resource.id?.id) {
      navigator.clipboard.writeText(resource.id.id);
      toast.success("Resource ID copied to clipboard");
    }
  };

  const handleDownload = () => {
    onDownload(resource);
  };

  const handleDelete = () => {
    onDelete(resource);
    onClose();
  };

  const actionButtons: ActionButton[] = [
    {
      label: "Download resource",
      onClick: handleDownload,
      variant: "primary",
      icon: <Download className="h-4 w-4" />,
    },
    {
      label: "Delete resource",
      onClick: handleDelete,
      variant: "danger",
      icon: <Trash2 className="h-4 w-4" />,
    },
    {
      label: "Copy resource Id",
      onClick: handleCopyId,
      variant: "secondary",
      icon: <Copy className="h-4 w-4" />,
    },
  ];

  const detailsContent = (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-700/50 pb-4">
        <label className="text-sm text-muted-foreground dark:text-slate-300">
          Resource type*
        </label>
        <p className="text-lg font-medium mt-1 dark:text-white">
          {getResourceTypeLabel(resource.resourceType)}
        </p>
      </div>

      <div className="border-b border-slate-200 dark:border-slate-700/50 pb-4">
        <label className="text-sm text-muted-foreground dark:text-slate-300">
          Title*
        </label>
        <p className="text-lg font-medium mt-1 dark:text-white">
          {resource.title || resource.name}
        </p>
      </div>

      <div className="pb-4">
        <label className="text-sm text-muted-foreground dark:text-slate-300">
          File name*
        </label>
        <p className="text-lg font-medium mt-1 dark:text-white">
          {resource.fileName}
        </p>
      </div>
    </div>
  );

  const tabs: TabConfig[] = [
    {
      id: "details",
      label: "Details",
      content: detailsContent,
    },
  ];

  return (
    <EntityDetailPanel
      isOpen={isOpen}
      onClose={onClose}
      title={resource.title || resource.name || "Resource Details"}
      subtitle={resource.fileName}
      tabs={tabs}
      actionButtons={actionButtons}
    />
  );
};

export default ResourceDetailPanel;
