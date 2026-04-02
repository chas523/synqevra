"use client";

import Editor from "@monaco-editor/react";
import { ChevronDown, ChevronUp } from "lucide-react";

type ProtoSchemaSection =
  | "telemetry"
  | "attributes"
  | "rpcRequest"
  | "rpcResponse";

type TransportProtobufSchemasSectionProps = {
  title: string;
  telemetrySchema: string;
  attributesSchema: string;
  rpcRequestSchema: string;
  rpcResponseSchema: string;
  expandedSections: Set<ProtoSchemaSection>;
  editorTheme: "light" | "vs-dark";
  disabled?: boolean;
  toggleDisabled?: boolean;
  onToggleSection: (section: ProtoSchemaSection) => void;
  onSchemaChange: (
    field:
      | "telemetrySchema"
      | "attributesSchema"
      | "rpcRequestSchema"
      | "rpcResponseSchema",
    value: string,
  ) => void;
};

const SECTIONS: Array<{
  id: ProtoSchemaSection;
  label: string;
  field:
    | "telemetrySchema"
    | "attributesSchema"
    | "rpcRequestSchema"
    | "rpcResponseSchema";
  height: string;
}> = [
  {
    id: "telemetry",
    label: "Telemetry proto schema",
    field: "telemetrySchema",
    height: "260px",
  },
  {
    id: "attributes",
    label: "Attributes proto schema",
    field: "attributesSchema",
    height: "220px",
  },
  {
    id: "rpcRequest",
    label: "RPC request proto schema",
    field: "rpcRequestSchema",
    height: "220px",
  },
  {
    id: "rpcResponse",
    label: "RPC response proto schema",
    field: "rpcResponseSchema",
    height: "200px",
  },
];

export function TransportProtobufSchemasSection({
  title,
  telemetrySchema,
  attributesSchema,
  rpcRequestSchema,
  rpcResponseSchema,
  expandedSections,
  editorTheme,
  disabled = false,
  toggleDisabled = disabled,
  onToggleSection,
  onSchemaChange,
}: TransportProtobufSchemasSectionProps) {
  const schemaValues = {
    telemetrySchema,
    attributesSchema,
    rpcRequestSchema,
    rpcResponseSchema,
  };

  return (
    <div className="rounded-lg border border-muted p-4">
      <h3 className="text-sm font-medium">{title}</h3>

      <div className="mt-4 space-y-3">
        {SECTIONS.map((section) => (
          <div key={section.id} className="rounded-lg border border-muted">
            <div className="flex items-center justify-between bg-muted/30 px-3 py-2">
              <button
                type="button"
                onClick={() => onToggleSection(section.id)}
                className="flex items-center gap-2 text-left"
                disabled={toggleDisabled}
              >
                {expandedSections.has(section.id) ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">{section.label}</span>
              </button>
            </div>

            {expandedSections.has(section.id) && (
              <div className="border-t border-muted p-3">
                <Editor
                  height={section.height}
                  defaultLanguage="protobuf"
                  language="protobuf"
                  value={schemaValues[section.field]}
                  onChange={(value) =>
                    onSchemaChange(section.field, value ?? "")
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
                    readOnly: disabled,
                    padding: { top: 12, bottom: 12 },
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export type { ProtoSchemaSection };
