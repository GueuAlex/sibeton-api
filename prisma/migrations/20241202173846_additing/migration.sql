/*
  Warnings:

  - You are about to drop the column `cover` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "cover",
ADD COLUMN     "unit_price" INTEGER NOT NULL DEFAULT 0;
