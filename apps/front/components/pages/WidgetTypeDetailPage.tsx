"use client";

import { WidgetService } from "@/lib/services/thingsboardServices/widgetService";
import { toast } from "sonner";
import { ArrowLeft, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWidgetType } from "@/hooks/thingsboard/widgets/useWidgetTypes";

interface WidgetTypeDetailPageProps {
    id: string;
}

export const WidgetTypeDetailPage = ({ id }: WidgetTypeDetailPageProps) => {
    const router = useRouter();
    const { widgetType, isLoading, error } = useWidgetType(id);

    const handleDownload = async () => {
        if (!widgetType) return;
        try {
            const blob = await WidgetService.downloadWidgetType(id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${widgetType.alias}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Failed to download widget type", error);
            toast.error("Failed to download widget type");
        }
    };

    if (isLoading) {
        // ... (existing skeleton code)
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-8 w-48" />
                </div>
                {/* ... */}
            </div>
        );
    }

    // ... (error handling)

    if (error || !widgetType) {
        return (
            <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <h2 className="text-2xl font-bold text-destructive">Error loading widget type</h2>
                <p className="text-muted-foreground">
                    {error?.message || "Widget type not found"}
                </p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">{widgetType.name}</h1>
                </div>
                <Button onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" /> Download
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground">Alias</h4>
                                <p>{widgetType.alias}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground">Widget Bundle</h4>
                                <p>{widgetType.bundles?.map(b => b.name).join(", ") || "-"}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground">Created Time</h4>
                                <p>{new Date(widgetType.createdTime).toLocaleString()}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground">Deprecated</h4>
                                <p>{widgetType.deprecated ? "Yes" : "No"}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground">SCADA</h4>
                                <p>{widgetType.scada ? "Yes" : "No"}</p>
                            </div>
                        </div>
                        {widgetType.description && (
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                                <p className="text-sm">{widgetType.description}</p>
                            </div>
                        )}
                        {widgetType.tags && widgetType.tags.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-1">Tags</h4>
                                <div className="flex flex-wrap gap-2">
                                    {widgetType.tags.map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Descriptor (JSON)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[500px] text-xs">
                            {JSON.stringify(widgetType.descriptor, null, 2)}
                        </pre>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
