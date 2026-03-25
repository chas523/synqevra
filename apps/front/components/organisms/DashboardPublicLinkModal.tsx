"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, X } from "lucide-react";
import { toast } from "sonner";

interface DashboardPublicLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardName: string;
  publicId?: string;
  dashboardId?: string;
}

export function DashboardPublicLinkModal({
  isOpen,
  onClose,
  dashboardName,
  publicId,
  dashboardId,
}: DashboardPublicLinkModalProps) {
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const port = isLocalhost ? '8088' : (typeof window !== 'undefined' ? window.location.port : '');
  const baseUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}${port ? ':' + port : ''}` : 'http://localhost:8088';

  const publicLink = `${baseUrl}/dashboard/${dashboardId}?publicId=${publicId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicLink);
    toast.success("Link copied to clipboard");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-auto w-auto p-0 dark:bg-[#202E3C] border-slate-700 overflow-x-auto outline-none">
        <DialogHeader className="bg-[#2A456C] h-12 flex flex-row items-center justify-between px-4 py-2 relative">
          <DialogTitle className="text-base text-white font-medium">
            Dashboard is now public
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>

        <div className="p-6 space-y-4 dark:text-gray-200">
          <p className="text-sm">
            Your dashboard <span className="font-bold">{dashboardName}</span> is now
            public and accessible via next public{" "}
            <a href={publicLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              link
            </a>
            :
          </p>

          <div className="flex items-center">
            <div className="flex-1 bg-[#1A2634] border border-[#2A3F54] rounded-sm flex items-center h-10 overflow-hidden">
              <div className="px-3 flex-1 overflow-x-auto whitespace-nowrap scrollbar-hide">
                <code className="text-[13px] font-mono select-all text-gray-300">
                  {publicLink}
                </code>
              </div>
            </div>
            <Button
              variant="secondary"
              size="icon"
              className="ml-2 h-10 w-10 shrink-0 bg-[#444444] hover:bg-[#555555] text-white border-none rounded"
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="bg-[#F5F5F5] dark:bg-transparent dark:border dark:border-gray-600 rounded p-4 text-sm dark:text-gray-300">
            <span className="font-bold dark:text-gray-200">Note: </span>
            Do not forget to make related devices public in order to access their data.
          </div>
        </div>

        <DialogFooter className="p-4 border-t border-slate-700/50 flex justify-end">
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-[#2A6B97] hover:text-[#184F75] hover:bg-transparent font-medium dark:text-blue-400 dark:hover:text-blue-300"
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
