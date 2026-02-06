"use client";

import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    useGeneralSettings,
    useUpdateGeneralSettings,
} from "@/hooks/thingsboard/settings/useGeneralSettings";
import {
    useConnectivitySettings,
    useUpdateConnectivitySettings,
} from "@/hooks/thingsboard/settings/useConnectivitySettings";
import { GeneralSettingsForm } from "@/components/organisms/GeneralSettingsForm";
import { DeviceConnectivityForm } from "@/components/organisms/DeviceConnectivityForm";
import { GeneralSettingsDto, ConnectivitySettingsDto } from "@/types/generalSettingsTypes";

export const SystemSettingsPage = () => {
    const { generalSettings, generalLoading, generalError, mutate: mutateGeneral } =
        useGeneralSettings();
    const { updateGeneralSettings, isLoading: isUpdatingGeneral } =
        useUpdateGeneralSettings();

    const {
        connectivitySettings,
        connectivityLoading,
        connectivityError,
        mutate: mutateConnectivity,
    } = useConnectivitySettings();
    const { updateConnectivitySettings, isLoading: isUpdatingConnectivity } =
        useUpdateConnectivitySettings();

    const handleSaveGeneralSettings = async (settings: GeneralSettingsDto) => {
        try {
            await updateGeneralSettings(settings);
            mutateGeneral();
            toast.success("General settings saved successfully");
        } catch (error) {
            toast.error("Failed to save general settings");
        }
    };

    const handleSaveConnectivitySettings = async (settings: ConnectivitySettingsDto) => {
        try {
            await updateConnectivitySettings(settings);
            mutateConnectivity();
            toast.success("Connectivity settings saved successfully");
        } catch (error) {
            toast.error("Failed to save connectivity settings");
        }
    };

    if (generalLoading || connectivityLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (generalError || connectivityError) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-destructive">
                    Failed to load settings. Please try again.
                </p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your ThingsBoard instance settings
                </p>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="mail-server">Mail Server</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="queues">Queues</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6">
                    {generalSettings && (
                        <GeneralSettingsForm
                            initialSettings={generalSettings}
                            onSave={handleSaveGeneralSettings}
                            isSaving={isUpdatingGeneral}
                        />
                    )}
                    {connectivitySettings && (
                        <DeviceConnectivityForm
                            initialSettings={connectivitySettings}
                            onSave={handleSaveConnectivitySettings}
                            isSaving={isUpdatingConnectivity}
                        />
                    )}
                </TabsContent>

                <TabsContent value="mail-server">
                    <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/30">
                        <div className="text-center">
                            <h3 className="text-lg font-medium">Mail Server Configuration</h3>
                            <p className="text-muted-foreground mt-1">Coming soon</p>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="notifications">
                    <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/30">
                        <div className="text-center">
                            <h3 className="text-lg font-medium">Notification Templates</h3>
                            <p className="text-muted-foreground mt-1">Coming soon</p>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="queues">
                    <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/30">
                        <div className="text-center">
                            <h3 className="text-lg font-medium">Queue Management</h3>
                            <p className="text-muted-foreground mt-1">Coming soon</p>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SystemSettingsPage;
