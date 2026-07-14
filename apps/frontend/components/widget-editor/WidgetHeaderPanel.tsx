"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWidgetEditor } from "@/context/WidgetEditorContext";
import { Save, Undo, RotateCcw, Copy } from "lucide-react";
import { WidgetService } from "@/lib/services/thingsboardServices/widgetService";
import { toast } from "sonner";
import { SaveWidgetAsDialog } from "./SaveWidgetAsDialog";

export const WidgetHeaderPanel: React.FC = () => {
  const {
    widgetType,
    updateWidgetType,
    undo,
    redo,
    canUndo,
    canRedo,
    isDirty,
  } = useWidgetEditor();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaveAsOpen, setIsSaveAsOpen] = useState(false);

  if (!widgetType) return null;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateWidgetType({ ...widgetType, name: e.target.value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await WidgetService.saveWidgetType(widgetType); // Assuming this method exists and takes the whole object
      toast.success("Widget saved successfully.");
    } catch (error) {
      console.error("Failed to save widget", error);
      toast.error("Failed to save widget.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-2 border-b bg-background">
      <div className="flex items-center space-x-2">
        <Input
          value={widgetType.name}
          onChange={handleTitleChange}
          className="font-semibold text-lg border-none focus-visible:ring-1 max-w-md"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={undo}
          disabled={!canUndo}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={redo}
          disabled={!canRedo}
          title="Redo"
        >
          <RotateCcw className="h-4 w-4 transform scale-x-[-1]" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSaveAsOpen(true)}
          title="Save As"
        >
          <Copy className="h-4 w-4 mr-2" />
          Save As
        </Button>
        <Button onClick={handleSave} disabled={isSaving || !isDirty} size="sm">
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
      <SaveWidgetAsDialog
        open={isSaveAsOpen}
        onOpenChange={setIsSaveAsOpen}
        currentWidgetType={widgetType}
      />
    </div>
  );
};
