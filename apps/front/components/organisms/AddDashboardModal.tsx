"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  HelpCircle,
  X,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  CustomerMultiSelect,
  Customer,
} from "@/components/molecules/CustomerMultiSelect";
import { DashboardService } from "@/lib/services/thingsboardServices/dashboardService";
import { toast } from "sonner";
import { cn, getImagePreviewUrl } from "@/lib/utils";
import { ImageGalleryDialog } from "@/components/widget-editor/ImageGalleryDialog";

interface AddDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddDashboardModal({
  isOpen,
  onClose,
  onSuccess,
}: AddDashboardModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const [mobileHide, setMobileHide] = useState(false);
  const [mobileOrder, setMobileOrder] = useState<number | "">("");
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gallery state
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [tempLink, setTempLink] = useState("");

  const handleAdd = async () => {
    if (!title) {
      toast.error("Title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        image, // This is already in "tb-image;url" format from selection
        mobileHide: mobileHide || null,
        mobileOrder: mobileOrder === "" ? null : Number(mobileOrder),
        configuration: {
          description,
          widgets: {},
          states: {
            default: {
              name: title,
              root: true,
              layouts: {
                main: {
                  widgets: [],
                  gridSettings: {
                    backgroundColor: "#eeeeee",
                    columns: 24,
                    margin: 10,
                    outerMargin: true,
                    backgroundSize: "100%",
                  },
                },
              },
            },
          },
          entityAliases: {},
          filters: {},
          settings: {
            stateControllerId: "entity",
            showTitle: false,
            showDashboardsSelect: true,
            showEntitiesSelect: true,
            showFilters: true,
            showDashboardLogo: true,
            dashboardLogoUrl: "",
            showDashboardToolbar: true,
            displaySecondaryToolbar: true,
            toolbarAlwaysOpen: true,
            showToolbarDatahouseSelect: false,
            showToolbarEntitySelect: false,
            showToolbarFilters: false,
            showToolbarMobileLogo: false,
            toolbarMobileLogoUrl: "",
          },
        },
      };

      const dashboard = await DashboardService.saveDashboard(payload);

      if (selectedCustomers.length > 0) {
        const customerIds = selectedCustomers.map((c) => c.id.id);
        await DashboardService.updateDashboardCustomers(
          dashboard.id.id,
          customerIds,
        );
      }

      toast.success("Dashboard created successfully");
      onSuccess();
      handleClose();
    } catch (error) {
      toast.error("Failed to create dashboard");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setSelectedCustomers([]);
    setMobileHide(false);
    setMobileOrder("");
    setImage(null);
    onClose();
  };

  const handleSelectGalleryImage = (imageLink: string) => {
    // Prefix with tb-image; if not already present
    const formattedImage = imageLink.startsWith("tb-image;")
      ? imageLink
      : `tb-image;${imageLink}`;
    setImage(formattedImage);
    setIsGalleryOpen(false);
  };

  const handleSetLink = () => {
    if (tempLink) {
      const formattedImage = tempLink.startsWith("tb-image;")
        ? tempLink
        : `tb-image;${tempLink}`;
      setImage(formattedImage);
      setTempLink("");
      setIsLinkDialogOpen(false);
    }
  };

  const fieldLabelClass =
    "text-sm font-medium text-muted-foreground dark:text-slate-400";
  const fieldInputClass =
    "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-orange-500 dark:text-white";

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => !open && !isSubmitting && handleClose()}
      >
        <DialogContent className="[&>button:last-child]:hidden max-w-[480px] md:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-none shadow-2xl bg-white dark:bg-slate-900">
          <DialogHeader className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-xl dark:text-white font-normal">
              Add dashboard
            </DialogTitle>
            <div className="flex items-center gap-3">
              <button className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors">
                <HelpCircle className="h-6 w-6" />
              </button>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            <div className="flex flex-col gap-6">
              {/* Title */}
              <div className="space-y-2">
                <Label className={fieldLabelClass}>Title*</Label>
                <Input
                  className={fieldInputClass}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className={fieldLabelClass}>Description</Label>
                <Textarea
                  className={cn(fieldInputClass, "min-h-[100px] resize-none")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* Assigned Customers */}
              <div className="space-y-2">
                <Label className={fieldLabelClass}>Assigned customers</Label>
                <CustomerMultiSelect
                  selectedCustomers={selectedCustomers}
                  onCustomersChange={setSelectedCustomers}
                  placeholder="Entity list"
                />
              </div>

              {/* Mobile Settings card */}
              <fieldset className="border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-6 bg-slate-50/20 dark:bg-slate-900/30">
                <legend className="text-sm font-medium text-foreground dark:text-slate-300 px-2 flex items-center gap-2">
                  Mobile application settings
                </legend>

                <div className="flex items-center gap-3 pt-1">
                  <Switch
                    id="modal-mobileHide"
                    checked={mobileHide}
                    onCheckedChange={setMobileHide}
                    disabled={isSubmitting}
                    className="data-[state=checked]:bg-orange-500"
                  />
                  <Label
                    htmlFor="modal-mobileHide"
                    className="text-sm font-normal text-muted-foreground dark:text-slate-300"
                  >
                    Hide dashboard in mobile application
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Dashboard order in mobile application
                  </Label>
                  <Input
                    type="number"
                    className={cn(fieldInputClass, "h-9")}
                    value={mobileOrder}
                    onChange={(e) =>
                      setMobileOrder(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    disabled={isSubmitting}
                    placeholder="Dashboard order"
                  />
                </div>

                {/* Dashboard image shifted inside */}
                <div className="space-y-2">
                  <Label className={fieldLabelClass}>Dashboard image</Label>
                  <div className="flex gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900/50 shadow-sm transition-all duration-200">
                    <div className="w-24 h-24 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 flex items-center justify-center p-1 relative group overflow-hidden shadow-inner">
                      {image ? (
                        <>
                          {image.includes("/api/images/") ? (
                            <img
                              src={getImagePreviewUrl(
                                image.replace("tb-image;", ""),
                              )}
                              alt="Preview"
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full w-full px-2 text-center text-slate-500 overflow-hidden">
                              <LinkIcon className="h-4 w-4 mb-1" />
                              <span className="text-[9px] break-all line-clamp-3 leading-tight">
                                {image.replace("tb-image;", "")}
                              </span>
                            </div>
                          )}
                          <div
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                            onClick={() => setImage(null)}
                          >
                            <Trash2 className="h-5 w-5 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-400 mb-1 font-mono uppercase tracking-wider">
                            No image
                          </span>
                          <ImageIcon className="w-8 h-8 text-slate-200 dark:text-slate-700" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button
                        variant="ghost"
                        className="h-full border border-dashed border-slate-300 dark:border-slate-700 flex flex-col gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all py-4 group/btn"
                        disabled={isSubmitting}
                        onClick={() => setIsGalleryOpen(true)}
                      >
                        <ImageIcon className="w-6 h-6 text-slate-400 group-hover/btn:text-orange-500 transition-colors" />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          Browse from gallery
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-full border border-dashed border-slate-300 dark:border-slate-700 flex flex-col gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all py-4 group/btn"
                        disabled={isSubmitting}
                        onClick={() => setIsLinkDialogOpen(true)}
                      >
                        <LinkIcon className="w-6 h-6 text-slate-400 group-hover/btn:text-orange-500 transition-colors" />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          Set link
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 sm:justify-end">
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-slate-500 dark:text-slate-400"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={isSubmitting || !title.trim()}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-300 dark:hover:bg-slate-400 dark:text-slate-900 font-medium px-8 min-w-[100px]"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ImageGalleryDialog
        open={isGalleryOpen}
        onOpenChange={setIsGalleryOpen}
        onSelect={handleSelectGalleryImage}
      />

      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-none shadow-2xl p-0">
          <DialogHeader className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <DialogTitle className="text-lg font-normal">
              Set image link
            </DialogTitle>
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
            <Button variant="ghost" onClick={() => setIsLinkDialogOpen(false)}>
              Cancel
            </Button>
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
    </>
  );
}
