-- =====================================================
-- NET WORTH TRACKER: ASSETS AND LIABILITIES TABLES
-- =====================================================

-- Assets Table (What You Own)
CREATE TABLE IF NOT EXISTS user_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'cash',           -- Savings, checking accounts
        'investments',    -- Stocks, bonds, mutual funds, crypto
        'retirement',     -- 401k, IRA, pension
        'real_estate',    -- Home, property
        'vehicles',       -- Cars, bikes
        'valuables',      -- Jewelry, art, collections
        'business',       -- Business ownership
        'other_asset'     -- Anything else
    )),
    current_value DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    purchase_value DECIMAL(15,2),
    purchase_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Liabilities Table (What You Owe)
CREATE TABLE IF NOT EXISTS user_liabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'mortgage',       -- Home loan
        'car_loan',       -- Vehicle loan
        'student_loan',   -- Education loan
        'personal_loan',  -- Personal loans
        'credit_card',    -- Credit card debt
        'taxes',          -- Taxes owed
        'medical',        -- Medical bills
        'other_debt'      -- Any other debt
    )),
    total_amount DECIMAL(15,2) NOT NULL,
    remaining_amount DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,2),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    monthly_payment DECIMAL(15,2),
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_liabilities ENABLE ROW LEVEL SECURITY;

-- Assets Policies
CREATE POLICY "Users can view own assets" ON user_assets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assets" ON user_assets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assets" ON user_assets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets" ON user_assets
    FOR DELETE USING (auth.uid() = user_id);

-- Liabilities Policies
CREATE POLICY "Users can view own liabilities" ON user_liabilities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own liabilities" ON user_liabilities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own liabilities" ON user_liabilities
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own liabilities" ON user_liabilities
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_assets_user ON user_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_liabilities_user ON user_liabilities(user_id);
