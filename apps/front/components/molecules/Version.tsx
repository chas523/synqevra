"use client";

import React from "react";
import { Check } from "lucide-react";
import { Button } from "../ui/button";
import { useDashboardVersion } from "@/hooks/thingsboard/dashboard/useDashboardVersion";
import { LoadingSpinner } from "../atoms/LoadingSpinner";
import { extractErrorMessage } from "@/lib/utils";
import ErrorMessage from "./ErrorMessage";

export function Version() {
  const { data: version, isLoading, error } = useDashboardVersion();

  if (isLoading) {
    return (
      <div className="flex h-full justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }
  if (error) {
    <ErrorMessage message={extractErrorMessage(error)} />;
  }

  const isUpToDate = version!.currentVersion === version!.latestVersion;

  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <h4 className="text-xs font-medium shrink-0">Version</h4>
        {isUpToDate && <Check className="h-3 w-3 text-green-600" />}
      </div>
      <div className="flex-1 min-h-0 flex flex-col justify-between">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <div className="text-muted-foreground text-[9px] mb-0.5">
              Current
            </div>
            <div className="text-xs font-bold">{version!.currentVersion}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-[9px] mb-0.5">
              Available
            </div>
            <div className="text-xs font-bold">{version!.latestVersion}</div>
          </div>
        </div>
        {!isUpToDate && (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-[9px] h-6 px-2"
            asChild
          >
            <a href="mailto:support@example.com">Contact us</a>
          </Button>
        )}
      </div>
    </>
  );
}
