/*
  Warnings:

  - Added the required column `securityQuestion1` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `securityQuestion2` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `securityQuestion3` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "securityQuestion1" TEXT NOT NULL,
ADD COLUMN     "securityQuestion2" TEXT NOT NULL,
ADD COLUMN     "securityQuestion3" TEXT NOT NULL;
