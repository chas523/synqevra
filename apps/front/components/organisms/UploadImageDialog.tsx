"use client";

import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileDropzone } from "@/components/molecules/FileDropzone";
import { X } from "lucide-react";
import { LoadingButton } from "@/components/atoms";

interface UploadImageDialogProps {
    open: boolean;
    onClose: () => void;
    onUpload: (file: File, title: string) => Promise<void>;
    isUploading: boolean;
}

export function UploadImageDialog({
    open,
    onClose,
    onUpload,
    isUploading,
}: UploadImageDialogProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [preview, setPreview] = useState<string | null>(null);
    const [title, setTitle] = useState("");

    const handleFilesSelected = useCallback((files: File[]) => {
        if (files.length > 0) {
            const selectedFile = files[0];
            setSelectedFiles([selectedFile]);
            setTitle(selectedFile.name);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target?.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    }, []);

    const handleRemoveFile = (index: number) => {
        setSelectedFiles([]);
        setPreview(null);
        setTitle("");
    };

    const handleReset = () => {
        setSelectedFiles([]);
        setPreview(null);
        setTitle("");
    };

    const handleUpload = async () => {
        if (selectedFiles.length > 0 && title) {
            await onUpload(selectedFiles[0], title);
            handleReset();
            onClose();
        }
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Upload image</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div>
                        <Label className="text-sm text-muted-foreground">Image preview</Label>
                        <div className="mt-2 relative">
                            {preview ? (
                                <div className="flex items-start gap-4">
                                    <div className="relative">
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="w-16 h-16 object-contain rounded border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFile(0)}
                                            className="absolute -top-2 -right-2 w-5 h-5 bg-slate-600 rounded-full flex items-center justify-center hover:bg-slate-500"
                                        >
                                            <X className="w-3 h-3 text-white" />
                                        </button>
                                    </div>
                                    <div className="flex-1">
                                        <FileDropzone
                                            accept="image/*"
                                            multiple={false}
                                            onFilesSelected={handleFilesSelected}
                                            selectedFiles={[]}
                                            className="h-16"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <FileDropzone
                                    accept="image/*"
                                    multiple={false}
                                    onFilesSelected={handleFilesSelected}
                                    selectedFiles={selectedFiles}
                                    onRemoveFile={handleRemoveFile}
                                />
                            )}
                        </div>
                    </div>

                    {selectedFiles.length > 0 && (
                        <div className="space-y-2">
                            <Label htmlFor="image-title">Name*</Label>
                            <Input
                                id="image-title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter image name"
                            />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <LoadingButton
                        onClick={handleUpload}
                        disabled={selectedFiles.length === 0 || !title}
                        isLoading={isUploading}
                    >
                        Upload
                    </LoadingButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
