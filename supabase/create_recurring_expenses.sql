-- =====================================================
-- RECURRING EXPENSES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS recurring_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    category VARCHAR(50) NOT NULL DEFAULT 'other',
    frequency VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
    due_day INTEGER,
    next_due_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    auto_log BOOLEAN DEFAULT false,
    reminder_days INTEGER DEFAULT 3,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own recurring expenses" ON recurring_expenses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recurring expenses" ON recurring_expenses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recurring expenses" ON recurring_expenses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recurring expenses" ON recurring_expenses
    FOR DELETE USING (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_user ON recurring_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_next_due ON recurring_expenses(next_due_date);
