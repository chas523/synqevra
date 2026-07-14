import { z } from "zod";

export const configurePractitionerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    userEmail: z.string().email("Invalid email format"),
    userPhone: z.string().optional(),
    userDescription: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type ConfigurePractitionerFormData = z.infer<
  typeof configurePractitionerSchema
>;
