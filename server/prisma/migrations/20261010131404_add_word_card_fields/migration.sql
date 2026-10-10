-- AlterTable
ALTER TABLE "words" ADD COLUMN     "collocations" JSONB,
ADD COLUMN     "examples" JSONB,
ADD COLUMN     "part_of_speech" TEXT,
ADD COLUMN     "substitutions" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "upgrade_examples" JSONB,
ADD COLUMN     "upgrades" JSONB,
ADD COLUMN     "writing_position" TEXT;
