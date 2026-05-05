"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { DeviceService } from "@/lib/services/thingsboardServices/deviceService";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";

export interface ScriptArgument {
  argumentName: string;
  defaultValue?: string;
}

interface TestScriptModalProps {
  open: boolean;
  onClose: () => void;
  onApply?: (expression: string) => void;
  expression: string;
  arguments: ScriptArgument[];
}

interface ArgumentTestValue {
  name: string;
  value: string;
  ts: number;
}

type ArgumentType = "SINGLE_VALUE";

export function TestScriptModal({
  open,
  onClose,
  onApply,
  expression: initialExpression,
  arguments: scriptArguments,
}: TestScriptModalProps) {
  const { theme } = useTheme();
  const [localExpression, setLocalExpression] = useState(initialExpression);
  const [argumentValues, setArgumentValues] = useState<
    Record<string, ArgumentTestValue>
  >({});
  const [output, setOutput] = useState<string>("");
  const [isTesting, setIsTesting] = useState(false);

  // Initialise values when the modal opens or arguments change
  useEffect(() => {
    if (!open) return;
    setLocalExpression(initialExpression);
    const initial: Record<string, ArgumentTestValue> = {};
    for (const arg of scriptArguments) {
      initial[arg.argumentName] = {
        name: arg.argumentName,
        value: arg.defaultValue ?? "",
        ts: Date.now(),
      };
    }
    setArgumentValues(initial);
    setOutput("");
  }, [open, initialExpression, scriptArguments]);

  const handleTest = async () => {
    setIsTesting(true);
    setOutput("");
    try {
      const argumentsPayload: Record<
        string,
        { ts: number; value: unknown; type: ArgumentType }
      > = {};

      for (const [key, val] of Object.entries(argumentValues)) {
        let parsedValue: unknown = val.value;
        const asNumber = Number(val.value);
        if (val.value.trim() !== "" && !Number.isNaN(asNumber)) {
          parsedValue = asNumber;
        }
        argumentsPayload[key] = {
          ts: val.ts,
          value: parsedValue,
          type: "SINGLE_VALUE",
        };
      }

      const result = await DeviceService.testCalculatedFieldScript({
        expression: localExpression,
        arguments: argumentsPayload,
      });

      if (result.error) {
        toast.error(result.error, { duration: 6000 });
        setOutput("");
      } else {
        setOutput(result.output ?? "");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to test script");
    } finally {
      setIsTesting(false);
    }
  };

  const handleApply = () => {
    if (onApply) {
      onApply(localExpression);
      toast.success("Script changes applied to the form");
    }
    onClose();
  };

  const editorTheme = theme === "dark" ? "vs-dark" : "light";

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      {/* 
        Custom styling for DialogContent to make it truly full screen and bypass default Shadcn styling.
        z-[100] ensures it's above the previous modal.
      */}
      <DialogContent
        className="fixed inset-0 z-[100] flex !max-w-none flex-col !h-screen !w-screen p-0 m-0 border-none rounded-none bg-background gap-0 !translate-x-0 !translate-y-0 !top-0 !left-0 !duration-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Test Script Function</DialogTitle>

        {/* Top bar */}
        <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
          <h2 className="text-lg font-semibold">Test Script Function</h2>
          <DialogPrimitive.Close asChild>
            <Button variant="ghost" size="icon" aria-label="Close">
              <X className="h-5 w-5" />
            </Button>
          </DialogPrimitive.Close>
        </div>

        {/* Content */}
        <div
          className="flex flex-col lg:flex-row gap-6 p-6 min-h-0 overflow-y-auto lg:overflow-hidden"
          style={{ flex: "1 1 0" }}
        >
          {/* Left column – Script source */}
          <div className="flex flex-col gap-3 min-w-0 shrink-0 lg:shrink lg:flex-1">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Script
              </span>
            </div>

            <div
              className="rounded-lg border bg-card overflow-hidden flex flex-col min-h-[300px] lg:min-h-0"
              style={{ flex: "1 1 0" }}
            >
              <div className="bg-muted/50 px-4 py-2 border-b font-mono text-sm text-muted-foreground select-none">
                function calculate(ctx, adf) {"{"}
              </div>
              <div
                style={{ flex: "1 1 0", minHeight: "200px", height: "auto" }}
                className="lg:h-[calc(100%-72px)]"
              >
                <Editor
                  height="100%"
                  language="javascript"
                  theme={editorTheme}
                  value={localExpression}
                  onChange={(val) => setLocalExpression(val || "")}
                  options={{
                    readOnly: false,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    lineNumbers: "on",
                    renderLineHighlight: "none",
                    scrollbar: { vertical: "auto", horizontal: "auto" },
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

          {/* Middle column – Arguments */}
          <div className="flex flex-col gap-3 shrink-0 w-full lg:w-72">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Arguments
              </span>
            </div>
            <div
              className="rounded-lg border bg-slate-50 p-4 space-y-4 overflow-y-auto min-h-[200px] lg:min-h-0"
              style={{ flex: "1 1 0" }}
            >
              {scriptArguments.length === 0 ? (
                <p className="text-sm text-slate-400 text-center mt-8">
                  No arguments defined.
                </p>
              ) : (
                scriptArguments.map((arg) => (
                  <div key={arg.argumentName} className="space-y-1.5">
                    <Label
                      htmlFor={`test-arg-${arg.argumentName}`}
                      className="font-mono text-sm"
                    >
                      {arg.argumentName}
                    </Label>
                    <Input
                      id={`test-arg-${arg.argumentName}`}
                      value={argumentValues[arg.argumentName]?.value ?? ""}
                      onChange={(e) =>
                        setArgumentValues((prev) => ({
                          ...prev,
                          [arg.argumentName]: {
                            ...(prev[arg.argumentName] ?? {
                              name: arg.argumentName,
                              ts: Date.now(),
                            }),
                            value: e.target.value,
                          },
                        }))
                      }
                      placeholder="Enter value..."
                      disabled={isTesting}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right column – Output */}
          <div className="flex flex-col gap-3 shrink-0 w-full lg:w-72">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Output
              </span>
            </div>
            <div
              className="rounded-lg border bg-slate-50 p-4 overflow-y-auto min-h-[150px] lg:min-h-0"
              style={{ flex: "1 1 0" }}
            >
              {output ? (
                <pre className="text-sm font-mono text-slate-800 whitespace-pre-wrap break-all">
                  {(() => {
                    try {
                      return JSON.stringify(JSON.parse(output), null, 2);
                    } catch {
                      return output;
                    }
                  })()}
                </pre>
              ) : (
                <p className="text-sm text-slate-400 text-center mt-8">
                  Click &quot;Test&quot; to see the output.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t px-6 py-4 shrink-0">
          <DialogPrimitive.Close asChild>
            <Button variant="outline" disabled={isTesting}>
              Cancel
            </Button>
          </DialogPrimitive.Close>

          <Button
            variant="outline"
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
            onClick={handleApply}
            disabled={isTesting}
          >
            Apply changes
          </Button>

          <Button
            onClick={handleTest}
            disabled={isTesting || scriptArguments.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-24"
          >
            {isTesting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing…
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Test
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
