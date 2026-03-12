"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Eye, EyeOff, HelpCircle } from "lucide-react";
import { DataTable } from "@/components/molecules/DataTable";
import { SettingsService } from "@/lib/services/thingsboardServices/settingsService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SelectAdmin as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/admin_select";

// Provider config
const PROVIDERS = [
  { value: "ANTHROPIC", label: "Anthropic" },
  { value: "OPEN_AI", label: "OpenAI" },
  { value: "MISTRAL_AI", label: "Mistral AI" },
] as const;

type ProviderType = (typeof PROVIDERS)[number]["value"];

// Fields per provider
const ANTHROPIC_FIELDS = [
  "temperature",
  "topP",
  "topK",
  "maxOutputTokens",
] as const;
const OPENAI_MISTRAL_FIELDS = [
  "temperature",
  "topP",
  "presencePenalty",
  "frequencyPenalty",
  "maxOutputTokens",
] as const;

const FIELD_LABELS: Record<string, string> = {
  temperature: "Temperature",
  topP: "Top P",
  topK: "Top K",
  maxOutputTokens: "Maximum output tokens",
  presencePenalty: "Presence penalty",
  frequencyPenalty: "Frequency penalty",
};

const FIELD_STEPS: Record<string, number> = {
  temperature: 0.1,
  topP: 0.1,
  topK: 1,
  maxOutputTokens: 1,
  presencePenalty: 1,
  frequencyPenalty: 1,
};

function getFieldsForProvider(provider: ProviderType) {
  return provider === "ANTHROPIC" ? ANTHROPIC_FIELDS : OPENAI_MISTRAL_FIELDS;
}

// ============ AI MODEL MODAL ============
interface AiModelModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editModel?: any;
}

function AiModelModal({
  open,
  onClose,
  onSaved,
  editModel,
}: AiModelModalProps) {
  const [name, setName] = useState("");
  const [provider, setProvider] = useState<ProviderType>("ANTHROPIC");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [modelId, setModelId] = useState("");
  const [configFields, setConfigFields] = useState<
    Record<string, number | null>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [connectivityResult, setConnectivityResult] = useState<any>(null);

  // Populate form on edit
  useEffect(() => {
    if (editModel) {
      setName(editModel.name || "");
      setProvider(editModel.configuration?.provider || "ANTHROPIC");
      setApiKey(editModel.configuration?.providerConfig?.apiKey || "");
      setModelId(editModel.configuration?.modelId || "");
      const fields: Record<string, number | null> = {};
      const config = editModel.configuration || {};
      for (const key of [
        "temperature",
        "topP",
        "topK",
        "maxOutputTokens",
        "presencePenalty",
        "frequencyPenalty",
      ]) {
        fields[key] = config[key] ?? null;
      }
      setConfigFields(fields);
    } else {
      setName("");
      setProvider("ANTHROPIC");
      setApiKey("");
      setModelId("");
      setConfigFields({});
    }
    setShowApiKey(false);
    setConnectivityResult(null);
  }, [editModel, open]);

  const handleFieldChange = (key: string, value: string) => {
    if (value === "" || value === "Set") {
      setConfigFields((prev) => ({ ...prev, [key]: null }));
    } else {
      setConfigFields((prev) => ({ ...prev, [key]: parseFloat(value) }));
    }
  };

  const handleCheckConnectivity = useCallback(async () => {
    setIsChecking(true);
    setConnectivityResult(null);
    try {
      const payload = {
        userMessage: {
          contents: [
            { contentType: "TEXT", text: "What is the capital of Ukraine?" },
          ],
        },
        chatModelConfig: {
          modelType: "CHAT",
          provider,
          providerConfig: { apiKey },
          modelId,
          maxRetries: 0,
          timeoutSeconds: 20,
        },
      };
      const result = await SettingsService.checkAiModelConnectivity(payload);
      setConnectivityResult(result);
    } catch (error: any) {
      setConnectivityResult({
        status: "FAILURE",
        errorDetails: error?.message || "Connection failed",
      });
    } finally {
      setIsChecking(false);
    }
  }, [provider, apiKey, modelId]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const payload: any = {
        name,
        modelType: "CHAT",
        configuration: {
          provider,
          providerConfig: { apiKey },
          modelId,
          temperature: configFields.temperature ?? null,
          topP: configFields.topP ?? null,
          maxOutputTokens: configFields.maxOutputTokens ?? null,
        },
      };

      // Add provider-specific fields
      if (provider === "ANTHROPIC") {
        payload.configuration.topK = configFields.topK ?? null;
      } else {
        payload.configuration.frequencyPenalty =
          configFields.frequencyPenalty ?? null;
        payload.configuration.presencePenalty =
          configFields.presencePenalty ?? null;
      }

      // If editing, include the id
      if (editModel?.id) {
        payload.id = editModel.id;
      }

      await SettingsService.saveAiModel(payload);
      toast.success("AI model saved successfully");
      onSaved();
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save AI model");
    } finally {
      setIsSaving(false);
    }
  }, [
    name,
    provider,
    apiKey,
    modelId,
    configFields,
    editModel,
    onSaved,
    onClose,
  ]);

  const fields = getFieldsForProvider(provider);
  const canCheck =
    name.trim() !== "" && apiKey.trim() !== "" && modelId.trim() !== "";

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader className="bg-white dark:bg-slate-800 -m-6 mb-0 p-4 rounded-t-lg">
            <DialogTitle className="dark:text-white flex items-center justify-between">
              Add AI model
            </DialogTitle>
            <DialogDescription className="sr-only">
              Configure an AI model
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-4">
            {/* Name */}
            <fieldset className="border border-slate-300 dark:border-slate-600 rounded-md p-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name*"
                className="w-full bg-transparent text-sm text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-500 focus:outline-none"
              />
            </fieldset>

            {/* Provider section */}
            <fieldset className="border border-slate-300 dark:border-slate-600 rounded-md p-4 space-y-4">
              <legend className="text-sm font-semibold text-foreground dark:text-white px-2">
                Provider
              </legend>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground dark:text-slate-400">
                  AI provider
                </Label>
                <Select
                  value={provider}
                  onValueChange={(val: string) =>
                    setProvider(val as ProviderType)
                  }
                >
                  <SelectTrigger className="w-full dark:text-white border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </fieldset>

            {/* API Key */}
            <fieldset className="border border-slate-300 dark:border-slate-600 rounded-md p-3">
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="API key*"
                  className="w-full bg-transparent text-sm text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-500 focus:outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-white"
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </fieldset>

            {/* Configuration section */}
            <fieldset className="border border-slate-300 dark:border-slate-600 rounded-md p-4 space-y-3">
              <legend className="text-sm font-semibold text-foreground dark:text-white px-2">
                Configuration
              </legend>

              {/* Model ID */}
              <fieldset className="border border-slate-200 dark:border-slate-700 rounded-md p-3">
                <input
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value)}
                  placeholder="Model ID*"
                  className="w-full bg-transparent text-sm text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-500 focus:outline-none"
                />
              </fieldset>

              {/* Optional numeric fields */}
              {fields.map((field) => (
                <fieldset
                  key={field}
                  className="border border-slate-200 dark:border-slate-700 rounded-md p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground dark:text-white">
                        {FIELD_LABELS[field]}
                      </span>
                      <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600 inline-block" />
                    </div>
                    <input
                      type="number"
                      step={FIELD_STEPS[field]}
                      value={configFields[field] ?? ""}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      placeholder="Set"
                      className="w-20 text-right bg-transparent text-sm text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-500 focus:outline-none border-none"
                    />
                  </div>
                </fieldset>
              ))}
            </fieldset>
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between pt-4">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-primary dark:text-blue-400 hover:underline font-medium"
            >
              Cancel
            </button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCheckConnectivity}
                disabled={isChecking || !canCheck}
                className="dark:text-white dark:border-slate-600"
              >
                {isChecking ? "Checking..." : "Check connectivity"}
              </Button>
              <Button onClick={handleSave} disabled={isSaving || !canCheck}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Connectivity result dialog */}
      <Dialog
        open={connectivityResult !== null}
        onOpenChange={() => setConnectivityResult(null)}
      >
        <DialogContent className="sm:max-w-md dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              {connectivityResult?.status === "SUCCESS"
                ? "✅ Connection successful"
                : "❌ Connection failed"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Connectivity check result
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {connectivityResult?.status === "SUCCESS" ? (
              <p className="text-sm text-foreground dark:text-slate-300">
                <span className="font-medium dark:text-white">Response:</span>{" "}
                {connectivityResult.generatedContent}
              </p>
            ) : (
              <p className="text-sm text-red-500 dark:text-red-400 break-all">
                {connectivityResult?.errorDetails || "Unknown error"}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setConnectivityResult(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============ AI MODELS TAB ============
export function AiModelsTab() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  const [sortProperty, setSortProperty] = useState("createdTime");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editModel, setEditModel] = useState<any>(undefined);

  const fetchModels = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await SettingsService.getAiModels(
        currentPage,
        pageSize,
        sortProperty,
        sortOrder,
      );
      setData(result.data || []);
      setTotalPages(result.totalPages || 0);
      setTotalElements(result.totalElements || 0);
    } catch (error: any) {
      toast.error("Failed to load AI models");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, sortProperty, sortOrder]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const handleDelete = useCallback(
    async (modelId: string) => {
      if (confirm("Are you sure you want to delete this AI model?")) {
        try {
          await SettingsService.deleteAiModel(modelId);
          toast.success("AI model deleted");
          fetchModels();
        } catch (error: any) {
          toast.error("Failed to delete AI model");
        }
      }
    },
    [fetchModels],
  );

  const handleSortChange = useCallback(
    (property: string) => {
      if (property === sortProperty) {
        setSortOrder((prev) => (prev === "ASC" ? "DESC" : "ASC"));
      } else {
        setSortProperty(property);
        setSortOrder("DESC");
      }
    },
    [sortProperty],
  );

  const handleAdd = useCallback(() => {
    setEditModel(undefined);
    setModalOpen(true);
  }, []);

  const handleRowClick = useCallback((item: any) => {
    setEditModel(item);
    setModalOpen(true);
  }, []);

  const columns = [
    {
      key: "createdTime",
      header: "Created time",
      sortable: true,
      render: (item: any) => {
        const date = new Date(item.createdTime);
        return (
          <span className="text-sm text-foreground dark:text-white">
            {date.toLocaleString("pl-PL", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        );
      },
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (item: any) => (
        <span className="text-sm text-foreground dark:text-white">
          {item.name}
        </span>
      ),
    },
    {
      key: "provider",
      header: "Provider",
      sortable: false,
      render: (item: any) => {
        const prov = PROVIDERS.find(
          (p) => p.value === item.configuration?.provider,
        );
        return (
          <span className="text-sm text-foreground dark:text-white">
            {prov?.label || item.configuration?.provider}
          </span>
        );
      },
    },
    {
      key: "modelId",
      header: "Model",
      sortable: false,
      render: (item: any) => (
        <span className="text-sm text-primary dark:text-blue-400">
          {item.configuration?.modelId}
        </span>
      ),
    },
  ];

  return (
    <>
      <DataTable
        title="AI models"
        data={data}
        columns={columns}
        getRowId={(item: any) => item.id?.id || item.id}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        sortProperty={sortProperty}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onAdd={handleAdd}
        onRefresh={fetchModels}
        onRowClick={handleRowClick}
        addButtonLabel="Add model"
        emptyMessage="No AI models found."
        rowActions={(item: any) => (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setEditModel(item);
                setModalOpen(true);
              }}
              className="p-1.5 text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-white transition-colors"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(item.id?.id || item.id);
              }}
              className="p-1.5 text-muted-foreground hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      />

      <AiModelModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchModels}
        editModel={editModel}
      />
    </>
  );
}
