import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { userFields } from "@/lib/config/activateFormFields";
import type { ConnectionFormData } from "@/lib/schemas/activationZodSchema";
import type { ConfigurePractitionerFormData } from "@/lib/schemas/configurePractitionerZodSchema";
import HookFormField from "../molecules/HookFormField";

interface UserFormSectionProps {
  register: UseFormRegister<ConnectionFormData | ConfigurePractitionerFormData>;
  errors: FieldErrors<ConnectionFormData>;
  formId: string;
  disabledFields?: string[];
}

export const UserFormSection = ({
  register,
  errors,
  formId,
  disabledFields = [],
}: UserFormSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="pb-2 border-b">
        <h3 className="text-lg font-semibold">Your Details</h3>
        <p className="text-sm text-muted-foreground">
          Personal information for your account
        </p>
      </div>

      {userFields.map((field) => (
        <HookFormField<ConnectionFormData | ConfigurePractitionerFormData>
          key={field.name}
          field={field}
          register={register}
          errors={errors}
          formId={formId}
          disabled={disabledFields.includes(String(field.name))}
        />
      ))}

      {errors.confirmPassword?.type === "custom" && (
        <p className="text-sm text-destructive">Passwords do not match</p>
      )}
    </div>
  );
};
