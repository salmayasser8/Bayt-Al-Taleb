-- Add OTP expiry column for email-based two-factor authentication
ALTER TABLE "users" ADD COLUMN "otpExpiresAt" TIMESTAMP(3);
