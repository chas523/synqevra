"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SelectAdmin as Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/admin_select";
import type { RestApiCallConfig, HttpMethod } from "@/types/ruleNodeConfig";

const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "DELETE"];

interface RestApiCallFormProps {
  name: string;
  description: string;
  config: RestApiCallConfig;
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onConfigChange: (c: RestApiCallConfig) => void;
}

export function RestApiCallForm({
  name,
  description,
  config,
  onNameChange,
  onDescriptionChange,
  onConfigChange,
}: RestApiCallFormProps) {
  // Use local state for headers similarly to OriginatorFieldsForm to handle empty rungs correctly
  const [localHeaders, setLocalHeaders] = useState<[string, string][]>(() =>
    Object.entries(config.headers ?? {}),
  );

  const syncHeaders = (entries: [string, string][]) => {
    const map: Record<string, string> = {};
    entries.forEach(([k, v]) => {
      if (k) map[k] = v;
    });
    onConfigChange({ ...config, headers: map });
  };

  const addHeader = () => {
    const next: [string, string][] = [...localHeaders, ["", ""]];
    setLocalHeaders(next);
  };

  const removeHeader = (idx: number) => {
    const next = localHeaders.filter((_, i) => i !== idx);
    setLocalHeaders(next);
    syncHeaders(next);
  };

  const updateHeader = (idx: number, field: "key" | "value", val: string) => {
    const next = localHeaders.map(([k, v], i) =>
      i === idx ? (field === "key" ? [val, v] : [k, val]) : [k, v],
    ) as [string, string][];
    setLocalHeaders(next);
    syncHeaders(next);
  };

  return (
    <div className="space-y-5">
      {/* Name */}
      <div className="space-y-1.5">
        <Label className="dark:text-white text-xs">
          Name<span className="text-red-500 ml-0.5">*</span>
        </Label>
        <Input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Name"
          className="dark:bg-slate-800 dark:text-white dark:border-slate-700"
        />
      </div>

      {/* Endpoint URL + Method */}
      <div className="space-y-1.5">
        <Label className="dark:text-white text-xs">
          Endpoint URL pattern<span className="text-red-500 ml-0.5">*</span>
        </Label>
        <div className="flex gap-2">
          <Select
            value={config.requestMethod}
            onValueChange={(v) =>
              onConfigChange({ ...config, requestMethod: v as HttpMethod })
            }
          >
            <SelectTrigger className="w-24 shrink-0 dark:bg-slate-800 dark:text-white dark:border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HTTP_METHODS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={config.restEndpointUrlPattern}
            onChange={(e) =>
              onConfigChange({
                ...config,
                restEndpointUrlPattern: e.target.value,
              })
            }
            placeholder="https://example.com/api/endpoint"
            className="flex-1 dark:bg-slate-800 dark:text-white dark:border-slate-700"
          />
        </div>
        <p className="text-[10px] text-muted-foreground dark:text-slate-500">
          Supports templatization:{" "}
          <code className="bg-muted dark:bg-slate-700 px-0.5 rounded text-[10px]">
            $&#123;metadataKey&#125;
          </code>
        </p>
      </div>

      {/* Headers */}
      <div className="space-y-2 border rounded-md p-3 dark:border-slate-700 dark:bg-slate-800/30">
        <p className="text-xs font-semibold dark:text-white">Headers</p>
        <p className="text-[10px] text-muted-foreground dark:text-slate-500 mb-2">
          Use{" "}
          <code className="bg-muted dark:bg-slate-700 px-0.5 rounded text-[10px]">
            ${"{metadataKey}"}
          </code>{" "}
          for value from metadata,{" "}
          <code className="bg-muted dark:bg-slate-700 px-0.5 rounded text-[10px]">
            ${"{[messageKey]}"}
          </code>{" "}
          for value from message body in header/value fields
        </p>
        {localHeaders.length > 0 && (
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs text-muted-foreground dark:text-slate-400 pb-1 border-b dark:border-slate-700">
            <span>Header*</span>
            <span>Value*</span>
            <span />
          </div>
        )}
        <div className="space-y-2">
          {localHeaders.map(([k, v], idx) => (
            <div
              key={idx}
              className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center"
            >
              <Input
                value={k}
                onChange={(e) => updateHeader(idx, "key", e.target.value)}
                placeholder="Header"
                className="h-8 text-xs dark:bg-slate-800 dark:text-white dark:border-slate-700"
              />
              <Input
                value={v}
                onChange={(e) => updateHeader(idx, "value", e.target.value)}
                placeholder="Value"
                className="h-8 text-xs dark:bg-slate-800 dark:text-white dark:border-slate-700"
              />
              <button
                type="button"
                onClick={() => removeHeader(idx)}
                className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-muted dark:hover:bg-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="h-8 text-xs gap-1 bg-[#305680] hover:bg-[#254363] text-white mt-1 px-4"
          onClick={addHeader}
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>

      {/* Timeouts / parallelism */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="dark:text-white text-xs">
            Read timeout in millis
          </Label>
          <Input
            type="number"
            min={0}
            value={config.readTimeoutMs ?? ""}
            onChange={(e) =>
              onConfigChange({
                ...config,
                readTimeoutMs:
                  e.target.value !== "" ? Number(e.target.value) : "",
              })
            }
            className="dark:bg-slate-800 dark:text-white dark:border-slate-700"
          />
          <p className="text-[10px] text-muted-foreground dark:text-slate-500">
            The value of 0 means an infinite timeout
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="dark:text-white text-xs">
            Max number of parallel requests
          </Label>
          <Input
            type="number"
            min={0}
            value={config.maxParallelRequestsCount ?? ""}
            onChange={(e) =>
              onConfigChange({
                ...config,
                maxParallelRequestsCount:
                  e.target.value !== "" ? Number(e.target.value) : "",
              })
            }
            className="dark:bg-slate-800 dark:text-white dark:border-slate-700"
          />
          <p className="text-[10px] text-muted-foreground dark:text-slate-500">
            The value of 0 specifies no limit in parallel processing
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="dark:text-white text-xs">
            Max response size (in KB)
          </Label>
          <Input
            type="number"
            min={0}
            value={config.maxInMemoryBufferSizeInKb}
            onChange={(e) =>
              onConfigChange({
                ...config,
                maxInMemoryBufferSizeInKb: Number(e.target.value),
              })
            }
            className="dark:bg-slate-800 dark:text-white dark:border-slate-700"
          />
          <p className="text-[10px] text-muted-foreground dark:text-slate-500">
            The maximum amount of memory allocated for buffering data when
            decoding or encoding HTTP messages, such as JSON or XML payloads
          </p>
        </div>
      </div>

      {/* Flags */}
      <div className="space-y-2">
        {[
          {
            key: "enableProxy" as const,
            label: "Enable proxy",
            desc: "",
          },
          {
            key: "useSimpleClientHttpFactory" as const,
            label: "Use simple client HTTP factory",
            desc: "",
          },
          {
            key: "parseToPlainText" as const,
            label: "Parse to plain text",
            desc: 'If selected, request body message payload will be transformed from JSON string to plain text, e.g. msg = "Hello,\\t"world"" will be parsed to Hello, "world"',
          },
          {
            key: "ignoreRequestBody" as const,
            label: "Without request body",
            desc: "",
          },
        ].map(({ key, label, desc }) => (
          <div
            key={key}
            className="flex items-center justify-between border rounded-md p-3 dark:border-slate-700"
          >
            <div>
              <p className="text-xs font-medium dark:text-white">{label}</p>
              {desc && (
                <p className="text-[10px] text-muted-foreground dark:text-slate-500 max-w-[400px]">
                  {desc}
                </p>
              )}
            </div>
            <Switch
              checked={config[key] as boolean}
              onCheckedChange={(v) => onConfigChange({ ...config, [key]: v })}
            />
          </div>
        ))}

        {/* Proxy sub-form - only visible when enabled */}
        {config.enableProxy && (
          <div className="space-y-3 mt-1 border-t pt-3 dark:border-slate-800 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center space-x-2">
              <Switch
                id="useSysProxy"
                checked={config.useSystemProxyProperties}
                onCheckedChange={(v) =>
                  onConfigChange({ ...config, useSystemProxyProperties: v })
                }
              />
              <Label htmlFor="useSysProxy" className="text-xs">
                Use system proxy properties
              </Label>
            </div>

            {!config.useSystemProxyProperties && (
              <div className="grid grid-cols-2 gap-3 pl-2 border-l-2 border-slate-100 dark:border-slate-800">
                <div className="space-y-1.5">
                  <Label className="text-xs">Proxy scheme*</Label>
                  <Select
                    value={config.proxyScheme || "http"}
                    onValueChange={(v) =>
                      onConfigChange({ ...config, proxyScheme: v })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs dark:bg-slate-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="http">HTTP</SelectItem>
                      <SelectItem value="https">HTTPS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Proxy host*</Label>
                  <Input
                    value={config.proxyHost || ""}
                    onChange={(e) =>
                      onConfigChange({ ...config, proxyHost: e.target.value })
                    }
                    className="h-8 text-xs dark:bg-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Proxy port*</Label>
                  <Input
                    type="number"
                    min={0}
                    value={config.proxyPort ?? ""}
                    onChange={(e) =>
                      onConfigChange({
                        ...config,
                        proxyPort: Number(e.target.value),
                      })
                    }
                    className="h-8 text-xs dark:bg-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Proxy user</Label>
                  <Input
                    value={config.proxyUser || ""}
                    onChange={(e) =>
                      onConfigChange({ ...config, proxyUser: e.target.value })
                    }
                    className="h-8 text-xs dark:bg-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Proxy password</Label>
                  <Input
                    type="password"
                    value={config.proxyPassword || ""}
                    onChange={(e) =>
                      onConfigChange({
                        ...config,
                        proxyPassword: e.target.value,
                      })
                    }
                    className="h-8 text-xs dark:bg-slate-800"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Credentials */}
      <div className="border rounded-md p-3 dark:border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold dark:text-white">Credentials</p>
          <p className="text-[10px] text-muted-foreground dark:text-slate-500 capitalize">
            {config.credentials.type}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="dark:text-white text-xs">Credentials type*</Label>
          <Select
            value={config.credentials.type}
            onValueChange={(v) =>
              onConfigChange({
                ...config,
                credentials: { ...config.credentials, type: v as any },
              })
            }
          >
            <SelectTrigger className="text-sm dark:bg-slate-800 dark:text-white dark:border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="anonymous">Anonymous</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="pem">PEM</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {config.credentials.type === "basic" && (
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t dark:border-slate-700">
            <div className="space-y-1.5">
              <Label className="text-xs dark:text-slate-300">Username*</Label>
              <Input
                value={config.credentials.username || ""}
                onChange={(e) =>
                  onConfigChange({
                    ...config,
                    credentials: {
                      ...config.credentials,
                      username: e.target.value,
                    },
                  })
                }
                className="h-8 text-xs dark:bg-slate-800 dark:text-white dark:border-slate-700"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs dark:text-slate-300">Password</Label>
              <Input
                type="password"
                value={config.credentials.password || ""}
                onChange={(e) =>
                  onConfigChange({
                    ...config,
                    credentials: {
                      ...config.credentials,
                      password: e.target.value,
                    },
                  })
                }
                className="h-8 text-xs dark:bg-slate-800 dark:text-white dark:border-slate-700"
              />
            </div>
          </div>
        )}

        {config.credentials.type === "pem" && (
          <div className="mt-2 pt-2 border-t dark:border-slate-700">
            <div className="space-y-1.5">
              <Label className="text-xs dark:text-slate-300">
                Server PEM certificate*
              </Label>
              <Textarea
                value={config.credentials.cert || ""}
                onChange={(e) =>
                  onConfigChange({
                    ...config,
                    credentials: {
                      ...config.credentials,
                      cert: e.target.value,
                    },
                  })
                }
                placeholder="-----BEGIN CERTIFICATE-----"
                className="text-xs dark:bg-slate-800 dark:text-white dark:border-slate-700 min-h-[100px] font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label className="dark:text-white text-xs">Rule node description</Label>
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Rule node description"
          className="dark:bg-slate-800 dark:text-white dark:border-slate-700 min-h-[80px] resize-none"
        />
      </div>
    </div>
  );
}
