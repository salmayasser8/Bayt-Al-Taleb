/*
  Warnings:

  - Added the required column `category` to the `colleges` table without a default value. This is not possible if the table is not empty.
  - Added the required column `degree` to the `majors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `scholarships` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `scholarships` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "colleges" ADD COLUMN     "category" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "majors" ADD COLUMN     "degree" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "scholarships" ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;
