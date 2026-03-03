/*
  Warnings:

  - You are about to drop the column `userId` on the `Ingredient` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Ingredient" DROP CONSTRAINT "Ingredient_userId_fkey";

-- AlterTable
ALTER TABLE "Ingredient" DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "_UserAllergens" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_UserAllergens_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserAllergens_B_index" ON "_UserAllergens"("B");

-- AddForeignKey
ALTER TABLE "_UserAllergens" ADD CONSTRAINT "_UserAllergens_A_fkey" FOREIGN KEY ("A") REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserAllergens" ADD CONSTRAINT "_UserAllergens_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
