-- Payment logs table for tracking Razorpay webhook events
CREATE TABLE IF NOT EXISTS payment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    payment_id TEXT,
    order_id TEXT,
    amount DECIMAL(15,2),
    currency TEXT DEFAULT 'INR',
    status TEXT,
    error_code TEXT,
    error_description TEXT,
    raw_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_payment_logs_payment_id ON payment_logs(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_created_at ON payment_logs(created_at);

-- Enable RLS
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

-- Admin-only access (service role can insert/read)
CREATE POLICY "Service role can insert payment logs"
ON payment_logs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can view payment logs"
ON payment_logs FOR SELECT
USING (true);
