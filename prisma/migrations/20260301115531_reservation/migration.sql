/*
  Warnings:

  - You are about to drop the column `guestCount` on the `Reservation` table. All the data in the column will be lost.
  - Added the required column `guestsCount` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "guestCount",
ADD COLUMN     "guestsCount" INTEGER NOT NULL;
