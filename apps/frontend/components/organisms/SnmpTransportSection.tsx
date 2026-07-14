"use client";

import Select from "@/components/molecules/PortalSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, X } from "lucide-react";
import {
  isValidSnmpOid,
  requiresSnmpQueryingFrequency,
} from "@/hooks/thingsboard/device-profile/useSnmpTransportForm";

type SnmpScope =
  | "CLIENT_ATTRIBUTES_QUERYING"
  | "SHARED_ATTRIBUTES_SETTING"
  | "TELEMETRY_QUERYING"
  | "TO_DEVICE_RPC_REQUEST"
  | "TO_SERVER_RPC_REQUEST";
type SnmpDataType = "STRING" | "LONG" | "DOUBLE" | "BOOLEAN";

type SnmpMappingForm = {
  id: string;
  dataType: SnmpDataType;
  key: string;
  oid: string;
};

type SnmpCommunicationConfigForm = {
  id: string;
  spec: SnmpScope;
  queryingFrequencyMs: string;
  mappings: SnmpMappingForm[];
};

type SnmpTransportSectionProps = {
  timeoutMs: string;
  retries: string;
  communicationConfigs: SnmpCommunicationConfigForm[];
  scopeOptions: Array<{ value: SnmpScope; label: string }>;
  dataTypeOptions: Array<{ value: SnmpDataType; label: string }>;
  disabled?: boolean;
  onTimeoutChange: (value: string) => void;
  onRetriesChange: (value: string) => void;
  onUpdateCommunicationConfig: (
    configId: string,
    field: "spec" | "queryingFrequencyMs",
    value: string,
  ) => void;
  onRemoveCommunicationConfig: (configId: string) => void;
  onAddMapping: (configId: string) => void;
  onUpdateMapping: (
    configId: string,
    mappingId: string,
    field: "dataType" | "key" | "oid",
    value: string,
  ) => void;
  onRemoveMapping: (configId: string, mappingId: string) => void;
  onAddCommunicationConfig: () => void;
};

export function SnmpTransportSection({
  timeoutMs,
  retries,
  communicationConfigs,
  scopeOptions,
  dataTypeOptions,
  disabled = false,
  onTimeoutChange,
  onRetriesChange,
  onUpdateCommunicationConfig,
  onRemoveCommunicationConfig,
  onAddMapping,
  onUpdateMapping,
  onRemoveMapping,
  onAddCommunicationConfig,
}: SnmpTransportSectionProps) {
  const selectedScopes = new Set(
    communicationConfigs.map((config) => config.spec),
  );
  const canAddCommunicationConfig = scopeOptions.some(
    (option) => !selectedScopes.has(option.value),
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Timeout, ms*</label>
          <Input
            type="number"
            min={1}
            step={1}
            value={timeoutMs}
            onChange={(event) => onTimeoutChange(event.target.value)}
            disabled={disabled}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Retries*</label>
          <Input
            type="number"
            min={0}
            value={retries}
            onChange={(event) => onRetriesChange(event.target.value)}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium">Communication configs</label>

        {communicationConfigs.map((config, index) => (
          <div
            key={config.id}
            className="space-y-3 rounded-lg border border-muted p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-medium text-foreground">
                Communication config {index + 1}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemoveCommunicationConfig(config.id)}
                className="gap-2 text-muted-foreground"
                aria-label={`Remove communication config ${index + 1}`}
                title="Remove communication config"
                disabled={disabled}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div
              className={[
                "grid gap-3 sm:items-end",
                requiresSnmpQueryingFrequency(config.spec)
                  ? "sm:grid-cols-[minmax(0,1fr)_150px_auto]"
                  : "sm:grid-cols-[minmax(0,1fr)_auto]",
              ].join(" ")}
            >
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Scope</label>
                <Select
                  options={scopeOptions.filter(
                    (option) =>
                      option.value === config.spec ||
                      !communicationConfigs.some(
                        (otherConfig) =>
                          otherConfig.id !== config.id &&
                          otherConfig.spec === option.value,
                      ),
                  )}
                  value={config.spec}
                  onValueChange={(value) =>
                    onUpdateCommunicationConfig(
                      config.id,
                      "spec",
                      (value as SnmpScope) ?? "CLIENT_ATTRIBUTES_QUERYING",
                    )
                  }
                  disabled={disabled}
                />
              </div>
              {requiresSnmpQueryingFrequency(config.spec) && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">
                    Querying frequency, ms*
                  </label>
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    value={config.queryingFrequencyMs}
                    onChange={(event) =>
                      onUpdateCommunicationConfig(
                        config.id,
                        "queryingFrequencyMs",
                        event.target.value,
                      )
                    }
                    disabled={disabled}
                  />
                </div>
              )}
              <div />
            </div>

            <div className="space-y-2">
              <div className="grid gap-2 sm:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)_auto]">
                <div className="text-xs font-medium text-muted-foreground">
                  Data type
                </div>
                <div className="text-xs font-medium text-muted-foreground">
                  Data key *
                </div>
                <div className="text-xs font-medium text-muted-foreground">
                  OID *
                </div>
                <div />
              </div>

              {config.mappings.map((mapping) => (
                <div
                  key={mapping.id}
                  className="grid gap-2 sm:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center"
                >
                  <Select
                    options={dataTypeOptions}
                    value={mapping.dataType}
                    onValueChange={(value) =>
                      onUpdateMapping(
                        config.id,
                        mapping.id,
                        "dataType",
                        (value as SnmpDataType) ?? "STRING",
                      )
                    }
                    disabled={disabled}
                  />
                  <Input
                    value={mapping.key}
                    onChange={(event) =>
                      onUpdateMapping(
                        config.id,
                        mapping.id,
                        "key",
                        event.target.value,
                      )
                    }
                    placeholder="Data key"
                    disabled={disabled}
                  />
                  <Input
                    value={mapping.oid}
                    onChange={(event) =>
                      onUpdateMapping(
                        config.id,
                        mapping.id,
                        "oid",
                        event.target.value,
                      )
                    }
                    placeholder="OID"
                    aria-invalid={Boolean(
                      mapping.oid.trim() && !isValidSnmpOid(mapping.oid),
                    )}
                    disabled={disabled}
                  />
                  {mapping.oid.trim() && !isValidSnmpOid(mapping.oid) && (
                    <div className="sm:col-start-3 text-xs text-destructive">
                      Invalid OID format. Use dotted numeric notation, for
                      example 1.3.6.1 or .1.3.6.1.
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveMapping(config.id, mapping.id)}
                    className="text-muted-foreground"
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => onAddMapping(config.id)}
              disabled={disabled}
            >
              <Plus className="h-4 w-4" />
              Add mapping
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={onAddCommunicationConfig}
          disabled={disabled || !canAddCommunicationConfig}
        >
          <Plus className="h-4 w-4" />
          Add communication config
        </Button>
      </div>
    </div>
  );
}
