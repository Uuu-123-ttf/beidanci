-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "words" (
    "id" TEXT NOT NULL,
    "spelling" TEXT NOT NULL,
    "phonetic" TEXT,
    "meaning" TEXT NOT NULL,
    "example" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "words_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "word_books" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "word_books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "word_book_words" (
    "word_book_id" TEXT NOT NULL,
    "word_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "word_book_words_pkey" PRIMARY KEY ("word_book_id","word_id")
);

-- CreateTable
CREATE TABLE "user_words" (
    "user_id" TEXT NOT NULL,
    "word_id" TEXT NOT NULL,
    "proficiency" INTEGER NOT NULL DEFAULT 0,
    "easiness_factor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "interval" INTEGER NOT NULL DEFAULT 0,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "next_review_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_words_pkey" PRIMARY KEY ("user_id","word_id")
);

-- CreateTable
CREATE TABLE "review_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "word_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "reviewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "check_ins" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "words_spelling_key" ON "words"("spelling");

-- CreateIndex
CREATE INDEX "word_books_owner_id_idx" ON "word_books"("owner_id");

-- CreateIndex
CREATE INDEX "word_book_words_word_id_idx" ON "word_book_words"("word_id");

-- CreateIndex
CREATE INDEX "user_words_user_id_next_review_at_idx" ON "user_words"("user_id", "next_review_at");

-- CreateIndex
CREATE INDEX "user_words_word_id_idx" ON "user_words"("word_id");

-- CreateIndex
CREATE INDEX "review_logs_user_id_reviewed_at_idx" ON "review_logs"("user_id", "reviewed_at");

-- CreateIndex
CREATE UNIQUE INDEX "check_ins_user_id_date_key" ON "check_ins"("user_id", "date");

-- AddForeignKey
ALTER TABLE "word_books" ADD CONSTRAINT "word_books_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "word_book_words" ADD CONSTRAINT "word_book_words_word_book_id_fkey" FOREIGN KEY ("word_book_id") REFERENCES "word_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "word_book_words" ADD CONSTRAINT "word_book_words_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "words"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_words" ADD CONSTRAINT "user_words_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_words" ADD CONSTRAINT "user_words_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "words"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_logs" ADD CONSTRAINT "review_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_logs" ADD CONSTRAINT "review_logs_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "words"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
