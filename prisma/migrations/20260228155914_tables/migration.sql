/*
  Warnings:

  - You are about to drop the column `seats` on the `Tables` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tableId]` on the table `FloorItems` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tableType` to the `Tables` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TableType" AS ENUM ('TWO', 'FOUR', 'SIX');

-- DropForeignKey
ALTER TABLE "FloorItems" DROP CONSTRAINT "FloorItems_tableId_fkey";

-- AlterTable
ALTER TABLE "Tables" DROP COLUMN "seats",
ADD COLUMN     "tableType" "TableType" NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'ADMIN';

-- DropEnum
DROP TYPE "SeatsType";

-- CreateIndex
CREATE UNIQUE INDEX "FloorItems_tableId_key" ON "FloorItems"("tableId");

-- AddForeignKey
ALTER TABLE "FloorItems" ADD CONSTRAINT "FloorItems_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Tables"("id") ON DELETE CASCADE ON UPDATE CASCADE;
