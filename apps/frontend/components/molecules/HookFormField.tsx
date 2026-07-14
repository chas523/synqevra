import type {
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";
import Input from "../atoms/Input";
import Label from "../atoms/Label";

export interface FieldConfig<T extends FieldValues = FieldValues> {
  name: Path<T>;
  label: string;
  type?: "text" | "email" | "tel" | "password" | "textarea" | "number";
  required?: boolean;
  placeholder?: string;
  gridCols?: number;
}

export interface HookFormFieldProps<T extends FieldValues = FieldValues> {
  field: FieldConfig<T>;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  formId: string;
  disabled?: boolean;
}

const getNestedError = (
  errors: FieldErrors,
  path: string,
): string | undefined => {
  const keys = path.split(".");
  let current: any = errors;

  for (const key of keys) {
    if (current?.[key]) {
      current = current[key];
    } else {
      return undefined;
    }
  }

  return current?.message as string | undefined;
};

const HookFormField = <T extends FieldValues = FieldValues>({
  field,
  register,
  errors,
  formId,
  disabled = false,
}: HookFormFieldProps<T>) => {
  const fieldId = `${formId}-${String(field.name)}`;

  const error = getNestedError(errors, String(field.name));

  return (
    <div className="w-full">
      <Label
        htmlFor={fieldId}
        required={field.required}
        variant={error ? "error" : "default"}
      >
        {field.label}
      </Label>

      {field.type === "textarea" ? (
        <textarea
          id={fieldId}
          placeholder={field.placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 text-sm border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 border-border dark:border-gray-600 bg-background dark:bg-gray-800 text-foreground dark:text-gray-100 focus:ring-ring focus:border-ring disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
          {...register(field.name, { required: field.required })}
        />
      ) : (
        <Input
          id={fieldId}
          type={field.type || "text"}
          placeholder={field.placeholder}
          variant={error ? "error" : "default"}
          disabled={disabled}
          className={
            disabled
              ? "disabled:bg-muted disabled:text-muted-foreground dark:disabled:bg-gray-700 dark:disabled:text-gray-400 disabled:opacity-70 disabled:cursor-not-allowed"
              : ""
          }
          {...register(field.name, {
            required: field.required,
            setValueAs: (value) => {
              if (field.type === "number") {
                if (value === "" || value === null || value === undefined) {
                  return null;
                }
                const num = Number(value);
                return isNaN(num) ? null : num;
              }
              return value;
            },
          })}
        />
      )}

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
};

export default HookFormField;
