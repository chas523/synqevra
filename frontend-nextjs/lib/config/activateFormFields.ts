import type { Path } from "react-hook-form";
import type { ConnectionFormData } from "../schemas/activationZodSchema";

export interface FieldConfig {
  name: Path<ConnectionFormData>;
  label: string;
  type?: "text" | "email" | "tel" | "password" | "textarea";
  required?: boolean;
  placeholder?: string;
  gridCols?: number; // for responsive grid layout
}

export const tenantFields: FieldConfig[] = [
  {
    name: "title",
    label: "Company Name*",
    required: true,
    placeholder: "Enter company name",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Brief description of your company",
  },
  {
    name: "country",
    label: "Country",
    placeholder: "Country",
  },
  {
    name: "city",
    label: "City",
    gridCols: 1,
    placeholder: "City",
  },
  {
    name: "state",
    label: "State / Province",
    gridCols: 1,
    placeholder: "State",
  },
  {
    name: "zipCode",
    label: "Zip Code",
    gridCols: 1,
    placeholder: "Zip",
  },
  {
    name: "address",
    label: "Address",
    placeholder: "Street address",
  },
  {
    name: "address2",
    label: "Address 2",
    placeholder: "Apt, suite, etc. (optional)",
  },
  {
    name: "phone",
    label: "Phone",
    type: "tel",
    placeholder: "+12015550123",
  },
  {
    name: "tenantEmail",
    label: "Email",
    type: "email",
    placeholder: "company@example.com",
  },
];

export const userFields: FieldConfig[] = [
  {
    name: "userEmail",
    label: "Email*",
    type: "email",
    required: true,
    placeholder: "your@email.com",
  },
  {
    name: "firstName",
    label: "First Name",
    placeholder: "John",
  },
  {
    name: "lastName",
    label: "Last Name",
    placeholder: "Doe",
  },
  {
    name: "userPhone",
    label: "Phone",
    type: "tel",
    placeholder: "+12015550123",
  },
  {
    name: "userDescription",
    label: "Description",
    type: "textarea",
    placeholder: "Brief description (optional)",
  },
  {
    name: "password",
    label: "Password*",
    type: "password",
    required: true,
    placeholder: "••••••••",
  },
  {
    name: "confirmPassword",
    label: "Confirm Password*",
    type: "password",
    required: true,
    placeholder: "••••••••",
  },
];
