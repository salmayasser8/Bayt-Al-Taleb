-- Make passwordHash nullable
ALTER TABLE "users" ALTER COLUMN "passwordHash" DROP NOT NULL;

-- Add googleId column
ALTER TABLE "users" ADD COLUMN "googleId" TEXT UNIQUE;

-- Add twoFactorSecret column
ALTER TABLE "users" ADD COLUMN "twoFactorSecret" TEXT;

-- Add twoFactorEnabled column with default false
ALTER TABLE "users" ADD COLUMN "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT FALSE;