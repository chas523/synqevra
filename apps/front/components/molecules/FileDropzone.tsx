"use client";

import React, { useCallback, useState } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
    accept?: string;
    multiple?: boolean;
    onFilesSelected: (files: File[]) => void;
    selectedFiles: File[];
    onRemoveFile?: (index: number) => void;
    className?: string;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
    accept,
    multiple = false,
    onFilesSelected,
    selectedFiles,
    onRemoveFile,
    className,
}) => {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                onFilesSelected(multiple ? files : [files[0]]);
            }
        },
        [multiple, onFilesSelected]
    );

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(e.target.files || []);
            if (files.length > 0) {
                onFilesSelected(multiple ? files : [files[0]]);
            }
            e.target.value = "";
        },
        [multiple, onFilesSelected]
    );

    return (
        <div className={className}>
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                    isDragOver
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-muted-foreground/50",
                    className
                )}
            >
                <input
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-dropzone-input"
                />
                <label
                    htmlFor="file-dropzone-input"
                    className="cursor-pointer flex flex-col items-center gap-2"
                >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div className="text-sm text-muted-foreground">
                        Drag and drop a resource file or{" "}
                        <span className="text-primary underline">Browse files</span>
                    </div>
                </label>
            </div>

            {selectedFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                    {selectedFiles.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between text-sm p-2 bg-muted rounded"
                        >
                            <span className="truncate dark:text-white">{file.name}</span>
                            {onRemoveFile && (
                                <button
                                    type="button"
                                    onClick={() => onRemoveFile(index)}
                                    className="ml-2 text-muted-foreground hover:text-destructive"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {selectedFiles.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">No file selected</p>
            )}
        </div>
    );
};
