-- Savings Goals table for tracking user savings objectives
CREATE TABLE IF NOT EXISTS savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    deadline DATE,
    icon TEXT DEFAULT '🎯',
    color TEXT DEFAULT '#CAFF40',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    auto_contribute BOOLEAN DEFAULT false,
    auto_contribute_amount DECIMAL(15,2),
    auto_contribute_frequency TEXT CHECK (auto_contribute_frequency IN ('daily', 'weekly', 'monthly')),
    source_wallet_id UUID REFERENCES wallets(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

-- Users can only see their own goals
CREATE POLICY "Users can view own savings goals"
ON savings_goals FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own goals
CREATE POLICY "Users can create own savings goals"
ON savings_goals FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own goals
CREATE POLICY "Users can update own savings goals"
ON savings_goals FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own goals
CREATE POLICY "Users can delete own savings goals"
ON savings_goals FOR DELETE
USING (auth.uid() = user_id);

-- Savings goal contributions tracking
CREATE TABLE IF NOT EXISTS savings_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL REFERENCES wallets(id),
    amount DECIMAL(15,2) NOT NULL,
    currency TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for contributions
ALTER TABLE savings_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contributions"
ON savings_contributions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own contributions"
ON savings_contributions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_status ON savings_goals(status);
CREATE INDEX IF NOT EXISTS idx_savings_contributions_goal_id ON savings_contributions(goal_id);
