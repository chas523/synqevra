"use client";

import { useState, useEffect, useId } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import FormField from "@/components/molecules/FormField";
import FormFieldRow from "@/components/molecules/FormFieldRow";
import InfoTooltip from "@/components/molecules/InfoTooltip";
import { SecuritySettingsDto } from "@/types/settingsTypes";
import {
  ConfigureSecuritySettingsFormData,
  configureSecuritySettingsSchema,
} from "@/lib/schemas/securitySettingsZodSchema";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingButton } from "../atoms";
import { HookFormField } from "../molecules";
import {
  generalPolicyFields,
  passwordPolicyFields,
} from "@/lib/config/securitySettingsFormFields";

interface SecuritySettingsFormProps {
  initialSettings: SecuritySettingsDto;
  onSave: (settings: SecuritySettingsDto) => Promise<void>;
  isSaving?: boolean;
}

export const SecuritySettingsForm = ({
  initialSettings,
  onSave,
  isSaving = false,
}: SecuritySettingsFormProps) => {
  const formId = useId();

  const form = useForm<ConfigureSecuritySettingsFormData>({
    mode: "onChange",
    resolver: zodResolver(configureSecuritySettingsSchema),
    defaultValues: initialSettings,
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting, isDirty },
    reset,
  } = form;

  const onSubmit: SubmitHandler<ConfigureSecuritySettingsFormData> = async (
    data,
  ) => {
    await onSave(data);
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="border-b">
        <CardTitle className="text-xl">Security settings</CardTitle>
        <CardAction>
          <InfoTooltip
            content={
              <div className="space-y-2">
                <p>Configure security policies for your tenants.</p>
                <p>These settings affect all users in each tenant.</p>
              </div>
            }
          />
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 flex flex-col"
        >
          <div className="space-y-4">
            <div className="pb-2 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                General policy
              </h3>
            </div>
            {generalPolicyFields.map((field) => (
              <HookFormField<ConfigureSecuritySettingsFormData>
                key={field.name}
                field={field}
                register={register}
                errors={errors}
                formId={formId}
              />
            ))}
          </div>

          <div className="space-y-4">
            <div className="pb-2 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Password policy
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {passwordPolicyFields.map((field) => (
                <HookFormField<ConfigureSecuritySettingsFormData>
                  key={field.name}
                  field={field}
                  register={register}
                  errors={errors}
                  formId={formId}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-row gap-3 ml-auto">
            <Button
              type="button"
              variant="outline"
              className="w-fit h-9"
              onClick={() => reset(initialSettings)}
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

export default SecuritySettingsForm;
