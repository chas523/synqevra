import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import { WidgetType } from "@/types/widgetTypes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Download, Edit } from "lucide-react";
import { WidgetService } from "@/lib/services/thingsboardServices/widgetService";
import { useState } from "react";
import { ImageOff } from "lucide-react";

interface BundleWidgetsTableProps {
  widgets: WidgetType[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

const WidgetImage = ({ src, alt }: { src: string; alt: string }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-secondary/10 text-muted-foreground">
        <ImageOff className="h-5 w-5 opacity-50" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      onError={() => setHasError(true)}
    />
  );
};

export const BundleWidgetsTable = ({
  widgets,
  isLoading,
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onRefresh,
}: BundleWidgetsTableProps) => {
  const handleDownload = async (widgetId: string, name: string) => {
    try {
      const blob = await WidgetService.downloadWidgetType(widgetId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download widget:", error);
    }
  };

  const columns: DataTableColumn<WidgetType>[] = [
    {
      key: "image",
      header: "Image",
      sortable: false,
      render: (widget) => {
        let imageUrl = "";
        if (widget.image) {
          if (widget.image.startsWith("tb-image;")) {
            const imagePath = widget.image.replace("tb-image;", "");
            imageUrl = `/api/thingsboard/images/download/${encodeURIComponent(imagePath)}`;
          } else if (widget.image.startsWith("data:")) {
            imageUrl = widget.image;
          } else {
            imageUrl = widget.image;
          }
        }
        return (
          <div className="h-10 w-10 relative overflow-hidden rounded bg-secondary/10">
            <WidgetImage src={imageUrl} alt={widget.name} />
          </div>
        );
      },
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: "font-medium",
    },
    {
      key: "createdTime",
      header: "Created Time",
      sortable: true,
      render: (widget) => new Date(widget.createdTime).toLocaleDateString(),
    },
  ];

  const rowActions = (widget: WidgetType) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            handleDownload(widget.id.id, widget.name);
          }}
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <DataTable
      title=""
      data={widgets}
      columns={columns}
      getRowId={(widget) => widget.id.id}
      isLoading={isLoading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalElements={totalElements}
      pageSize={pageSize}
      onPageChange={onPageChange}
      onRefresh={onRefresh}
      rowActions={rowActions}
      emptyMessage="No widgets found in this bundle."
      loadingMessage="Loading widgets..."
      // Disable internal sorting for now or implement it if needed
      sortProperty="createdTime"
      sortOrder="DESC"
      onSortChange={() => {}}
    />
  );
};
