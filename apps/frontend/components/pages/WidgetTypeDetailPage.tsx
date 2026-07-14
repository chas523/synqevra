"use client";

import React, { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, PanelsTopLeft } from "lucide-react";
import { DashboardService } from "@/lib/services/thingsboardServices/dashboardService";
import { useWidgetType } from "@/hooks/thingsboard/widgets/useWidgetTypes";
import { Button } from "@/components/ui/button";
import { Group, Panel, Separator } from "react-resizable-panels";
import { HtmlPanel } from "@/components/widget-editor/HtmlPanel";
import { JsPanel } from "@/components/widget-editor/JsPanel";
import { SettingsPanel } from "@/components/widget-editor/SettingsPanel";
import { PreviewPanel } from "@/components/widget-editor/PreviewPanel";
import { WidgetHeaderPanel } from "@/components/widget-editor/WidgetHeaderPanel";
import { WidgetEditorProvider } from "@/context/WidgetEditorContext";

interface WidgetTypeDetailPageProps {
  id: string;
}

function WidgetTypeDetailContent({ id }: WidgetTypeDetailPageProps) {
  const router = useRouter();
  const [useIframe, setUseIframe] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const { widgetType, isLoading: isLoadingWidget } = useWidgetType(id);

  // Fetch TB JWT token for iframe bridge
  const { data: tokenData, isLoading: isLoadingToken } = useSWR(
    useIframe ? "embed-token-widget" : null,
    () => DashboardService.getEmbedToken(),
  );

  useEffect(() => {
    if (useIframe && iframeLoaded && tokenData?.jwtToken && iframeRef.current) {
      // The path for widget editor in TB is /resources/widgets-library/widget-types/[id]
      const targetUrl = `/resources/widgets-library/widget-types/${id}`;

      iframeRef.current.contentWindow?.postMessage(
        {
          jwtToken: tokenData.jwtToken,
          redirect: targetUrl,
        },
        "http://localhost:3002",
      );
    }
  }, [useIframe, iframeLoaded, tokenData, id]);

  const isLoading = isLoadingWidget || (useIframe && isLoadingToken);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/40">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">
            Loading widget environment...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-muted/40">
      {/* Top bar */}
      <header className="z-20 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              router.push("/resources/widgets-library/widget-types")
            }
            className="text-muted-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="h-5 w-px bg-border" />
          <div className="flex items-center gap-2">
            <PanelsTopLeft className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              {widgetType?.name || "Widget Type"}
            </span>
            <div className="flex items-center gap-3 ml-4">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Widget Library Proxy
              </span>
              <div className="h-4 w-px bg-border" />
              <label className="flex items-center cursor-pointer gap-2 scale-90 origin-left">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={useIframe}
                    onChange={() => {
                      setUseIframe(!useIframe);
                      setIframeLoaded(false);
                    }}
                  />
                  <div
                    className={`block h-6 w-10 rounded-full transition-colors ${useIframe ? "bg-primary" : "bg-muted-foreground/30"}`}
                  ></div>
                  <div
                    className={`dot absolute left-1 top-1 h-4 w-4 rounded-full bg-background transition-transform ${useIframe ? "translate-x-4" : ""}`}
                  ></div>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {useIframe ? "Native TB" : "Custom Editor"}
                </span>
              </label>
            </div>
          </div>
        </div>
      </header>

      {useIframe ? (
        <main className="relative flex-1 overflow-hidden bg-muted/60">
          <div className="absolute inset-0 overflow-hidden">
            <iframe
              ref={iframeRef}
              src="http://localhost:3002/bridge.html"
              className="absolute top-0 left-0 w-full h-full"
              style={{ border: "none", pointerEvents: "auto" }}
              onLoad={() => setIframeLoaded(true)}
            />
          </div>
          {/* Top visual clip to focus on the editor content - 
              Thingsboard uses breadcrumbs (tb-breadcrumb) which we also want to hide */}
          <style jsx global>{`
            iframe {
              margin-top: -5px;
              height: calc(100% + 5px);
            }
          `}</style>
          <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-1.25 bg-muted/40" />
        </main>
      ) : (
        <div className="flex-1 overflow-hidden">
          <WidgetEditorProvider>
            <div className="flex flex-col h-full w-full">
              <WidgetHeaderPanel />
              <div className="flex-1 overflow-hidden">
                <Group orientation="horizontal">
                  <Panel defaultSize={50} minSize={20}>
                    <Group orientation="vertical">
                      <Panel defaultSize={50} minSize={20}>
                        <HtmlPanel />
                      </Panel>
                      <Separator className="h-2 bg-border transition-colors hover:bg-muted-foreground/40" />
                      <Panel defaultSize={50} minSize={20}>
                        <JsPanel />
                      </Panel>
                    </Group>
                  </Panel>
                  <Separator className="w-2 bg-border transition-colors hover:bg-muted-foreground/40" />
                  <Panel defaultSize={50} minSize={20}>
                    <Group orientation="vertical">
                      <Panel defaultSize={50} minSize={20}>
                        <SettingsPanel />
                      </Panel>
                      <Separator className="h-2 bg-border transition-colors hover:bg-muted-foreground/40" />
                      <Panel defaultSize={50} minSize={20}>
                        <PreviewPanel />
                      </Panel>
                    </Group>
                  </Panel>
                </Group>
              </div>
            </div>
          </WidgetEditorProvider>
        </div>
      )}
    </div>
  );
}

export const WidgetTypeDetailPage = ({ id }: WidgetTypeDetailPageProps) => {
  return <WidgetTypeDetailContent id={id} />;
};
