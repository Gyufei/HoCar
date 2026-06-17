-- Add detailed bill snapshot fields for each side.
ALTER TABLE "bills"
ADD COLUMN "self_previous_reading" DECIMAL(10,2),
ADD COLUMN "self_current_reading" DECIMAL(10,2),
ADD COLUMN "self_usage" DECIMAL(10,2),
ADD COLUMN "self_amount" DECIMAL(10,2),
ADD COLUMN "peer_previous_reading" DECIMAL(10,2),
ADD COLUMN "peer_current_reading" DECIMAL(10,2),
ADD COLUMN "peer_usage" DECIMAL(10,2),
ADD COLUMN "peer_amount" DECIMAL(10,2);

-- Upsert by user, bill type, and billing period.
CREATE UNIQUE INDEX "uniq_bills_user_year_month_type"
ON "bills"("user_id", "year", "month", "type");
