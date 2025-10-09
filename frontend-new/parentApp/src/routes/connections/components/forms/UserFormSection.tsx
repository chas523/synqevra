import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { userFields } from '../../config/formFields';
import { FormField } from './FormField';

interface UserFormSectionProps {
  // biome-ignore lint/suspicious/noExplicitAny: simplifying for debugging
  register: UseFormRegister<any>;
  // biome-ignore lint/suspicious/noExplicitAny: simplifying for debugging
  errors: FieldErrors<any>;
  formId: string;
}

export const UserFormSection = ({
  register,
  errors,
  formId,
}: UserFormSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Add User</h3>

      {userFields.map(field => (
        <FormField
          key={field.name}
          field={field}
          register={register}
          errors={errors}
          formId={formId}
        />
      ))}

      {/* Special password mismatch message */}
      {errors.confirmPassword?.type === 'custom' && (
        <p className="text-sm text-red-500">Passwords do not match</p>
      )}
    </div>
  );
};
