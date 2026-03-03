/*
  Warnings:

  - You are about to drop the column `userAllergens` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "userAllergens",
ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
