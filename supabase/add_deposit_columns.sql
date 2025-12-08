-- Add Razorpay columns to transactions table for deposit tracking
-- Run this in your Supabase SQL Editor

ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_transactions_razorpay_payment ON transactions(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_razorpay_order ON transactions(razorpay_order_id);

-- Add comments for documentation
COMMENT ON COLUMN transactions.razorpay_payment_id IS 'Razorpay payment ID for deposit transactions';
COMMENT ON COLUMN transactions.razorpay_order_id IS 'Razorpay order ID for deposit transactions';
