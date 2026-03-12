"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageSelector } from "@/components/organisms/ImageSelector";
import { WidgetService } from "@/lib/services/thingsboardServices/widgetService";
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  alias: z.string().optional(),
  description: z.string().optional(),
  scada: z.boolean(),
  image: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateWidgetBundleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CreateWidgetBundleDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: CreateWidgetBundleDialogProps) => {
  const [showImageSelector, setShowImageSelector] = useState(false);

  const {
    control,
    handleSubmit,
    register,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      alias: "",
      description: "",
      scada: false,
      image: "",
    },
  });

  const imageValue = watch("image");

  const onSubmit = async (values: FormValues) => {
    try {
      await WidgetService.saveWidgetBundle(values);
      toast.success("Widget bundle created successfully");
      onOpenChange(false);
      reset();
      onSuccess?.();
    } catch (error: any) {
      console.error("Failed to create widget bundle", error);
      const errorMessage =
        error?.response?.data?.message || "Failed to create widget bundle";
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Widget Bundle</DialogTitle>
            <DialogDescription>
              Create a new widget bundle to organize your widgets.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Bundle Title"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Image</Label>
              <div className="flex gap-4 items-start">
                <div className="h-24 w-24 border rounded-md overflow-hidden bg-muted flex items-center justify-center">
                  {imageValue ? (
                    <img
                      src={imageValue}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      No image
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowImageSelector(true)}
                  >
                    Select Image
                  </Button>
                  {imageValue && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setValue("image", "")}
                      className="text-destructive hover:text-destructive"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Bundle description..."
                {...register("description")}
              />
            </div>

            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">SCADA Bundle</Label>
                <DialogDescription>
                  Mark this bundle as valid for SCADA widgets.
                </DialogDescription>
              </div>
              <Controller
                control={control}
                name="scada"
                render={({ field: { value, onChange } }) => (
                  <Switch checked={value} onCheckedChange={onChange} />
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Bundle</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showImageSelector} onOpenChange={setShowImageSelector}>
        <DialogContent className="max-w-4xl h-[600px]">
          <DialogHeader>
            <DialogTitle>Select Image</DialogTitle>
          </DialogHeader>
          <ImageSelector
            onChange={(link) => {
              setValue("image", link);
              setShowImageSelector(false);
            }}
            onClose={() => setShowImageSelector(false)}
            value={imageValue}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
