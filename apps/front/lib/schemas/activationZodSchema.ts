import { z } from "zod";

export const connectionSchema = z
  .object({
    // Tenant data
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    address: z.string().optional(),
    address2: z.string().optional(),
    phone: z.string().optional(),
    tenantEmail: z.string().optional(),

    // User data
    userEmail: z.email("Invalid email format"),
    firstName: z.string().min(1, "Firstname is required"),
    lastName: z.string().min(1, "Lastname is required"),
    userPhone: z.string().optional(),
    userDescription: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type ConnectionFormData = z.infer<typeof connectionSchema>;
