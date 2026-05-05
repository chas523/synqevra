"use client";

import Editor from "@monaco-editor/react";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";

interface ScriptEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  functionName?: string;
  arguments?: string;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: string;
}

export function ScriptEditor({
  value,
  onChange,
  label = "Script*",
  functionName = "calculate",
  arguments: args = "ctx, adf",
  disabled = false,
  minHeight = "200px",
}: ScriptEditorProps) {
  const { theme } = useTheme();

  return (
    <div className="space-y-1.5 w-full">
      {label && <Label className="text-sm font-medium">{label}</Label>}
      <div className="rounded-md border bg-card overflow-hidden transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="bg-muted/50 px-4 py-2 border-b font-mono text-sm text-muted-foreground select-none">
          function {functionName}({args}) {"{"}
        </div>
        <div
          style={{ height: minHeight }}
          className={disabled ? "opacity-50 pointer-events-none" : ""}
        >
          <Editor
            height="100%"
            language="javascript"
            theme={theme === "dark" ? "vs-dark" : "light"}
            value={value}
            onChange={(val) => onChange(val || "")}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              lineNumbers: "on",
              readOnly: disabled,
              renderLineHighlight: "none",
              scrollbar: {
                vertical: "auto",
                horizontal: "auto",
              },
              padding: { top: 8, bottom: 8 },
              automaticLayout: true,
            }}
          />
        </div>
        <div className="bg-muted/50 px-4 py-2 border-t font-mono text-sm text-muted-foreground select-none">
          {"}"}
        </div>
      </div>
    </div>
  );
}
