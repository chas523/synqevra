'use client';

import { useState } from 'react';
import { useImages, useManageImage } from '@/hooks/thingsboard/resources/useImages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, LayoutGrid, List as ListIcon, Loader2, Upload, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ImageSelectorProps {
    value?: string;
    onChange: (link: string) => void;
    onClose?: () => void;
}

export const ImageSelector = ({ value, onChange, onClose }: ImageSelectorProps) => {
    const [page, setPage] = useState(0);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

    const { images, totalPages, isLoading, mutate } = useImages(
        page,
        20, // Page size
        'createdTime',
        'DESC',
        'IMAGE', // subType
        false // includeSystemImages (or true depending on needs)
    );

    const { uploadImage, deleteImage, isUploading } = useManageImage();

    const handleUpload = async (file: File) => {
        try {
            await uploadImage(file, file.name);
            toast.success('Image uploaded successfully');
            setUploadDialogOpen(false);
            mutate();
        } catch (error) {
            toast.error('Failed to upload image');
        }
    };

    return (
        <div className="flex flex-col h-[500px] gap-4">
            <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search images..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <div className="flex items-center gap-1 rounded-md border p-1">
                    <Button
                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setViewMode('grid')}
                    >
                        <LayoutGrid className="h-4 w-4" /> {/* Should be LayoutGrid but lucide import might be case sensitive, checking */}
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setViewMode('list')}
                    >
                        <ListIcon className="h-4 w-4" />
                    </Button>
                </div>
                <Button onClick={() => setUploadDialogOpen(true)} size="sm">
                    <Upload className="mr-2 h-4 w-4" /> Upload
                </Button>
            </div>

            <ScrollArea className="flex-1 rounded-md border p-4">
                {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : images.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                        <p>No images found</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {images.map((image) => (
                            <div
                                key={image.id.id}
                                className={cn(
                                    "group relative aspect-square cursor-pointer rounded-md border overflow-hidden hover:border-primary transition-colors",
                                    value === image.link && "border-2 border-primary"
                                )}
                                onClick={() => onChange(image.link)}
                            >
                                <img
                                    src={image.link} // Note: Authentication might be needed for image loading? Usually session cookie handles it if same domain.
                                    alt={image.title}
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 truncate">
                                    {image.title}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {images.map((image) => (
                            <div
                                key={image.id.id}
                                className={cn(
                                    "flex items-center gap-4 rounded-md border p-2 hover:bg-muted/50 cursor-pointer",
                                    value === image.link && "border-primary bg-muted/50"
                                )}
                                onClick={() => onChange(image.link)}
                            >
                                <div className="h-10 w-10 overflow-hidden rounded-md border">
                                    <img
                                        src={image.link}
                                        alt={image.title}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 truncate">
                                    <p className="font-medium truncate">{image.title}</p>
                                    <p className="text-xs text-muted-foreground">{image.fileName}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 py-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 0}
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {page + 1} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}

            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Image</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUpload(file);
                            }}
                            disabled={isUploading}
                        />
                        {isUploading && (
                            <div className="flex items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <span className="ml-2">Uploading...</span>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
