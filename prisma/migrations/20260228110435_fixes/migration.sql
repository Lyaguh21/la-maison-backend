/*
  Warnings:

  - You are about to drop the `Student` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `floor_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `userAllergen` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "floor_items" DROP CONSTRAINT "floor_items_tableId_fkey";

-- DropForeignKey
ALTER TABLE "userAllergen" DROP CONSTRAINT "userAllergen_allergenId_fkey";

-- DropForeignKey
ALTER TABLE "userAllergen" DROP CONSTRAINT "userAllergen_userId_fkey";

-- DropTable
DROP TABLE "Student";

-- DropTable
DROP TABLE "floor_items";

-- DropTable
DROP TABLE "userAllergen";

-- CreateTable
CREATE TABLE "UserAllergen" (
    "userId" INTEGER NOT NULL,
    "allergenId" INTEGER NOT NULL,

    CONSTRAINT "UserAllergen_pkey" PRIMARY KEY ("userId","allergenId")
);

-- CreateTable
CREATE TABLE "FloorItems" (
    "id" SERIAL NOT NULL,
    "type" "TypeFloorItems" NOT NULL,
    "tableId" INTEGER,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "rotation" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FloorItems_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserAllergen" ADD CONSTRAINT "UserAllergen_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAllergen" ADD CONSTRAINT "UserAllergen_allergenId_fkey" FOREIGN KEY ("allergenId") REFERENCES "Allergen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FloorItems" ADD CONSTRAINT "FloorItems_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Tables"("id") ON DELETE SET NULL ON UPDATE CASCADE;
