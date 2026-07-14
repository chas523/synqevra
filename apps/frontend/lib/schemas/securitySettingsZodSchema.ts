import z from "zod";

export const configureSecuritySettingsSchema = z
  .object({
    passwordPolicy: z.object({
      minimumLength: z
        .number()
        .min(1, "Minimum length must be at least 1")
        .max(100, "Minimum length cannot exceed 100"),
      maximumLength: z
        .number()
        .min(1, "Maximum length must be at least 1")
        .max(500, "Maximum length cannot exceed 500")
        .nullable(),
      minimumUppercaseLetters: z
        .number()
        .min(0, "Cannot be negative")
        .max(50, "Cannot exceed 50")
        .nullable(),
      minimumLowercaseLetters: z
        .number()
        .min(0, "Cannot be negative")
        .max(50, "Cannot exceed 50")
        .nullable(),
      minimumDigits: z
        .number()
        .min(0, "Cannot be negative")
        .max(50, "Cannot exceed 50")
        .nullable(),
      minimumSpecialCharacters: z
        .number()
        .min(0, "Cannot be negative")
        .max(50, "Cannot exceed 50")
        .nullable(),
      passwordExpirationPeriodDays: z
        .number()
        .min(1, "Must be at least 1 day")
        .max(3650, "Cannot exceed 10 years")
        .nullable(),
      passwordReuseFrequencyDays: z
        .number()
        .min(0, "Cannot be negative")
        .max(3650, "Cannot exceed 10 years")
        .nullable(),
    }),
    maxFailedLoginAttempts: z
      .number()
      .min(1, "Must be at least 1")
      .max(100, "Cannot exceed 100")
      .nullable(),
    userLockoutNotificationEmail: z
      .string()
      .email("Must be a valid email address")
      .nullable()
      .or(z.literal("")),
    mobileSecretKeyLength: z
      .number()
      .min(8, "Must be at least 8 characters")
      .max(512, "Cannot exceed 512 characters")
      .nullable(),
    userActivationTokenTtl: z
      .number()
      .min(1, "Must be at least 1 hour")
      .max(8760, "Cannot exceed 1 year"),
    passwordResetTokenTtl: z
      .number()
      .min(1, "Must be at least 1 hour")
      .max(168, "Cannot exceed 1 week"),
  })
  .refine(
    (data) => {
      // Custom validation: maximum length should be greater than minimum length
      if (
        data.passwordPolicy.maximumLength !== null &&
        data.passwordPolicy.maximumLength <= data.passwordPolicy.minimumLength
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Maximum password length must be greater than minimum length",
      path: ["passwordPolicy", "maximumLength"],
    },
  );

export type ConfigureSecuritySettingsFormData = z.infer<
  typeof configureSecuritySettingsSchema
>;
