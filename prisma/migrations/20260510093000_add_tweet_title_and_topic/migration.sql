-- AlterTable
ALTER TABLE "Post" ADD COLUMN "title" TEXT NOT NULL DEFAULT 'Untitled tweet';
ALTER TABLE "Post" ADD COLUMN "topic" TEXT NOT NULL DEFAULT 'General';
