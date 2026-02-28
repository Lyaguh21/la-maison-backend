/*
  Warnings:

  - You are about to drop the `Allergen` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserAllergen` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserAllergen" DROP CONSTRAINT "UserAllergen_allergenId_fkey";

-- DropForeignKey
ALTER TABLE "UserAllergen" DROP CONSTRAINT "UserAllergen_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userAllergens" TEXT[];

-- DropTable
DROP TABLE "Allergen";

-- DropTable
DROP TABLE "UserAllergen";
