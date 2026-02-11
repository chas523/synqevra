"use client";

import { useEffect, useState } from "react";
import { Resource, ResourceCreateRequest, ResourceType, ResourceSubType } from "@/types/resourceTypes";
import { EntityDetailPanel } from "@/components/templates/EntityDetailPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useManageResource } from "@/hooks/thingsboard/resources/useResources";
import { Download, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { FileDropzone } from "@/components/molecules/FileDropzone";
import { ResourceService } from "@/lib/services/thingsboardServices/resourceService";

interface JavaScriptResourceDetailsProps {
    resource: Resource | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
    onDelete: (resource: Resource) => void;
}

export function JavaScriptResourceDetails({
    resource,
    isOpen,
    onClose,
    onUpdate,
    onDelete,
}: JavaScriptResourceDetailsProps) {
    const { createResource, downloadResource } = useManageResource();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<ResourceCreateRequest>>({});
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [fullResource, setFullResource] = useState<Resource | null>(null);

    useEffect(() => {
        if (isOpen && resource?.id?.id) {
            loadResourceDetails(resource.id.id);
            setIsEditing(false);
            setFile(null);
        }
    }, [isOpen, resource]);

    const loadResourceDetails = async (id: string) => {
        setIsLoading(true);
        try {
            const data = await ResourceService.getResourceInfo(id);
            setFullResource(data);
            setFormData({
                title: data.title,
                resourceType: data.resourceType,
                fileName: data.fileName,
            });
        } catch (error) {
            toast.error("Failed to load resource details");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!fullResource || !formData.title) return;

        try {
            // Read file if present
            let data = fullResource.data; // Keep existing data if no new file
            let fileName = fullResource.fileName;

            if (file) {
                fileName = file.name;
                data = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve((reader.result as string).split(',')[1]);
                    reader.onerror = reject;
                    reader.readAsDataURL(file); // JS files handled as base64
                });
            }

            const updateRequest: Resource = {
                ...fullResource,
                title: formData.title,
                fileName: fileName,
                data: data,
            };

            await ResourceService.createResource(updateRequest as any);

            toast.success("Resource updated");
            setIsEditing(false);
            onUpdate();
            if (resource?.id?.id) {
                loadResourceDetails(resource.id.id);
            }
        } catch (error) {
            toast.error("Failed to update resource");
        }
    };

    const handleDownload = () => {
        if (fullResource?.id?.id && fullResource.fileName) {
            downloadResource(fullResource.id.id, fullResource.fileName);
        }
    };

    const handleDelete = () => {
        if (fullResource) {
            onDelete(fullResource);
        }
    };

    if (!resource) return null;

    const detailsContent = (
        <div className="space-y-6">
            {/* Action Buttons Row for Read Mode */}
            {!isEditing && (
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" className="bg-[#1f2937] text-white hover:text-white hover:bg-[#374151] border-none" onClick={handleDownload}>
                        Download JavaScript resource
                    </Button>
                    <Button variant="outline" className="bg-[#1f2937] text-white hover:text-white hover:bg-[#374151] border-none" onClick={handleDelete}>
                        Delete JavaScript resource
                    </Button>
                </div>
            )}

            <div className="space-y-4">
                <div className="grid gap-1.5">
                    <Label className="text-xs text-muted-foreground">JavaScript type*</Label>
                    <div className="text-sm font-medium dark:text-white">
                        {fullResource?.resourceSubType
                            ? fullResource.resourceSubType.charAt(0).toUpperCase() + fullResource.resourceSubType.slice(1).toLowerCase()
                            : '-'}
                    </div>
                </div>

                <div className="grid gap-1.5">
                    <Label className="text-xs text-muted-foreground">Title*</Label>
                    {isEditing ? (
                        <Input
                            value={formData.title || ''}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="dark:text-white"
                        />
                    ) : (
                        <div className="text-sm dark:text-white">{fullResource?.title}</div>
                    )}
                </div>

                <div className="grid gap-1.5">
                    <Label className="text-xs text-muted-foreground">
                        {isEditing ? "JavaScript resource file*" : "File name*"}
                    </Label>
                    {isEditing ? (
                        <FileDropzone
                            onFilesSelected={(files) => {
                                if (files.length > 0) setFile(files[0]);
                            }}
                            accept=".js"
                            multiple={false}
                            selectedFiles={file ? [file] : []}
                            onRemoveFile={() => setFile(null)}
                        />
                    ) : (
                        <div className="text-sm dark:text-white" >{fullResource?.fileName}</div>
                    )}
                    {isEditing && file && (
                        <div className="text-sm text-green-600">Selected: {file.name}</div>
                    )}
                    {isEditing && !file && fullResource?.fileName && (
                        <div className="text-xs text-muted-foreground">Current: {fullResource.fileName}</div>
                    )}
                </div>
            </div>

            {isEditing && (
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </div>
            )}
        </div>
    );

    return (
        <EntityDetailPanel
            isOpen={isOpen}
            onClose={onClose}
            title={fullResource?.title || resource.title}
            subtitle="JavaScript resource details"
            tabs={[{ id: "details", label: "Details", content: detailsContent }]}
            onEdit={() => setIsEditing(true)}
            className="sm:max-w-xl"
        />
    );
}
