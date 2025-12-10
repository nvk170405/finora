-- Recurring Deposits Table
-- Stores scheduled automatic deposits configuration

CREATE TABLE IF NOT EXISTS recurring_deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- For weekly: 0=Sunday, 6=Saturday
    day_of_month INTEGER CHECK (day_of_month >= 1 AND day_of_month <= 31), -- For monthly
    next_execution_date TIMESTAMPTZ NOT NULL,
    last_executed_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_recurring_deposits_user_id ON recurring_deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_deposits_next_execution ON recurring_deposits(next_execution_date) WHERE is_active = TRUE;

-- Enable RLS
ALTER TABLE recurring_deposits ENABLE ROW LEVEL SECURITY;

-- Users can only see their own recurring deposits
CREATE POLICY "Users can view own recurring deposits"
ON recurring_deposits FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own recurring deposits
CREATE POLICY "Users can create own recurring deposits"
ON recurring_deposits FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own recurring deposits
CREATE POLICY "Users can update own recurring deposits"
ON recurring_deposits FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own recurring deposits
CREATE POLICY "Users can delete own recurring deposits"
ON recurring_deposits FOR DELETE
USING (auth.uid() = user_id);
