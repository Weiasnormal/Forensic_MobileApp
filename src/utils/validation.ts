import type * as zTypes from 'zod';
import { z } from 'zod';

function createNameSchema(fieldLabel: string) {
  return z
    .string()
    .trim()
    .min(1, `${fieldLabel} is required`)
    .max(50, `${fieldLabel} must be 50 characters or fewer`)
    .regex(/^[A-Za-z][A-Za-z\s.'-]*$/, `${fieldLabel} contains invalid characters.`);
}

export const nameSchema = createNameSchema('Name');

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
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^[A-Z]{3}[A-Z0-9]{4}$/,
      'Invite code must be 3 letters followed by 4 letters/numbers (e.g. ABC-1X2Y)',
    ),
});

export const verificationCodeSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, 'Verification code must be exactly 6 digits'),
});

export const signUpSchema = z
  .object({
    firstName: createNameSchema('First name'),
    lastName: createNameSchema('Last name'),
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