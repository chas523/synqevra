import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { tenantFields } from '../../config/formFields';
import { FormField } from './FormField';

interface TenantFormSectionProps {
  // biome-ignore lint/suspicious/noExplicitAny: simplifying for debugging
  register: UseFormRegister<any>;
  // biome-ignore lint/suspicious/noExplicitAny: simplifying for debugging
  errors: FieldErrors<any>;
  formId: string;
}

export const TenantFormSection = ({
  register,
  errors,
  formId,
}: TenantFormSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Add Tenant</h3>

      {tenantFields.map(field => {
        // Special handling for grid fields (city, state, zipCode)
        if (['city', 'state', 'zipCode'].includes(field.name)) {
          return null; // Handle these separately below
        }

        return (
          <FormField
            key={field.name}
            field={field}
            register={register}
            errors={errors}
            formId={formId}
          />
        );
      })}

      {/* Special grid layout for city, state, zipCode */}
      <div className="grid grid-cols-3 gap-4">
        {tenantFields
          .filter(field => ['city', 'state', 'zipCode'].includes(field.name))
          .map(field => (
            <FormField
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
