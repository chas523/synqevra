import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/molecules/FileDropzone";
import { toast } from "sonner";
import { WidgetService } from "@/lib/services/thingsboardServices/widgetService";

interface ImportWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: () => void;
}

export const ImportWidgetDialog = ({
  open,
  onOpenChange,
  onImportSuccess,
}: ImportWidgetDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const jsonContent = JSON.parse(e.target?.result as string);

        // Assuming the JSON structure matches what the backend expects
        // Or if it needs transformation, do it here.
        // The backend handles updateExistingByFqn=true
        await WidgetService.saveWidgetType(jsonContent, true);

        toast.success("Widget type imported successfully");
        onImportSuccess();
        onOpenChange(false);
      } catch (error) {
        console.error("Import failed:", error);
        toast.error(
          "Failed to import widget type. Invalid JSON or server error.",
        );
      } finally {
        setImporting(false);
        setFile(null);
      }
    };

    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Widget Type</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <FileDropzone
            onFilesSelected={(files) => {
              if (files.length > 0) {
                setFile(files[0]);
              }
            }}
            selectedFiles={file ? [file] : []}
            onRemoveFile={() => setFile(null)}
            accept=".json,application/json"
            className="h-32"
          />
          {file && (
            <div className="mt-2 text-sm text-muted-foreground">
              Selected file: {file.name}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!file || importing}>
            {importing ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
