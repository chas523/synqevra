import Input from "../atoms/Input";
import Label from "../atoms/Label";

export interface FormFieldProps {
  label: string;
  id?: string;
  error?: string;
  required?: boolean;
  name?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FormField = ({
  label,
  id,
  error,
  required = false,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  ...props
}: FormFieldProps) => {
  // Prosty sposób na unikalne ID
  const fieldId =
    id || `field-${name || label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="w-full">
      <Label
        htmlFor={fieldId}
        required={required}
        variant={error ? "error" : "default"}
      >
        {label}
      </Label>
      <Input
        id={fieldId}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        variant={error ? "error" : "default"}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormField;
