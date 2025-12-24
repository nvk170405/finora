-- Add new columns for Razorpay Subscriptions support
-- Run this migration to enable auto-recurring subscriptions

ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS is_auto_renew BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Add index for querying by subscription ID
CREATE INDEX IF NOT EXISTS idx_subscriptions_razorpay_subscription_id 
ON subscriptions(razorpay_subscription_id);

-- Add subscription_id column to payment_logs for tracking
ALTER TABLE payment_logs 
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Comment for reference
COMMENT ON COLUMN subscriptions.razorpay_subscription_id IS 'Razorpay subscription ID for auto-recurring billing';
COMMENT ON COLUMN subscriptions.is_auto_renew IS 'Whether the subscription will auto-renew';
