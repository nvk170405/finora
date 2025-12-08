-- Virtual Cards table for secure online payments
CREATE TABLE IF NOT EXISTS virtual_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    card_number TEXT NOT NULL,
    card_last_four TEXT NOT NULL,
    expiry_month INT NOT NULL,
    expiry_year INT NOT NULL,
    cvv TEXT NOT NULL,
    card_name TEXT NOT NULL,
    card_type TEXT DEFAULT 'visa',
    spending_limit DECIMAL(15,2),
    amount_spent DECIMAL(15,2) DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'locked', 'expired', 'deleted')),
    single_use BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE virtual_cards ENABLE ROW LEVEL SECURITY;

-- Users can only see their own cards
CREATE POLICY "Users can view own virtual cards"
ON virtual_cards FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own cards
CREATE POLICY "Users can create own virtual cards"
ON virtual_cards FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own cards
CREATE POLICY "Users can update own virtual cards"
ON virtual_cards FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own cards
CREATE POLICY "Users can delete own virtual cards"
ON virtual_cards FOR DELETE
USING (auth.uid() = user_id);

-- Virtual card transactions
CREATE TABLE IF NOT EXISTS virtual_card_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES virtual_cards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    currency TEXT NOT NULL,
    merchant_name TEXT,
    description TEXT,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE virtual_card_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own card transactions"
ON virtual_card_transactions FOR SELECT
USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_virtual_cards_user_id ON virtual_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_virtual_cards_status ON virtual_cards(status);
CREATE INDEX IF NOT EXISTS idx_virtual_card_transactions_card_id ON virtual_card_transactions(card_id);
