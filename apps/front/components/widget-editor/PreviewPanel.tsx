import React from "react";
import { useWidgetEditor } from "@/context/WidgetEditorContext";
import { getImagePreviewUrl } from "@/lib/utils";
import { ImageOff } from "lucide-react";
export function PreviewPanel() {
  const { widgetType } = useWidgetEditor();

  if (!widgetType) return null;

  return (
    <div className="w-full h-full flex flex-col border border-border dark:border-gray-800 bg-background dark:bg-slate-950 overflow-hidden">
      <div className="p-3 border-b border-border dark:border-gray-800 bg-muted dark:bg-slate-900 flex justify-between items-center">
        <h2 className="text-sm font-semibold text-foreground/70 dark:text-gray-300">
          Widget Preview
        </h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-muted/50 dark:bg-slate-900/50">
        <div className="w-full max-w-md bg-background dark:bg-slate-800 rounded-lg shadow-sm border border-border dark:border-gray-700 overflow-hidden flex flex-col h-auto min-h-75">
          <div className="aspect-4/3 w-full bg-muted dark:bg-slate-900 flex items-center justify-center relative overflow-hidden group">
            {widgetType.image ? (
              <img
                src={getImagePreviewUrl(widgetType.image)}
                alt={widgetType.name || "Widget Preview"}
                className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement
                    ?.querySelector(".fallback-icon")
                    ?.classList.remove("hidden");
                }}
              />
            ) : (
              <ImageOff className="text-muted-foreground h-16 w-16" />
            )}
            <div className="fallback-icon hidden absolute inset-0 items-center justify-center">
              <ImageOff className="text-muted-foreground h-16 w-16" />
            </div>
          </div>

          <div className="p-4 border-t border-border/50 dark:border-gray-700">
            <h3 className="font-medium text-foreground dark:text-gray-100 truncate text-center">
              {widgetType.name || "Untitled Widget"}
            </h3>
            {widgetType.description && (
              <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1 text-center line-clamp-2">
                {widgetType.description}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 text-xs text-gray-400 text-center max-w-xs">
          Using static preview image. Full dynamic rendering requires runtime
          emulation.
        </div>
      </div>
    </div>
  );
}
