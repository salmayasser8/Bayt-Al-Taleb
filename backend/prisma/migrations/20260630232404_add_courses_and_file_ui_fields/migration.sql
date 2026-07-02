-- AlterEnum
ALTER TYPE "AuditEntityType" ADD VALUE 'COURSE';

-- AlterEnum
ALTER TYPE "FileOwnerType" ADD VALUE 'COURSE';

-- AlterTable
ALTER TABLE "files" ADD COLUMN     "downloads" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "tags" TEXT[];

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "semester" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '📘',
    "majorId" TEXT NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "courses_majorId_idx" ON "courses"("majorId");

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_majorId_fkey" FOREIGN KEY ("majorId") REFERENCES "majors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
