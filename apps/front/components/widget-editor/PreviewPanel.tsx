import React from "react";
import { useWidgetEditor } from "@/context/WidgetEditorContext";
import { getImagePreviewUrl } from "@/lib/utils";
import { ImageOff } from "lucide-react";
export function PreviewPanel() {
  const { widgetType } = useWidgetEditor();

  if (!widgetType) return null;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border bg-muted p-3">
        <h2 className="text-sm font-semibold text-foreground/70">
          Widget Preview
        </h2>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center bg-muted/50 p-6">
        <div className="flex h-auto min-h-75 w-full max-w-md flex-col overflow-hidden rounded-lg border border-border bg-background shadow-sm">
          <div className="group relative flex aspect-4/3 w-full items-center justify-center overflow-hidden bg-muted">
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

          <div className="border-t border-border/50 p-4">
            <h3 className="truncate text-center font-medium text-foreground">
              {widgetType.name || "Untitled Widget"}
            </h3>
            {widgetType.description && (
              <p className="mt-1 line-clamp-2 text-center text-xs text-muted-foreground">
                {widgetType.description}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 max-w-xs text-center text-xs text-muted-foreground">
          Using static preview image. Full dynamic rendering requires runtime
          emulation.
        </div>
      </div>
    </div>
  );
}
