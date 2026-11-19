import { z } from "zod";

export const passwordZodSchema = z
  .string()
  .min(8, "Password Must Minimum 8 Characters Long.")
  .max(64, "Password must be at most 64 characters long")
  .regex(/[a-z]/, "Password must contain atleast 1 Lowercase Letter")
  .regex(/[A-Z]/, "Password must contain atleast 1 Uppercase Letter")
  .regex(/[0-9]/, "Password must contain atleast 1 Number")
  .regex(/[^A-Za-z0-9]/, "Password must contain atleast 1 Special Character");

export const phoneZodSchema = z
  .string()
  .trim()
  .regex(/^(?:\+?88)?01[3-9]\d{8}$/, "Phone must be a valid Bangladeshi mobile number");

export const RegisterZodSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
    email: z.email("Email must be a valid email address").toLowerCase(),
    password: passwordZodSchema,
    phone: phoneZodSchema.optional(),
    role: z.enum(["USER", "AGENT"]).default("USER"),
    agencyName: z.string().trim().min(2, "Agency name is required").max(80).optional(),
    licenseNumber: z.string().trim().max(40).optional(),
  })
  .refine((data) => data.role !== "AGENT" || Boolean(data.agencyName), {
    message: "Agency name is required for agent accounts",
    path: ["agencyName"],
  });

export const LoginZodSchema = z.object({
  email: z.email("Email is not valid").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const GoogleLoginZodSchema = z.object({
  idToken: z.string().min(1, "Google ID token is required"),
});

export const ChangePasswordZodSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordZodSchema,
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password must be different from the current password",
    path: ["newPassword"],
  });

export const ForgotPasswordZodSchema = z.object({
  email: z.email("Email is not valid").toLowerCase(),
});

export const ResetPasswordZodSchema = z.object({
  email: z.email("Email is not valid").toLowerCase(),
  newPassword: passwordZodSchema,
  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits long"),
});
