"use client";

import { useId } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import InfoTooltip from "@/components/molecules/InfoTooltip";
import { GeneralSettingsDto } from "@/types/generalSettingsTypes";
import { useForm, Controller } from "react-hook-form";
import { LoadingButton } from "../atoms";

interface GeneralSettingsFormProps {
  initialSettings: GeneralSettingsDto;
  onSave: (settings: GeneralSettingsDto) => Promise<void>;
  isSaving?: boolean;
}

interface FormData {
  baseUrl: string;
  prohibitDifferentUrl: boolean;
}

export const GeneralSettingsForm = ({
  initialSettings,
  onSave,
  isSaving = false,
}: GeneralSettingsFormProps) => {
  const formId = useId();

  const {
    register,
    handleSubmit,
    control,
    formState: { isValid, isSubmitting, isDirty },
    reset,
  } = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      baseUrl: initialSettings.jsonValue.baseUrl,
      prohibitDifferentUrl: initialSettings.jsonValue.prohibitDifferentUrl,
    },
  });

  const onSubmit = async (data: FormData) => {
    const updatedSettings: GeneralSettingsDto = {
      ...initialSettings,
      jsonValue: {
        baseUrl: data.baseUrl,
        prohibitDifferentUrl: data.prohibitDifferentUrl,
      },
    };
    await onSave(updatedSettings);
    reset(data);
  };

  return (
    <Card className="w-full">
      <CardHeader className="border-b">
        <CardTitle className="text-xl">General Settings</CardTitle>
        <CardAction>
          <InfoTooltip
            content={
              <div className="space-y-2">
                <p>
                  Configure base URL settings for your ThingsBoard instance.
                </p>
                <p>
                  The Base URL is used for generating links in emails and
                  notifications.
                </p>
              </div>
            }
          />
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <form
          id={formId}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 flex flex-col"
        >
          <div className="space-y-2">
            <Label htmlFor={`${formId}-baseUrl`}>Base URL *</Label>
            <Input
              id={`${formId}-baseUrl`}
              {...register("baseUrl", { required: true })}
              placeholder="http://localhost:8080"
            />
            <p className="text-sm text-muted-foreground">
              Base URL is used to generate all internal links and for public API
              access.
            </p>
          </div>

          <div className="flex items-center justify-between space-x-4">
            <div className="space-y-0.5">
              <Label htmlFor={`${formId}-prohibit`}>
                Prohibit to use hostname from client request headers
              </Label>
              <p className="text-sm text-muted-foreground">
                When enabled, the system will only use the configured Base URL.
              </p>
            </div>
            <Controller
              name="prohibitDifferentUrl"
              control={control}
              render={({ field }) => (
                <Switch
                  id={`${formId}-prohibit`}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="flex flex-row gap-3 ml-auto pt-4">
            <Button
              type="button"
              variant="outline"
              className="w-fit h-9"
              onClick={() =>
                reset({
                  baseUrl: initialSettings.jsonValue.baseUrl,
                  prohibitDifferentUrl:
                    initialSettings.jsonValue.prohibitDifferentUrl,
                })
              }
            >
              Undo
            </Button>
            <LoadingButton
              type="submit"
              className="w-fit h-9"
              isLoading={isSaving || isSubmitting}
              textBeforeClick="Save"
              textAfterClick="Saving..."
              disabled={!isValid || !isDirty || isSaving || isSubmitting}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default GeneralSettingsForm;
