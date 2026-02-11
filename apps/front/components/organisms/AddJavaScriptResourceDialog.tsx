"use client";

import { useState, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Select from "@/components/ui/select";
import { FileDropzone } from "@/components/molecules/FileDropzone";
import { ResourceCreateRequest, ResourceSubType } from "@/types/resourceTypes";
import { HelpCircle } from "lucide-react";
import { toast } from "sonner";

interface AddJavaScriptResourceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (resource: ResourceCreateRequest) => Promise<void>;
    isSaving: boolean;
}

export const AddJavaScriptResourceDialog = ({
    open,
    onOpenChange,
    onAdd,
    isSaving,
}: AddJavaScriptResourceDialogProps) => {
    const [title, setTitle] = useState("");
    const [subType, setSubType] = useState<string>("EXTENSION");
    const [file, setFile] = useState<File | null>(null);

    const handleFilesSelected = useCallback((files: File[]) => {
        if (files.length > 0) {
            const selectedFile = files[0];
            setFile(selectedFile);
            // Auto-fill title if empty
            if (!title) {
                setTitle(selectedFile.name);
            }
        }
    }, [title]);

    const handleClose = () => {
        setTitle("");
        setSubType("EXTENSION");
        setFile(null);
        onOpenChange(false);
    };

    const handleAdd = async () => {
        if (!file || !title.trim()) return;

        const reader = new FileReader();

        reader.onload = async () => {
            const base64 = (reader.result as string).split(",")[1];

            const resource: ResourceCreateRequest = {
                title: title,
                resourceType: "JS_MODULE",
                resourceSubType: subType,
                fileName: file.name,
                data: base64,
            };

            try {
                await onAdd(resource);
                handleClose();
                toast.success("JavaScript library added successfully");
            } catch (error) {
                // Error is handled in the parent or service
                toast.error("Failed to add JavaScript library");
            }
        };

        reader.readAsDataURL(file);
    };

    const isValid = file && title.trim() !== "";

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader className="flex flex-row items-center justify-between">
                    <DialogTitle>Add JavaScript library</DialogTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <HelpCircle className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>JavaScript type*</Label>
                        <Select
                            value={subType}
                            onValueChange={setSubType}
                            options={[
                                { value: "EXTENSION", label: "Extension" },
                                { value: "MODULE", label: "Module" },
                            ]}
                            placeholder="Select type"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Title*</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Input title"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>JavaScript resource file*</Label>
                        <FileDropzone
                            onFilesSelected={handleFilesSelected}
                            accept=".js"
                            multiple={false}
                            selectedFiles={file ? [file] : []}
                            onRemoveFile={() => setFile(null)}
                        />
                        {file && (
                            <div className="text-sm text-green-600 mt-1">
                                Selected: {file.name}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleAdd} disabled={!isValid || isSaving}>
                        {isSaving ? "Adding..." : "Add"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
