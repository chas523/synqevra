"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Bell,
  GitBranch,
  RefreshCw,
  BarChart3,
  Sparkles,
  Link2Off,
} from "lucide-react";
import { SettingsService } from "@/lib/services/thingsboardServices/settingsService";
import { NotificationSettings } from "@/types/notificationSettingsTypes";
import { RepositorySettingsForm } from "@/components/organisms/RepositorySettingsForm";
import {
  useRepoSettingsInfo,
  useRepoSettings,
  useManageRepoSettings,
} from "@/hooks/thingsboard/version-control/useVersionControl";
import { RepoSettings } from "@/types/versionControlTypes";
import { Button } from "@/components/ui/button";
import { AiModelsTab } from "@/components/organisms/AiModelsTab";
import { AutoCommitTab } from "@/components/organisms/AutoCommitTab";

const TABS = [
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "repository", label: "Repository", icon: GitBranch },
  { id: "auto-commit", label: "Auto-commit", icon: RefreshCw },
  { id: "trendz", label: "Trendz", icon: BarChart3 },
  { id: "ai-models", label: "AI models", icon: Sparkles },
] as const;

type TabId = (typeof TABS)[number]["id"];

function NotificationsTab() {
  const [botToken, setBotToken] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    SettingsService.getNotificationSettings()
      .then((data: NotificationSettings) => {
        setBotToken(data?.deliveryMethodsConfigs?.SLACK?.botToken || "");
      })
      .catch(() => {
        toast.error("Failed to load notification settings");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const payload: NotificationSettings = {
        deliveryMethodsConfigs: {
          SLACK: {
            botToken: botToken,
            method: "SLACK",
          },
        },
      };
      await SettingsService.updateNotificationSettings(payload);
      toast.success("Notification settings saved successfully");
    } catch (error: any) {
      toast.error("Failed to save notification settings");
    } finally {
      setIsSaving(false);
    }
  }, [botToken]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground dark:text-slate-400">
        <p className="text-sm">Loading notification settings...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground dark:text-white">
          Slack settings
        </h2>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-white transition-colors"
          title="Help"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Input */}
      <div className="mb-6">
        <input
          type="text"
          value={botToken}
          onChange={(e) => setBotToken(e.target.value)}
          placeholder="Slack API token"
          className="w-full bg-transparent border-b border-slate-300 dark:border-slate-600 text-sm text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-500 py-2 px-1 focus:outline-none focus:border-primary dark:focus:border-blue-400 transition-colors"
        />
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-primary dark:bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-primary/90 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

function RepositoryTab() {
  const {
    isConfigured,
    isLoading: isLoadingInfo,
    mutate: mutateInfo,
  } = useRepoSettingsInfo();
  const {
    settings,
    isLoading: isLoadingSettings,
    mutate: mutateSettings,
  } = useRepoSettings(isConfigured);
  const {
    isChecking,
    isSaving,
    isDeleting,
    checkAccess,
    saveSettings,
    deleteSettings,
  } = useManageRepoSettings();
  const [formRevision, setFormRevision] = useState(0);

  const handleCheckAccess = useCallback(
    async (payload: RepoSettings) => {
      try {
        await checkAccess(payload);
        toast.success("Repository access verified successfully");
      } catch (error: any) {
        toast.error(
          "Verification failed. Please check the data and try again.",
        );
      }
    },
    [checkAccess],
  );

  const handleSave = useCallback(
    async (payload: RepoSettings) => {
      try {
        await saveSettings(payload);
        toast.success("Repository settings saved successfully");
        await mutateInfo();
        await mutateSettings();
        setFormRevision((r) => r + 1);
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to save repository settings";
        toast.error(errorMessage);
      }
    },
    [saveSettings, mutateInfo, mutateSettings],
  );

  const handleUnlink = useCallback(async () => {
    if (
      confirm(
        "Are you sure you want to unlink the repository? This will remove all version control settings.",
      )
    ) {
      try {
        await deleteSettings();
        toast.success("Repository unlinked successfully");
        await mutateSettings(undefined, { revalidate: false });
        await mutateInfo();
        setFormRevision((r) => r + 1);
      } catch (error: any) {
        toast.error("Failed to unlink repository");
      }
    }
  }, [deleteSettings, mutateInfo, mutateSettings]);

  if (isLoadingInfo || isLoadingSettings) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground dark:text-slate-400">
        <p className="text-sm">Loading repository settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <RepositorySettingsForm
        key={formRevision}
        onCheckAccess={handleCheckAccess}
        onSave={handleSave}
        isChecking={isChecking}
        isSaving={isSaving}
        initialValues={settings}
      />

      {isConfigured && (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={handleUnlink}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <Link2Off className="h-4 w-4 mr-2" />
            {isDeleting ? "Unlinking..." : "Unlink repository"}
          </Button>
        </div>
      )}
    </div>
  );
}

function TrendzTab() {
  const [enabled, setEnabled] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    SettingsService.getTrendzSettings()
      .then((data) => {
        setEnabled(data?.enabled ?? false);
        setBaseUrl(data?.baseUrl ?? "");
        setApiKey(data?.apiKey ?? "");
      })
      .catch(() => {
        toast.error("Failed to load Trendz settings");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await SettingsService.updateTrendzSettings({ enabled, baseUrl, apiKey });
      toast.success("Trendz settings saved successfully");
    } catch (error: any) {
      toast.error("Failed to save Trendz settings");
    } finally {
      setIsSaving(false);
    }
  }, [enabled, baseUrl, apiKey]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground dark:text-slate-400">
        <p className="text-sm">Loading Trendz settings...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground dark:text-white">
          Trendz settings
        </h2>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-white transition-colors"
          title="Help"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Form row: checkbox + inputs */}
      <div className="flex items-center gap-6 mb-6">
        {/* Enable Trendz checkbox */}
        <label className="flex items-center gap-2 cursor-pointer shrink-0">
          <div className="relative">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="sr-only peer"
              id="enable-trendz"
            />
            <div className="w-4 h-4 border-2 border-red-500 dark:border-red-400 rounded-sm flex items-center justify-center peer-checked:bg-red-500 dark:peer-checked:bg-red-400 transition-colors">
              {enabled && (
                <svg
                  className="w-3 h-3 text-white"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </div>
          <span className="text-sm text-red-500 dark:text-red-400 font-medium select-none">
            Enable Trendz
          </span>
        </label>

        {/* Trendz URL */}
        <div className="flex-1">
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="Trendz URL"
            className="w-full bg-slate-50 dark:bg-slate-700/50 border-b border-slate-300 dark:border-slate-600 text-sm text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-500 py-2 px-3 focus:outline-none focus:border-primary dark:focus:border-blue-400 transition-colors"
          />
        </div>

        {/* Trendz API key */}
        <div className="flex-1">
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Trendz API key"
            className="w-full bg-slate-50 dark:bg-slate-700/50 border-b border-slate-300 dark:border-slate-600 text-sm text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-500 py-2 px-3 focus:outline-none focus:border-primary dark:focus:border-blue-400 transition-colors"
          />
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-primary dark:bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-primary/90 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-center h-32 text-muted-foreground dark:text-slate-400">
        <p className="text-sm">
          <span className="font-medium dark:text-white">{label}</span> — coming
          soon
        </p>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const currentTab = (params?.tab as TabId) || "notifications";

  const handleTabChange = useCallback(
    (tabId: TabId) => {
      router.push(`/settings/${tabId}`);
    },
    [router],
  );

  const renderTabContent = () => {
    switch (currentTab) {
      case "notifications":
        return <NotificationsTab />;
      case "repository":
        return <RepositoryTab />;
      case "auto-commit":
        return <AutoCommitTab />;
      case "trendz":
        return <TrendzTab />;
      case "ai-models":
        return <AiModelsTab />;
      default:
        return <NotificationsTab />;
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700/50 mb-6">
        <nav className="flex gap-0 -mb-px">
          {TABS.map((tab) => {
            const isActive = currentTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`
                                    flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                                    ${
                                      isActive
                                        ? "border-primary dark:border-blue-400 text-primary dark:text-blue-400"
                                        : "border-transparent text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600"
                                    }
                                `}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      {renderTabContent()}
    </div>
  );
}
