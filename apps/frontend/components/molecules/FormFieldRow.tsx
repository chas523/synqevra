import FormField from "./FormField";

export interface FormFieldRowProps {
  leftField: {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
  };
  rightField: {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
  };
}

const FormFieldRow = ({ leftField, rightField }: FormFieldRowProps) => {
  return (
    <div className="flex gap-2">
      <div className="w-1/2">
        <FormField
          label={leftField.label}
          name={leftField.name}
          value={leftField.value}
          onChange={leftField.onChange}
          placeholder={leftField.placeholder}
          required={leftField.required}
          error={leftField.error}
        />
      </div>
      <div className="w-1/2">
        <FormField
          label={rightField.label}
          name={rightField.name}
          value={rightField.value}
          onChange={rightField.onChange}
          placeholder={rightField.placeholder}
          required={rightField.required}
          error={rightField.error}
        />
      </div>
    </div>
  );
};

export default FormFieldRow;
