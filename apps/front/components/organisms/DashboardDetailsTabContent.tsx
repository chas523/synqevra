"use client";

import { useState } from "react";
import { Dashboard } from "@/types/dashboardTypes";
import { Copy, Image as ImageIcon, Link as LinkIcon, Trash2, HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn, getImagePreviewUrl } from "@/lib/utils";
import { ImageGalleryDialog } from "@/components/widget-editor/ImageGalleryDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface DashboardDetailsTabContentProps {
  dashboard: Dashboard | null;
  isEdit?: boolean;
  onChange?: (dashboard: Dashboard) => void;
  isLoading?: boolean;
}

export function DashboardDetailsTabContent({
  dashboard,
  isEdit = false,
  onChange,
  isLoading = false,
}: DashboardDetailsTabContentProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [tempLink, setTempLink] = useState("");

  if (isLoading || !dashboard) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(dashboard.id.id);
    toast.success("Dashboard ID copied to clipboard");
  };

  const isPublic = dashboard.assignedCustomers?.some((c: any) => c.public);
  const publicCustomer = dashboard.assignedCustomers?.find((c: any) => c.public);
  const publicId = publicCustomer?.customerId?.id;

  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const port = isLocalhost ? '8088' : (typeof window !== 'undefined' ? window.location.port : '');
  const baseUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}${port ? ':' + port : ''}` : 'http://localhost:8088';
  
  const publicLink = publicId ? `${baseUrl}/dashboard/${dashboard.id.id}?publicId=${publicId}` : '';

  const updateField = (field: string, value: any) => {
     if (onChange) {
        if (field === 'description') {
            onChange({
                ...dashboard,
                configuration: {
                    ...dashboard.configuration,
                    description: value
                }
            });
        } else {
            onChange({ ...dashboard, [field]: value });
        }
     }
  };

  const handleSelectGalleryImage = (imageLink: string) => {
    const formattedImage = imageLink.startsWith("tb-image;") ? imageLink : `tb-image;${imageLink}`;
    updateField('image', formattedImage);
    setIsGalleryOpen(false);
  };

  const handleSetLink = () => {
    if (tempLink) {
        const formattedImage = tempLink.startsWith("tb-image;") ? tempLink : `tb-image;${tempLink}`;
        updateField('image', formattedImage);
        setTempLink("");
        setIsLinkDialogOpen(false);
    }
  };

  const readOnlyInputClass = "bg-slate-50/50 border-slate-200 dark:bg-slate-900/10 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium";

  return (
    <div className="space-y-6">
      {!isEdit && (
        <div className="flex items-center gap-2">
           <Button
              variant="outline"
              size="sm"
              onClick={handleCopyId}
              className="h-9 px-3 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-gray-200 gap-2 shadow-xs"
            >
              <Copy className="h-4 w-4" />
              Copy dashboard id
            </Button>
        </div>
      )}

      <div className="space-y-4">
        {!isEdit && isPublic && publicLink && (
           <div className="space-y-2">
            <Label className="text-gray-500 dark:text-gray-400 font-normal">Public link</Label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={publicLink}
                className={cn("h-10 pointer-events-none transition-all duration-200", readOnlyInputClass)}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0 bg-[#2A3F54] hover:bg-[#1A2F44] text-white rounded cursor-pointer transition-colors"
                onClick={() => {
                  navigator.clipboard.writeText(publicLink);
                  toast.success("Link copied to clipboard");
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-gray-500 dark:text-gray-400 font-normal">Title*</Label>
          <Input
            value={dashboard.title || ""}
            onChange={(e) => updateField('title', e.target.value)}
            disabled={!isEdit}
            className={cn(
               "h-10 font-normal transition-all duration-200",
               !isEdit ? readOnlyInputClass : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-slate-900 dark:text-white"
            )}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-gray-500 dark:text-gray-400 font-normal">Description</Label>
          <Textarea
            value={dashboard.configuration?.description || ""}
            onChange={(e) => updateField('description', e.target.value)}
            disabled={!isEdit}
            className={cn(
               "min-h-[100px] font-normal resize-none transition-all duration-200",
               !isEdit ? readOnlyInputClass : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-slate-900 dark:text-white"
            )}
          />
        </div>

        <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6 space-y-6 bg-white dark:bg-transparent shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Mobile application settings</h3>
          
          <div className="flex items-center gap-3">
            <Switch
              id="mobileHide"
              checked={dashboard.mobileHide || false}
              onCheckedChange={(checked) => updateField('mobileHide', checked)}
              disabled={!isEdit}
              className="data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-500"
            />
            <label
              htmlFor="mobileHide"
              className={cn(
                  "text-sm font-normal transition-colors duration-200",
                  !isEdit ? "text-slate-500 dark:text-slate-400" : "text-gray-700 dark:text-gray-300"
              )}
            >
              Hide dashboard in mobile application
            </label>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-500 dark:text-gray-400 font-normal">Dashboard order in mobile application</Label>
            <Input
              type="number"
              value={dashboard.mobileOrder ?? ""}
              onChange={(e) => updateField('mobileOrder', e.target.value ? Number(e.target.value) : null)}
              disabled={!isEdit}
              className={cn(
                  "h-10 font-normal transition-all duration-200",
                  !isEdit ? readOnlyInputClass : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-slate-900 dark:text-white"
              )}
              placeholder="Dashboard order in mobile application"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-500 dark:text-gray-400 font-normal">Dashboard image</Label>
            <div className="flex gap-4">
              <div className="w-32 h-32 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900/50 flex flex-col items-center justify-center text-center p-2 group relative overflow-hidden transition-all duration-200 shadow-inner">
                {dashboard.image ? (
                   <>
                      {dashboard.image.includes("/api/images/") ? (
                        <img src={getImagePreviewUrl(dashboard.image.replace("tb-image;", ""))} alt="Dashboard" className="max-w-full max-h-full object-contain" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full w-full px-2 text-center text-slate-500 overflow-hidden">
                          <LinkIcon className="h-4 w-4 mb-1" />
                          <span className="text-[10px] break-all line-clamp-4 leading-tight">{dashboard.image.replace("tb-image;", "")}</span>
                        </div>
                      )}
                      {isEdit && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer" onClick={() => updateField('image', null)}>
                           <Trash2 className="h-5 w-5 text-white" />
                        </div>
                      )}
                   </>
                ) : (
                  <>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">No image selected</span>
                    <div className="w-16 h-16 border rounded bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    </div>
                  </>
                )}
              </div>
              
              {isEdit && (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                   <Button
                      variant="outline"
                      className="h-full border border-dashed border-gray-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center p-4 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all cursor-pointer group py-4"
                      onClick={() => setIsGalleryOpen(true)}
                    >
                      <ImageIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-[#2A456C] dark:text-blue-300 font-medium text-center">Browse from gallery</span>
                   </Button>
                   <Button
                      variant="outline"
                      className="h-full border border-dashed border-gray-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center p-4 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all cursor-pointer group py-4"
                      onClick={() => setIsLinkDialogOpen(true)}
                    >
                      <LinkIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-[#2A456C] dark:text-blue-300 font-medium text-center">Set link</span>
                   </Button>
                </div>
              )}

              {!isEdit && !dashboard.image && (
                 <div className="flex-1 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/30 dark:bg-slate-900/10 flex items-center justify-center transition-opacity duration-200">
                    <span className="text-xs text-slate-400 dark:text-slate-600">Image preview</span>
                 </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ImageGalleryDialog 
        open={isGalleryOpen}
        onOpenChange={setIsGalleryOpen}
        onSelect={handleSelectGalleryImage}
      />

      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-none shadow-2xl p-0">
          <DialogHeader className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <DialogTitle className="text-lg font-normal">Set image link</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <div className="space-y-4">
               <div className="space-y-2">
                  <Label className="text-xs text-slate-500">Image URL</Label>
                  <Input 
                    value={tempLink}
                    onChange={(e) => setTempLink(e.target.value)}
                    placeholder="Enter image link"
                    className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-orange-500"
                    autoFocus
                  />
               </div>
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
             <Button variant="ghost" onClick={() => setIsLinkDialogOpen(false)}>Cancel</Button>
             <Button 
                onClick={handleSetLink} 
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-300 dark:hover:bg-slate-400 dark:text-slate-900 px-6"
                disabled={!tempLink}
             >
                Set
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
