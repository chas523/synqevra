"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";
import { Image } from "@/types/imageTypes";
import { toast } from "sonner";

interface EmbedImageDialogProps {
    open: boolean;
    onClose: () => void;
    image: Image | null;
}

export function EmbedImageDialog({
    open,
    onClose,
    image,
}: EmbedImageDialogProps) {
    const [usePublicLink, setUsePublicLink] = useState(true);
    const [copiedHtml, setCopiedHtml] = useState(false);
    const [copiedAngular, setCopiedAngular] = useState(false);

    if (!image) return null;

    const imageUrl = usePublicLink && image.publicLink ? image.publicLink : image.link;

    const htmlEmbed = `<img src="${imageUrl}" alt="${image.title}" />`;
    const angularEmbed = `<img [src]="'${image.link}' | image | async" />`;

    const copyToClipboard = async (text: string, type: 'html' | 'angular') => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === 'html') {
                setCopiedHtml(true);
                setTimeout(() => setCopiedHtml(false), 2000);
            } else {
                setCopiedAngular(true);
                setTimeout(() => setCopiedAngular(false), 2000);
            }
            toast.success("Copied to clipboard");
        } catch (error) {
            toast.error("Failed to copy");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Embed image</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Embed to HTML section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Switch
                                checked={usePublicLink}
                                onCheckedChange={setUsePublicLink}
                                id="embed-public"
                            />
                            <Label htmlFor="embed-public" className="font-semibold dark:text-white">
                                Embed to HTML
                            </Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Using the following code snippet, you may embed an image into the components based on the plain HTML.
                            Such components include HTML card widgets, cell content functions, etc.
                        </p>
                        <div className="relative bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                            <code className="text-sm break-all dark:text-slate-200">{htmlEmbed}</code>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={() => copyToClipboard(htmlEmbed, 'html')}
                            >
                                {copiedHtml ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* Embed to Angular section */}
                    <div className="space-y-3">
                        <h3 className="font-semibold dark:text-white">Embed to Angular HTML template</h3>
                        <p className="text-sm text-muted-foreground">
                            Using the following code snippet, you may embed an image into the Angular HTML template that will be used for components.
                            Such components include the Markdown widget, HTML section in the widget editor, custom actions, etc.
                        </p>
                        <div className="relative bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                            <code className="text-sm break-all dark:text-slate-200">{angularEmbed}</code>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={() => copyToClipboard(angularEmbed, 'angular')}
                            >
                                {copiedAngular ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
