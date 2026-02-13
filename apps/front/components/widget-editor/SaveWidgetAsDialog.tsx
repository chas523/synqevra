'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Select from "@/components/ui/select";
import { WidgetType } from '@/types/widgetTypes';
import { WidgetService } from '@/lib/services/thingsboardServices/widgetService';
import { toast } from "sonner";

interface SaveWidgetAsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentWidgetType: WidgetType;
}

export const SaveWidgetAsDialog: React.FC<SaveWidgetAsDialogProps> = ({
    open,
    onOpenChange,
    currentWidgetType,
}) => {
    const [widgetName, setWidgetName] = useState(`${currentWidgetType.name} (Copy)`);
    const [selectedBundleId, setSelectedBundleId] = useState<string>('');
    const [bundles, setBundles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchBundles();
            setWidgetName(`${currentWidgetType.name} (Copy)`);
        }
    }, [open, currentWidgetType.name]);

    const fetchBundles = async () => {
        try {
            const data = await WidgetService.getWidgetsBundles(0, 100, 'title', 'ASC', false, true);
            const loadedBundles = data.data;
            setBundles(loadedBundles);

            if (loadedBundles.length > 0 && !selectedBundleId) {
                setSelectedBundleId(loadedBundles[0].id.id);
            }
        } catch (error) {
            console.error("Failed to fetch widget bundles", error);
            toast.error("Failed to load widget bundles.");
        }
    };

    const handleSaveAs = async () => {
        if (!selectedBundleId || !widgetName) return;

        setLoading(true);
        try {
            const selectedBundle = bundles.find(b => b.id.id === selectedBundleId);
            if (!selectedBundle) {
                toast.error("Selected bundle not found");
                return;
            }

            // 1. Create a copy of the widget object with new name and null ID (to create new)
            // AND set the bundleAlias to the selected bundle's alias
            const newWidget: any = {
                ...currentWidgetType,
                id: null,
                name: widgetName,
                bundleAlias: selectedBundle.alias,
                isSystemType: false // Ensure it's not trying to create a system widget
            };

            // Removing ID completely to be safe
            delete newWidget.id;

            // 2. Save the widget to create it
            // We set bundleAlias to ensure it *attempts* to link, but explicitly updating the bundle FQNs 
            // is the reliable method per user instructions.
            const savedWidget = await WidgetService.saveWidgetType(newWidget);

            // 3. Link to the selected bundle
            // Fetch existing FQNs for the bundle
            const currentFqns = await WidgetService.getWidgetTypeFqns(selectedBundleId);

            // Use alias as the identifier for the FQN list
            const newWidgetIdentifier = savedWidget.alias || savedWidget.fqn;

            if (newWidgetIdentifier) {
                // Check if already exists to avoid duplicates (though likely new alias is unique)
                if (!currentFqns.includes(newWidgetIdentifier)) {
                    const newFqns = [...currentFqns, newWidgetIdentifier];
                    await WidgetService.saveWidgetTypeFqns(selectedBundleId, newFqns);
                }
            } else {
                console.warn("Could not determine Identifier (alias/fqn) for new widget, skipping bundle link update.");
            }

            toast.success(`Widget saved as "${widgetName}" successfully.`);
            onOpenChange(false);

        } catch (error) {
            console.error("Failed to save widget as", error);
            toast.error("Failed to save widget copy.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Save Widget As</DialogTitle>
                    <DialogDescription>
                        Create a copy of this widget. Choose a name and a destination bundle.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={widgetName}
                            onChange={(e) => setWidgetName(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="bundle" className="text-right">
                            Bundle
                        </Label>
                        <div className="col-span-3">
                            <Select
                                options={bundles.map(b => ({ value: b.id.id, label: b.title }))}
                                value={selectedBundleId}
                                onValueChange={setSelectedBundleId}
                                placeholder="Select a bundle"
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSaveAs} disabled={loading || !widgetName || !selectedBundleId}>
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
