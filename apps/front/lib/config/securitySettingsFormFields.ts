import type { Path } from "react-hook-form";
import type { ConfigureSecuritySettingsFormData } from "../schemas/securitySettingsZodSchema";

export interface SecurityFieldConfig {
  name: Path<ConfigureSecuritySettingsFormData>;
  label: string;
  type?: "text" | "email" | "number";
  required?: boolean;
  placeholder?: string;
  gridCols?: number; // for responsive grid layout
}

export const generalPolicyFields: SecurityFieldConfig[] = [
  {
    name: "maxFailedLoginAttempts",
    label: "Maximum number of failed login attempts, before account is locked",
    type: "number",
    placeholder: "5",
  },
  {
    name: "userLockoutNotificationEmail",
    label: "In case user account lockout, send notification to email",
    type: "email",
    placeholder: "admin@example.com",
  },
  {
    name: "userActivationTokenTtl",
    label: "User activation link TTL in hours",
    type: "number",
    required: true,
    placeholder: "24",
    gridCols: 1,
  },
  {
    name: "passwordResetTokenTtl",
    label: "Password reset link TTL in hours",
    type: "number",
    required: true,
    placeholder: "24",
    gridCols: 1,
  },
  {
    name: "mobileSecretKeyLength",
    label: "Mobile secret key length",
    type: "number",
    placeholder: "64",
  },
];

export const passwordPolicyFields: SecurityFieldConfig[] = [
  {
    name: "passwordPolicy.minimumLength",
    label: "Minimum password length",
    type: "number",
    required: true,
    placeholder: "6",
    gridCols: 1,
  },
  {
    name: "passwordPolicy.maximumLength",
    label: "Maximum password length",
    type: "number",
    placeholder: "72",
    gridCols: 1,
  },
  {
    name: "passwordPolicy.minimumUppercaseLetters",
    label: "Minimum number of uppercase letters",
    type: "number",
    placeholder: "1",
    gridCols: 1,
  },
  {
    name: "passwordPolicy.minimumLowercaseLetters",
    label: "Minimum number of lowercase letters",
    type: "number",
    placeholder: "1",
    gridCols: 1,
  },
  {
    name: "passwordPolicy.minimumDigits",
    label: "Minimum number of digits",
    type: "number",
    placeholder: "1",
    gridCols: 1,
  },
  {
    name: "passwordPolicy.minimumSpecialCharacters",
    label: "Minimum number of special characters",
    type: "number",
    placeholder: "1",
    gridCols: 1,
  },
  {
    name: "passwordPolicy.passwordExpirationPeriodDays",
    label: "Password expiration period in days",
    type: "number",
    placeholder: "90",
    gridCols: 1,
  },
  {
    name: "passwordPolicy.passwordReuseFrequencyDays",
    label: "Password reuse frequency in days",
    type: "number",
    placeholder: "30",
    gridCols: 1,
  },
];

// Combined fields for easy iteration
export const allSecurityFields = [
  ...generalPolicyFields,
  ...passwordPolicyFields,
];

// Field pairs for FormFieldRow components
export const passwordPolicyFieldPairs = [
  {
    left: passwordPolicyFields[0], // minimumLength
    right: passwordPolicyFields[1], // maximumLength
  },
  {
    left: passwordPolicyFields[2], // minimumUppercaseLetters
    right: passwordPolicyFields[3], // minimumLowercaseLetters
  },
  {
    left: passwordPolicyFields[4], // minimumDigits
    right: passwordPolicyFields[5], // minimumSpecialCharacters
  },
  {
    left: passwordPolicyFields[6], // passwordExpirationPeriodDays
    right: passwordPolicyFields[7], //passwordReuseFrequencyDays
  },
];
