import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { tenantFields } from "@/lib/config/activateFormFields";
import type { ConnectionFormData } from "@/lib/schemas/activationZodSchema";
import HookFormField from "../molecules/HookFormField";

interface TenantFormSectionProps {
  register: UseFormRegister<ConnectionFormData>;
  errors: FieldErrors<ConnectionFormData>;
  formId: string;
}

export const TenantFormSection = ({
  register,
  errors,
  formId,
}: TenantFormSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="pb-2 border-b">
        <h3 className="text-lg font-semibold">Company Details</h3>
        <p className="text-sm text-muted-foreground">
          Information about your organization
        </p>
      </div>

      {tenantFields.map((field) => {
        if (["city", "state", "zipCode"].includes(field.name)) {
          return null;
        }

        return (
          <HookFormField<ConnectionFormData>
            key={field.name}
            field={field}
            register={register}
            errors={errors}
            formId={formId}
          />
        );
      })}

      <div className="grid grid-cols-3 gap-3">
        {tenantFields
          .filter((field) => ["city", "state", "zipCode"].includes(field.name))
          .map((field) => (
            <HookFormField<ConnectionFormData>
              key={field.name}
              field={field}
              register={register}
              errors={errors}
              formId={formId}
            />
          ))}
      </div>
    </div>
  );
};
