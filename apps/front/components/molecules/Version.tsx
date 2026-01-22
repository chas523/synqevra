import React from "react";
import { Check } from "lucide-react";
import { Button } from "../ui/button";

interface VersionProps {
  currentVersion?: string;
  availableVersion?: string;
}

export function Version({
  currentVersion = "4.2.0",
  availableVersion = "4.2.1.1",
}: VersionProps) {
  const isUpToDate = currentVersion === availableVersion;

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
            <div className="text-xs font-bold">{currentVersion}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-[9px] mb-0.5">
              Available
            </div>
            <div className="text-xs font-bold">{availableVersion}</div>
          </div>
        </div>
        {!isUpToDate && (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-[9px] h-6 px-2"
          >
            Contact us
          </Button>
        )}
      </div>
    </>
  );
}
