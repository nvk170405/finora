-- Add trial_end_date column to subscriptions table
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMPTZ;

-- Add comment
COMMENT ON COLUMN subscriptions.trial_end_date IS 'End date for 7-day free trial period';

-- Update existing trial detection
-- Users with 'trial' plan should have their trial_end_date set
