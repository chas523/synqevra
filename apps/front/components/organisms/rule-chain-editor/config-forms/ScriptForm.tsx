"use client";

import { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ScriptConfig, ScriptLang } from "@/types/ruleNodeConfig";
import Editor, { OnMount } from "@monaco-editor/react";

interface ScriptFormProps {
  name: string;
  description: string;
  config: ScriptConfig;
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onConfigChange: (c: ScriptConfig) => void;
}

export function ScriptForm({
  name,
  description,
  config,
  onNameChange,
  onDescriptionChange,
  onConfigChange,
}: ScriptFormProps) {
  const editorRef = useRef<any>(null);
  const isJS = config.scriptLang === "JS";
  const currentScript = isJS ? config.jsScript : config.tbelScript;

  const handleEditorChange = (value: string | undefined) => {
    if (isJS) {
      onConfigChange({ ...config, jsScript: value ?? "" });
    } else {
      onConfigChange({ ...config, tbelScript: value ?? "" });
    }
  };

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const tidyCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.action.formatDocument").run();
    }
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

      {/* Script language toggle */}
      <div className="flex justify-center">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-full w-fit">
          <button
            type="button"
            onClick={() => onConfigChange({ ...config, scriptLang: "TBEL" })}
            className={`px-8 py-2 rounded-full text-sm font-semibold transition-all ${
              config.scriptLang === "TBEL"
                ? "bg-[#305680] text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            TBEL
          </button>
          <button
            type="button"
            onClick={() => onConfigChange({ ...config, scriptLang: "JS" })}
            className={`px-8 py-2 rounded-full text-sm font-semibold transition-all ${
              config.scriptLang === "JS"
                ? "bg-[#305680] text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            JavaScript
          </button>
        </div>
      </div>

      {/* Script editor container */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
            function Transform(msg, metadata, msgType) &#123;
          </p>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={tidyCode}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Tidy
            </button>
          </div>
        </div>

        {/* 
          WRAPPER TO STOP EVENT PROPAGATION 
          This is often needed when Monaco is used inside ReactFlow/Canvas 
          to prevent space/delete keys from triggering canvas actions.
        */}
        <div
          className="border border-slate-200 dark:border-slate-700 rounded overflow-hidden"
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Editor
            height="260px"
            language="javascript"
            value={currentScript}
            theme="vs-light"
            onMount={handleEditorMount}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 12,
              scrollBeyondLastLine: false,
              lineNumbers: "on",
              wordWrap: "on",
              folding: false,
              lineDecorationsWidth: 10,
              lineNumbersMinChars: 3,
              automaticLayout: true,
            }}
          />
        </div>

        <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
          &#125;
        </p>
      </div>

      {/* Description */}
      <div className="space-y-1.5 pt-2 border-t dark:border-slate-800">
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
