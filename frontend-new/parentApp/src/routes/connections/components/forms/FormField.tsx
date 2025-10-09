import type { FieldError, FieldErrors, UseFormRegister } from 'react-hook-form';
// import { Input } from '@/components/ui/input';
import type { FieldConfig } from '../../config/formFields';

interface FormFieldProps {
  field: FieldConfig;
  // biome-ignore lint/suspicious/noExplicitAny: simplifying for debugging
  register: UseFormRegister<any>;
  // biome-ignore lint/suspicious/noExplicitAny: simplifying for debugging
  errors: FieldErrors<any>;
  formId: string;
}

export const FormField = ({
  field,
  register,
  errors,
  formId,
}: FormFieldProps) => {
  const fieldError = errors[field.name] as FieldError | undefined;
  const isRequired = field.required;
  const labelClass = `text-sm font-medium ${isRequired ? 'text-red-500' : ''}`;

  return (
    <div className="space-y-2">
      <label htmlFor={`${formId}-${field.name}`} className={labelClass}>
        {field.label}
      </label>

      {field.type === 'textarea' ? (
        <textarea
          id={`${formId}-${field.name}`}
          {...register(field.name)}
          className="w-full min-h-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={field.placeholder}
          required={isRequired}
        />
      ) : (
        <input
          id={`${formId}-${field.name}`}
          type={field.type || 'text'}
          {...register(field.name)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={field.placeholder}
          required={isRequired}
        />
      )}

      {fieldError && (
        <p className="text-sm text-red-500">{fieldError.message}</p>
      )}
    </div>
  );
};
