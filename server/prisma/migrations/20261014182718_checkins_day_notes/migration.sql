-- AlterEnum
ALTER TYPE "HabitEntryStatus" ADD VALUE 'missed';

-- CreateTable
CREATE TABLE "daily_checkins" (
    "user_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "rating" SMALLINT NOT NULL,
    "completed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "daily_checkins_pkey" PRIMARY KEY ("user_id","date")
);

-- CreateTable
CREATE TABLE "day_notes" (
    "user_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "text" VARCHAR(280) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "day_notes_pkey" PRIMARY KEY ("user_id","date")
);

-- AddForeignKey
ALTER TABLE "daily_checkins" ADD CONSTRAINT "daily_checkins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "day_notes" ADD CONSTRAINT "day_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
