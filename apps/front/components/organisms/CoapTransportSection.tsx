"use client";

import Editor from "@monaco-editor/react";
import Select from "@/components/molecules/PortalSelect";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp } from "lucide-react";

type TransportPayloadType = "JSON" | "PROTOBUF";
type PowerMode = "DRX" | "EDRX" | "PSM";
type TimeUnit = "MILLISECONDS" | "SECONDS" | "MINUTES" | "HOURS";
type CoapProtoSchemaSection =
  | "telemetry"
  | "attributes"
  | "rpcRequest"
  | "rpcResponse";

type CoapTransportState = {
  coapDeviceType: "DEFAULT" | "EFENTO";
  coapPayloadType: TransportPayloadType;
  coapTelemetryProtoSchema: string;
  coapAttributesProtoSchema: string;
  coapRpcRequestProtoSchema: string;
  coapRpcResponseProtoSchema: string;
  coapPowerMode: PowerMode;
  coapPsmActivityTimer: string;
  coapPsmActivityTimerTimeUnit: TimeUnit;
  coapEdrxCycle: string;
  coapEdrxCycleTimeUnit: TimeUnit;
  coapPagingTransmissionWindow: string;
  coapPagingTransmissionWindowTimeUnit: TimeUnit;
};

type CoapTransportSectionProps = {
  formState: CoapTransportState;
  payloadTypeOptions: Array<{ value: TransportPayloadType; label: string }>;
  powerModeOptions: Array<{ value: PowerMode; label: string }>;
  timeUnitOptions: Array<{ value: TimeUnit; label: string }>;
  expandedCoapProtoSections: Set<CoapProtoSchemaSection>;
  editorTheme: "light" | "vs-dark";
  isSaving: boolean;
  disabled?: boolean;
  onToggleCoapProtoSection: (section: CoapProtoSchemaSection) => void;
  onUpdateField: (
    field:
      | "coapDeviceType"
      | "coapPayloadType"
      | "coapTelemetryProtoSchema"
      | "coapAttributesProtoSchema"
      | "coapRpcRequestProtoSchema"
      | "coapRpcResponseProtoSchema"
      | "coapPowerMode"
      | "coapPsmActivityTimer"
      | "coapPsmActivityTimerTimeUnit"
      | "coapEdrxCycle"
      | "coapEdrxCycleTimeUnit"
      | "coapPagingTransmissionWindow"
      | "coapPagingTransmissionWindowTimeUnit",
    value: string,
  ) => void;
};

export function CoapTransportSection({
  formState,
  payloadTypeOptions,
  powerModeOptions,
  timeUnitOptions,
  expandedCoapProtoSections,
  editorTheme,
  isSaving,
  disabled,
  onToggleCoapProtoSection,
  onUpdateField,
}: CoapTransportSectionProps) {
  const isDisabled = disabled ?? isSaving;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-muted p-4">
        <label className="mb-1 block text-sm font-medium">
          CoAP device type
        </label>
        <Select
          options={[
            { value: "DEFAULT", label: "Default" },
            { value: "EFENTO", label: "Efento NB-IoT" },
          ]}
          value={formState.coapDeviceType}
          onValueChange={(value) =>
            onUpdateField(
              "coapDeviceType",
              (value as "DEFAULT" | "EFENTO") ?? "DEFAULT",
            )
          }
          disabled={isDisabled}
        />
      </div>

      {formState.coapDeviceType === "DEFAULT" && (
        <>
          <div className="rounded-lg border border-muted p-4">
            <label className="mb-1 block text-sm font-medium">
              CoAP device payload
            </label>
            <Select
              options={payloadTypeOptions}
              value={formState.coapPayloadType}
              onValueChange={(value) =>
                onUpdateField(
                  "coapPayloadType",
                  (value as TransportPayloadType) ?? "JSON",
                )
              }
              disabled={isDisabled}
            />
          </div>

          {formState.coapPayloadType === "PROTOBUF" && (
            <div className="rounded-lg border border-muted p-4">
              <h3 className="text-sm font-medium">CoAP Protobuf schemas</h3>

              <div className="mt-4 space-y-3">
                <div className="rounded-lg border border-muted">
                  <div className="flex items-center justify-between bg-muted/30 px-3 py-2">
                    <button
                      type="button"
                      onClick={() => onToggleCoapProtoSection("telemetry")}
                      className="flex items-center gap-2 text-left"
                      disabled={isSaving}
                    >
                      {expandedCoapProtoSections.has("telemetry") ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium">
                        Telemetry proto schema
                      </span>
                    </button>
                  </div>
                  {expandedCoapProtoSections.has("telemetry") && (
                    <div className="border-t border-muted p-3">
                      <Editor
                        height="260px"
                        defaultLanguage="protobuf"
                        language="protobuf"
                        value={formState.coapTelemetryProtoSchema}
                        onChange={(value) =>
                          onUpdateField("coapTelemetryProtoSchema", value ?? "")
                        }
                        theme={editorTheme}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 13,
                          lineNumbers: "on",
                          glyphMargin: false,
                          folding: true,
                          scrollBeyondLastLine: false,
                          wordWrap: "off",
                          automaticLayout: true,
                          tabSize: 2,
                          insertSpaces: true,
                          formatOnPaste: true,
                          formatOnType: true,
                          readOnly: isDisabled,
                          padding: { top: 12, bottom: 12 },
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-muted">
                  <div className="flex items-center justify-between bg-muted/30 px-3 py-2">
                    <button
                      type="button"
                      onClick={() => onToggleCoapProtoSection("attributes")}
                      className="flex items-center gap-2 text-left"
                      disabled={isSaving}
                    >
                      {expandedCoapProtoSections.has("attributes") ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium">
                        Attributes proto schema
                      </span>
                    </button>
                  </div>
                  {expandedCoapProtoSections.has("attributes") && (
                    <div className="border-t border-muted p-3">
                      <Editor
                        height="220px"
                        defaultLanguage="protobuf"
                        language="protobuf"
                        value={formState.coapAttributesProtoSchema}
                        onChange={(value) =>
                          onUpdateField(
                            "coapAttributesProtoSchema",
                            value ?? "",
                          )
                        }
                        theme={editorTheme}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 13,
                          lineNumbers: "on",
                          glyphMargin: false,
                          folding: true,
                          scrollBeyondLastLine: false,
                          wordWrap: "off",
                          automaticLayout: true,
                          tabSize: 2,
                          insertSpaces: true,
                          formatOnPaste: true,
                          formatOnType: true,
                          readOnly: isDisabled,
                          padding: { top: 12, bottom: 12 },
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-muted">
                  <div className="flex items-center justify-between bg-muted/30 px-3 py-2">
                    <button
                      type="button"
                      onClick={() => onToggleCoapProtoSection("rpcRequest")}
                      className="flex items-center gap-2 text-left"
                      disabled={isSaving}
                    >
                      {expandedCoapProtoSections.has("rpcRequest") ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium">
                        RPC request proto schema
                      </span>
                    </button>
                  </div>
                  {expandedCoapProtoSections.has("rpcRequest") && (
                    <div className="border-t border-muted p-3">
                      <Editor
                        height="220px"
                        defaultLanguage="protobuf"
                        language="protobuf"
                        value={formState.coapRpcRequestProtoSchema}
                        onChange={(value) =>
                          onUpdateField(
                            "coapRpcRequestProtoSchema",
                            value ?? "",
                          )
                        }
                        theme={editorTheme}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 13,
                          lineNumbers: "on",
                          glyphMargin: false,
                          folding: true,
                          scrollBeyondLastLine: false,
                          wordWrap: "off",
                          automaticLayout: true,
                          tabSize: 2,
                          insertSpaces: true,
                          formatOnPaste: true,
                          formatOnType: true,
                          readOnly: isDisabled,
                          padding: { top: 12, bottom: 12 },
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-muted">
                  <div className="flex items-center justify-between bg-muted/30 px-3 py-2">
                    <button
                      type="button"
                      onClick={() => onToggleCoapProtoSection("rpcResponse")}
                      className="flex items-center gap-2 text-left"
                      disabled={isSaving}
                    >
                      {expandedCoapProtoSections.has("rpcResponse") ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium">
                        RPC response proto schema
                      </span>
                    </button>
                  </div>
                  {expandedCoapProtoSections.has("rpcResponse") && (
                    <div className="border-t border-muted p-3">
                      <Editor
                        height="200px"
                        defaultLanguage="protobuf"
                        language="protobuf"
                        value={formState.coapRpcResponseProtoSchema}
                        onChange={(value) =>
                          onUpdateField(
                            "coapRpcResponseProtoSchema",
                            value ?? "",
                          )
                        }
                        theme={editorTheme}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 13,
                          lineNumbers: "on",
                          glyphMargin: false,
                          folding: true,
                          scrollBeyondLastLine: false,
                          wordWrap: "off",
                          automaticLayout: true,
                          tabSize: 2,
                          insertSpaces: true,
                          formatOnPaste: true,
                          formatOnType: true,
                          readOnly: isDisabled,
                          padding: { top: 12, bottom: 12 },
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="rounded-lg border border-muted p-4">
        <label className="mb-1 block text-sm font-medium">
          Power Saving Mode
        </label>
        <Select
          options={powerModeOptions}
          value={formState.coapPowerMode}
          onValueChange={(value) =>
            onUpdateField("coapPowerMode", (value as PowerMode) ?? "DRX")
          }
          disabled={isDisabled}
        />

        {formState.coapPowerMode === "PSM" && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">PSM Activity Timer*</label>
              <Input
                type="number"
                min={0}
                value={formState.coapPsmActivityTimer}
                onChange={(event) =>
                  onUpdateField("coapPsmActivityTimer", event.target.value)
                }
                disabled={isDisabled}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Time unit</label>
              <Select
                options={timeUnitOptions}
                value={formState.coapPsmActivityTimerTimeUnit}
                onValueChange={(value) =>
                  onUpdateField(
                    "coapPsmActivityTimerTimeUnit",
                    (value as TimeUnit) ?? "SECONDS",
                  )
                }
                disabled={isDisabled}
              />
            </div>
          </div>
        )}

        {formState.coapPowerMode === "EDRX" && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">eDRX cycle*</label>
              <Input
                type="number"
                min={0}
                value={formState.coapEdrxCycle}
                onChange={(event) =>
                  onUpdateField("coapEdrxCycle", event.target.value)
                }
                disabled={isDisabled}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Time unit</label>
              <Select
                options={timeUnitOptions}
                value={formState.coapEdrxCycleTimeUnit}
                onValueChange={(value) =>
                  onUpdateField(
                    "coapEdrxCycleTimeUnit",
                    (value as TimeUnit) ?? "SECONDS",
                  )
                }
                disabled={isDisabled}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Paging Transmission Window*
              </label>
              <Input
                type="number"
                min={0}
                value={formState.coapPagingTransmissionWindow}
                onChange={(event) =>
                  onUpdateField(
                    "coapPagingTransmissionWindow",
                    event.target.value,
                  )
                }
                disabled={isDisabled}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Time unit</label>
              <Select
                options={timeUnitOptions}
                value={formState.coapPagingTransmissionWindowTimeUnit}
                onValueChange={(value) =>
                  onUpdateField(
                    "coapPagingTransmissionWindowTimeUnit",
                    (value as TimeUnit) ?? "SECONDS",
                  )
                }
                disabled={isDisabled}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
