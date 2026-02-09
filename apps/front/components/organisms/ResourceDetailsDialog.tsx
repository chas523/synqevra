"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Resource, RESOURCE_TYPE_OPTIONS } from "@/types/resourceTypes";
import { Download, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";

interface ResourceDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    resource: Resource | null;
    onDownload: (resource: Resource) => void;
    onDelete: (resource: Resource) => void;
}

export const ResourceDetailsDialog = ({
    open,
    onOpenChange,
    resource,
    onDownload,
    onDelete,
}: ResourceDetailsDialogProps) => {
    if (!resource) return null;

    const getResourceTypeLabel = (type: string) => {
        const option = RESOURCE_TYPE_OPTIONS.find((o) => o.value === type);
        return option?.label ?? type;
    };

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
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex gap-2 mb-4">
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleDownload}
                            className="bg-primary"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download resource
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete resource
                        </Button>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyId}
                        className="w-fit"
                    >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy resource Id
                    </Button>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    <div className="border-b pb-4">
                        <label className="text-sm text-muted-foreground">Resource type*</label>
                        <p className="text-lg font-medium">
                            {getResourceTypeLabel(resource.resourceType)}
                        </p>
                    </div>

                    <div className="border-b pb-4">
                        <label className="text-sm text-muted-foreground">Title*</label>
                        <p className="text-lg font-medium">
                            {resource.title || resource.name}
                        </p>
                    </div>

                    <div className="pb-4">
                        <label className="text-sm text-muted-foreground">File name*</label>
                        <p className="text-lg font-medium">{resource.fileName}</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
