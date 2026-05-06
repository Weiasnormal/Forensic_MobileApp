import type * as zTypes from 'zod';

const { z } = require('zod') as { z: typeof import('zod').z };

export const nameSchema = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters long')
  .max(50, 'Name must be at most 50 characters long')
  .regex(/^[A-Za-z][A-Za-z\s.'-]*$/, 'Use letters only');

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

export const passwordSchema = z
  .string()
  .trim()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Must contain at least one special character');

export const confirmPasswordSchema = z
  .string()
  .min(1, 'Please confirm your password');

export const inviteCodeSchema = z.object({
  code: z.string().trim().regex(/^\d{7}$/, 'Invite code must be exactly 7 digits'),
});

export const verificationCodeSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, 'Verification code must be exactly 6 digits'),
});

export const signUpSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignUpFormValues = zTypes.infer<typeof signUpSchema>;
export type SignInFormValues = zTypes.infer<typeof signInSchema>;
export type ForgotPasswordFormValues = zTypes.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = zTypes.infer<typeof resetPasswordSchema>;
export type InviteCodeFormValues = zTypes.infer<typeof inviteCodeSchema>;
export type VerificationCodeFormValues = zTypes.infer<typeof verificationCodeSchema>;