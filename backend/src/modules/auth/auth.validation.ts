import { z } from 'zod';

/** Zod schemas for Auth request bodies. Used by the `validate` middleware. */

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be at most 72 characters'),
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be at most 100 characters')
    .trim(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const verifyOtpSchema = z.object({
  tempToken: z.string().min(1, 'Temporary token is required'),
  code: z.string().length(6, 'Code must be 6 digits'),
});

export const twoFactorCodeSchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
});

// ─── Inferred Input Types ────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput    = z.infer<typeof loginSchema>;
export type RefreshInput  = z.infer<typeof refreshSchema>;
export type LogoutInput   = z.infer<typeof logoutSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type TwoFactorCodeInput = z.infer<typeof twoFactorCodeSchema>;