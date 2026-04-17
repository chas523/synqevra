"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { VersionControlService } from "@/lib/services/thingsboardServices/versionControlService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DiffEditor } from "@monaco-editor/react";

interface CompareVersionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: string;
  entityId: string;
  versionId: string | null;
  versionName: string;
  onRestoreClick?: () => void;
}

export function CompareVersionModal({
  open,
  onOpenChange,
  entityType,
  entityId,
  versionId,
  versionName,
  onRestoreClick,
}: CompareVersionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<any>(null);
  const [otherVersion, setOtherVersion] = useState<any>(null);

  useEffect(() => {
    if (open && versionId) {
      const fetchDiff = async () => {
        setIsLoading(true);
        try {
          const res = await VersionControlService.fetchVersionDiff(
            entityType,
            entityId,
            versionId
          );
          if (res) {
            setCurrentVersion(res.currentVersion);
            setOtherVersion(res.otherVersion);
          }
        } catch (error) {
          toast.error("Failed to load version difference.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchDiff();
    } else {
      setCurrentVersion(null);
      setOtherVersion(null);
    }
  }, [open, versionId, entityType, entityId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[80vw] w-full max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0 flex flex-row items-center justify-between">
          <DialogTitle>Diff with entity version '{versionName}'</DialogTitle>
          {onRestoreClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onRestoreClick();
              }}
              className="mr-6 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700 font-medium"
            >
              Restore version
            </Button>
          )}
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden relative bg-muted/30">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-muted-foreground bg-background/50">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
              <p>Loading diff...</p>
            </div>
          ) : currentVersion && otherVersion ? (
            <div className="w-full h-[60vh] flex flex-col">
               <div className="grid grid-cols-2 px-8 py-2 text-sm font-medium text-foreground bg-muted/10 border-b">
                 <div>Current</div>
                 <div>{versionName}</div>
               </div>
               <div className="flex-1 relative">
                 <DiffEditor
                    language="json"
                    original={JSON.stringify(currentVersion, null, 2)}
                    modified={JSON.stringify(otherVersion, null, 2)}
                    options={{
                      readOnly: true,
                      renderSideBySide: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      wordWrap: "on",
                      automaticLayout: true,
                    }}
                    theme="vs-light"
                  />
               </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground p-8 text-center">
              No difference data available.
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
