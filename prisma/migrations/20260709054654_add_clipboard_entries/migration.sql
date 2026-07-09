-- CreateTable
CREATE TABLE "clipboard_entries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clipboard_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clipboard_entries_user_id_key_key" ON "clipboard_entries"("user_id", "key");

-- RenameIndex
ALTER INDEX "uniq_bills_user_year_month_type" RENAME TO "bills_user_id_year_month_type_key";
