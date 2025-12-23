import { z } from "zod";

export const invitePractitionerSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),
  email: z.email("Invalid email format"),
});

export type InvitePractitionerFormData = z.infer<
  typeof invitePractitionerSchema
>;
