/*
  Warnings:

  - You are about to drop the column `avatar` on the `characters` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `characters` table. All the data in the column will be lost.
  - You are about to drop the column `why_note` on the `characters` table. All the data in the column will be lost.
  - You are about to drop the column `added_at` on the `traits` table. All the data in the column will be lost.
  - You are about to drop the column `icon` on the `traits` table. All the data in the column will be lost.
  - You are about to drop the column `is_custom` on the `traits` table. All the data in the column will be lost.
  - You are about to drop the column `key` on the `traits` table. All the data in the column will be lost.
  - You are about to drop the column `removed_at` on the `traits` table. All the data in the column will be lost.
  - You are about to drop the column `start_level` on the `traits` table. All the data in the column will be lost.
  - You are about to drop the column `target_level` on the `traits` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `traits` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to drop the `daily_character_snapshots` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `milestones` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `xp_events` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `identity` to the `characters` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sort_order` to the `traits` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "daily_character_snapshots" DROP CONSTRAINT "daily_character_snapshots_user_id_fkey";

-- DropForeignKey
ALTER TABLE "milestones" DROP CONSTRAINT "milestones_user_id_fkey";

-- DropForeignKey
ALTER TABLE "xp_events" DROP CONSTRAINT "xp_events_trait_id_fkey";

-- DropForeignKey
ALTER TABLE "xp_events" DROP CONSTRAINT "xp_events_user_id_fkey";

-- AlterTable
ALTER TABLE "characters" DROP COLUMN "avatar",
DROP COLUMN "name",
DROP COLUMN "why_note",
ADD COLUMN     "identity" VARCHAR(60) NOT NULL;

-- AlterTable
ALTER TABLE "traits" DROP COLUMN "added_at",
DROP COLUMN "icon",
DROP COLUMN "is_custom",
DROP COLUMN "key",
DROP COLUMN "removed_at",
DROP COLUMN "start_level",
DROP COLUMN "target_level",
ADD COLUMN     "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "sort_order" SMALLINT NOT NULL,
ALTER COLUMN "name" SET DATA TYPE VARCHAR(30);

-- DropTable
DROP TABLE "daily_character_snapshots";

-- DropTable
DROP TABLE "milestones";

-- DropTable
DROP TABLE "xp_events";

-- DropEnum
DROP TYPE "XpReason";
