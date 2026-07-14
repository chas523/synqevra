"use client";
import { useState } from "react";
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
import {
  useSmsSettings,
  useUpdateSmsSettings,
} from "@/hooks/thingsboard/settings/useSmsSettings";
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
} from "@/hooks/thingsboard/settings/useNotificationSettings";
import {
  useMailSettings,
  useUpdateMailSettings,
} from "@/hooks/thingsboard/settings/useMailSettings";
import { GeneralSettingsForm } from "@/components/organisms/GeneralSettingsForm";
import { DeviceConnectivityForm } from "@/components/organisms/DeviceConnectivityForm";
import { SmsProviderSettingsForm } from "@/components/organisms/SmsProviderSettingsForm";
import { SlackSettingsForm } from "@/components/organisms/SlackSettingsForm";
import { MailServerSettingsForm } from "@/components/organisms/MailServerSettingsForm";
import { GlobalWhitelabelForm } from "@/components/organisms/GlobalWhitelabelForm";
import { MedplumSettings } from "@/components/organisms/MedplumSettings";
import {
  GeneralSettingsDto,
  ConnectivitySettingsDto,
} from "@/types/generalSettingsTypes";
import {
  SmsSettings,
  NotificationSettings,
} from "@/types/notificationSettingsTypes";
import { MailSettings } from "@/types/mailSettingsTypes";
import LoadingOverlayInformation from "../molecules/LoadingOverlayInformation";
import {
  useQueues,
  useManageQueue,
} from "@/hooks/thingsboard/settings/useQueues";
import { Queue } from "@/types/queueTypes";
import { QueuesTable } from "../organisms/QueuesTable";
import { QueueFormDialog } from "../organisms/QueueFormDialog";

export const SystemSettingsPage = () => {
  const {
    generalSettings,
    generalLoading,
    generalError,
    mutate: mutateGeneral,
  } = useGeneralSettings();
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

  const {
    smsSettings,
    smsLoading,
    smsError,
    mutate: mutateSms,
  } = useSmsSettings();
  const { updateSmsSettings, isLoading: isUpdatingSms } =
    useUpdateSmsSettings();

  const {
    notificationSettings,
    notificationLoading,
    notificationError,
    mutate: mutateNotification,
  } = useNotificationSettings();
  const { updateNotificationSettings, isLoading: isUpdatingNotification } =
    useUpdateNotificationSettings();

  const {
    mailSettings,
    mailLoading,
    mailError,
    mutate: mutateMail,
  } = useMailSettings();
  const { updateMailSettings, isLoading: isUpdatingMail } =
    useUpdateMailSettings();

  const handleSaveGeneralSettings = async (settings: GeneralSettingsDto) => {
    try {
      await updateGeneralSettings(settings);
      mutateGeneral();
      toast.success("General settings saved successfully");
    } catch (error) {
      toast.error("Failed to save general settings");
    }
  };

  const handleSaveConnectivitySettings = async (
    settings: ConnectivitySettingsDto,
  ) => {
    try {
      await updateConnectivitySettings(settings);
      mutateConnectivity();
      toast.success("Connectivity settings saved successfully");
    } catch (error) {
      toast.error("Failed to save connectivity settings");
    }
  };

  const handleSaveSmsSettings = async (settings: SmsSettings) => {
    try {
      await updateSmsSettings(settings);
      mutateSms();
      toast.success("SMS settings saved successfully");
    } catch (error) {
      toast.error("Failed to save SMS settings");
    }
  };

  const handleSaveNotificationSettings = async (
    settings: NotificationSettings,
  ) => {
    try {
      await updateNotificationSettings(settings);
      mutateNotification();
      toast.success("Notification settings saved successfully");
    } catch (error) {
      toast.error("Failed to save notification settings");
    }
  };

  const handleSaveMailSettings = async (settings: MailSettings) => {
    try {
      await updateMailSettings(settings);
      mutateMail();
      toast.success("Mail server settings saved successfully");
    } catch (error) {
      toast.error("Failed to save mail server settings");
    }
  };

  if (generalLoading || connectivityLoading || mailLoading) {
    return <LoadingOverlayInformation text="Loading settings..." />;
  }

  if (generalError || connectivityError || mailError) {
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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
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
          <GlobalWhitelabelForm />
          {connectivitySettings && (
            <DeviceConnectivityForm
              initialSettings={connectivitySettings}
              onSave={handleSaveConnectivitySettings}
              isSaving={isUpdatingConnectivity}
            />
          )}
        </TabsContent>

        <TabsContent value="mail-server">
          <MailServerSettingsForm
            initialSettings={mailSettings || null}
            onSave={handleSaveMailSettings}
            isSaving={isUpdatingMail}
          />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          {smsLoading || notificationLoading ? (
            <LoadingOverlayInformation text="Loading notification settings..." />
          ) : smsError || notificationError ? (
            <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/30">
              <p className="text-destructive">
                Failed to load notification settings. Please try again.
              </p>
            </div>
          ) : (
            <>
              <SmsProviderSettingsForm
                initialSettings={smsSettings || null}
                onSave={handleSaveSmsSettings}
                isSaving={isUpdatingSms}
              />
              <SlackSettingsForm
                initialSettings={notificationSettings || null}
                onSave={handleSaveNotificationSettings}
                isSaving={isUpdatingNotification}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="queues">
          <QueuesTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const QueuesTabContent = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortProperty, setSortProperty] = useState("createdTime");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const pageSize = 10;

  const { queuesData, isLoading, mutate } = useQueues(
    currentPage,
    pageSize,
    sortProperty,
    sortOrder,
  );
  const { createOrUpdateQueue, deleteQueue } = useManageQueue();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQueue, setEditingQueue] = useState<Queue | null>(null);

  const handleAdd = () => {
    setEditingQueue(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (queue: Queue) => {
    setEditingQueue(queue);
    setIsDialogOpen(true);
  };

  const handleDelete = async (queueId: string) => {
    try {
      await deleteQueue(queueId);
      mutate();
      toast.success("Queue deleted successfully");
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete queue";
      toast.error(errorMessage);
    }
  };

  const handleSave = async (queue: Queue) => {
    await createOrUpdateQueue(queue);
    mutate();
    toast.success(
      editingQueue
        ? "Queue updated successfully"
        : "Queue created successfully",
    );
    setIsDialogOpen(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSortChange = (property: string, order: "ASC" | "DESC") => {
    setSortProperty(property);
    setSortOrder(order);
    setCurrentPage(0); // Reset to first page on sort change
  };

  return (
    <>
      <QueuesTable
        queues={queuesData?.data || []}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={queuesData?.totalPages || 0}
        totalElements={queuesData?.totalElements || 0}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        sortProperty={sortProperty}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onRefresh={() => mutate()}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <QueueFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        queue={editingQueue}
        onSave={handleSave}
      />
    </>
  );
};

export default SystemSettingsPage;
