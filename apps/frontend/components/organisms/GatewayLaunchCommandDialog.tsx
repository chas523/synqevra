"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download, Copy, Check, Loader2 } from "lucide-react";
import { GatewayService } from "@/lib/services/thingsboardServices/gatewayService";
import type { GatewayListItem } from "@/types/thingsboardGatewayTypes";

interface GatewayLaunchCommandDialogProps {
  gateway: GatewayListItem | null;
  onClose: () => void;
}

const COMMAND = "docker compose up";

export function GatewayLaunchCommandDialog({
  gateway,
  onClose,
}: GatewayLaunchCommandDialogProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(COMMAND);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!gateway?.id?.id) return;
    setDownloading(true);
    try {
      await GatewayService.downloadDockerCompose(gateway.id.id);
    } catch {
      toast.error("Failed to download docker-compose.yml");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={gateway !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Launch IoT Gateway
            {gateway ? ` - ${gateway.name}` : ""}
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Use the following instructions to run IoT Gateway in Docker Compose
          with credentials for the selected device.
        </p>

        <ol className="space-y-6 mt-2">
          {/* Step 1 */}
          <li className="space-y-2">
            <h3 className="font-semibold text-sm">
              1. Install necessary client tools
            </h3>
            <p className="text-sm text-muted-foreground">
              Use the instructions to download, install and set up Docker
              Compose.
            </p>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://docs.docker.com/compose/install/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Docker Compose install guide
              </a>
            </Button>
          </li>

          {/* Step 2 */}
          <li className="space-y-2">
            <h3 className="font-semibold text-sm">
              2. Download configuration file
            </h3>
            <p className="text-sm text-muted-foreground">
              Download{" "}
              <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
                docker-compose.yml
              </code>{" "}
              for your gateway.
            </p>
            <Button
              variant="outline"
              size="sm"
              disabled={downloading || !gateway?.id?.id}
              onClick={handleDownload}
            >
              {downloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download docker-compose.yml
            </Button>
          </li>

          {/* Step 3 */}
          <li className="space-y-2">
            <h3 className="font-semibold text-sm">3. Launch gateway</h3>
            <p className="text-sm text-muted-foreground">
              Start the gateway using the following command in the terminal from
              the folder containing the{" "}
              <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
                docker-compose.yml
              </code>{" "}
              file.
            </p>
            <div className="flex items-center gap-2 rounded-md border bg-muted px-4 py-2">
              <code className="flex-1 font-mono text-sm">{COMMAND}</code>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={handleCopy}
                aria-label="Copy command"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </li>
        </ol>
      </DialogContent>
    </Dialog>
  );
}
