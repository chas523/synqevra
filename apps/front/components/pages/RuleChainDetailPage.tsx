"use client";

import React, { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { RuleChainEditor } from "@/components/organisms/rule-chain-editor/RuleChainEditor";
import { DashboardService } from "@/lib/services/thingsboardServices/dashboardService";
import { Loader2 } from "lucide-react";

interface RuleChainDetailPageProps {
  ruleChainId: string;
  ruleChainName?: string;
}

export default function RuleChainDetailPage({
  ruleChainId,
  ruleChainName = "Rule Chain Editor",
}: RuleChainDetailPageProps) {
  // Toggle for developer purposes. Default true = iframe version
  const [useIframe, setUseIframe] = useState(true);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Fetch TB JWT token for iframe bridge automatically
  const { data: tokenData, isLoading: isLoadingToken } = useSWR(
    useIframe ? "embed-token-rulechain" : null,
    () => DashboardService.getEmbedToken()
  );

  useEffect(() => {
    if (useIframe && iframeLoaded && tokenData?.jwtToken && iframeRef.current) {
      const targetUrl = `/ruleChains/${ruleChainId}`;
      iframeRef.current.contentWindow?.postMessage(
        {
          jwtToken: tokenData.jwtToken,
          redirect: targetUrl
        },
        "http://localhost:3002"
      );
    }
  }, [useIframe, iframeLoaded, tokenData, ruleChainId]);

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Developer Toggle Overlay */}
      <div className="absolute top-4 right-4 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg rounded-2xl px-4 py-2 flex items-center gap-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Widget Library Proxy</span>
        <label className="flex items-center cursor-pointer gap-2">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={useIframe}
              onChange={() => {
                const nextState = !useIframe;
                setUseIframe(nextState);
                if (!nextState) {
                  setIframeLoaded(false);
                }
              }}
            />
            <div className={`block w-10 h-6 rounded-full transition-colors ${useIframe ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${useIframe ? 'translate-x-4' : ''}`}></div>
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {useIframe ? "Native TB (Proxy 3002)" : "Custom NextJS Editor"}
          </span>
        </label>
      </div>

      {useIframe ? (
        <div className="flex-1 w-full h-full relative bg-slate-100 dark:bg-slate-950 overflow-hidden">
          {isLoadingToken ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                <span className="text-sm text-slate-500">Connecting to ThingsBoard bridge...</span>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 overflow-hidden">
              <iframe
                ref={iframeRef}
                src="http://localhost:3002/bridge.html"
                className="absolute top-0 left-0 w-full h-full"
                style={{ border: 'none', pointerEvents: 'auto' }}
                onLoad={() => setIframeLoaded(true)}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 w-full h-full">
          <RuleChainEditor ruleChainId={ruleChainId} ruleChainName={ruleChainName} />
        </div>
      )}
    </div>
  );
}
