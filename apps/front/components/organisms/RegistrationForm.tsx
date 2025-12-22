import { useState } from "react";
import { LoadingButton } from "../atoms";
import ErrorMessage from "../molecules/ErrorMessage";
import FormField from "../molecules/FormField";
import FormFieldRow from "../molecules/FormFieldRow";

export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
}

export interface RegistrationFormProps {
  onSubmit: (formData: FormData) => void;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

const RegistrationForm = ({
  onSubmit,
  isLoading = false,
  error,
  className = "",
}: RegistrationFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const baseStyles = ["space-y-3"];
  const allStyles = [...baseStyles, className];

  return (
    <form onSubmit={handleSubmit} className={allStyles.join(" ")}>
      <FormFieldRow
        leftField={{
          label: "First Name",
          name: "firstName",
          value: formData.firstName,
          onChange: handleInputChange,
          placeholder: "Enter your first name",
          required: true,
        }}
        rightField={{
          label: "Last Name",
          name: "lastName",
          value: formData.lastName,
          onChange: handleInputChange,
          placeholder: "Enter your last name",
          required: true,
        }}
      />

      <FormField
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        placeholder="enter@your.email"
        required
      />

      <LoadingButton
        type="submit"
        className="w-full h-9"
        isLoading={isLoading}
        textBeforeClick="Submit"
        textAfterClick="Submitting..."
      />

      {error && <ErrorMessage message={error} />}
    </form>
  );
};

export default RegistrationForm;
