-- Add Razorpay payment columns to subscriptions table
-- Run this in your Supabase SQL Editor

-- Add new columns for Razorpay integration
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_status ON subscriptions(payment_status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_razorpay_order ON subscriptions(razorpay_order_id);

-- Add comment for documentation
COMMENT ON COLUMN subscriptions.razorpay_payment_id IS 'Razorpay payment ID after successful payment';
COMMENT ON COLUMN subscriptions.razorpay_order_id IS 'Razorpay order ID created before payment';
COMMENT ON COLUMN subscriptions.payment_status IS 'Payment status: pending, completed, failed';
COMMENT ON COLUMN subscriptions.start_date IS 'Subscription start date';
COMMENT ON COLUMN subscriptions.end_date IS 'Subscription end date';
