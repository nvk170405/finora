-- FinoraX Database Setup Script
-- Run this in Supabase Dashboard > SQL Editor

-- =====================================================
-- 1. FIX SUBSCRIPTIONS TABLE (Required for auth to work)
-- =====================================================

-- Drop existing foreign key constraint
ALTER TABLE subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;

-- Add new foreign key referencing auth.users
ALTER TABLE subscriptions 
ADD CONSTRAINT subscriptions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable RLS on subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can manage own subscription" ON subscriptions;

-- Create policy for subscriptions
CREATE POLICY "Users can manage own subscription" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 2. CREATE WALLETS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  currency VARCHAR(3) NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0.00,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, currency)
);

-- Enable RLS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own wallets" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallets" ON wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wallets" ON wallets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wallets" ON wallets
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 3. CREATE TRANSACTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'transfer_in', 'transfer_out', 'exchange')),
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  fee DECIMAL(15,2) DEFAULT 0.00,
  recipient_name VARCHAR(255),
  recipient_location VARCHAR(255),
  description TEXT,
  category VARCHAR(50) CHECK (category IN ('business', 'income', 'travel', 'shopping', 'food', 'entertainment', 'utilities', 'other')),
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  reference_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 4. CREATE EXCHANGE RATES TABLE (Cached rates)
-- =====================================================

CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency VARCHAR(3) NOT NULL,
  target_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(15,6) NOT NULL,
  high_24h DECIMAL(15,6),
  low_24h DECIMAL(15,6),
  change_24h DECIMAL(10,4),
  change_percent_24h DECIMAL(10,4),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(base_currency, target_currency)
);

-- Public read access for exchange rates (no RLS needed - public data)
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exchange rates" ON exchange_rates
  FOR SELECT USING (true);

-- Service role can update rates (for Edge Functions)
CREATE POLICY "Service role can update rates" ON exchange_rates
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_pair ON exchange_rates(base_currency, target_currency);

-- =====================================================
-- 6. INSERT DEFAULT EXCHANGE RATES (Initial seed data)
-- =====================================================

INSERT INTO exchange_rates (base_currency, target_currency, rate, high_24h, low_24h, change_24h, change_percent_24h)
VALUES 
  ('EUR', 'USD', 1.0892, 1.0895, 1.0871, 0.0023, 0.21),
  ('GBP', 'USD', 1.2634, 1.2651, 1.2618, -0.0018, -0.14),
  ('USD', 'JPY', 149.82, 149.95, 149.21, 0.45, 0.30),
  ('EUR', 'GBP', 0.8621, 0.8628, 0.8615, 0.0008, 0.09),
  ('USD', 'EUR', 0.9181, 0.9200, 0.9165, -0.0019, -0.21),
  ('USD', 'GBP', 0.7916, 0.7930, 0.7898, 0.0011, 0.14)
ON CONFLICT (base_currency, target_currency) DO UPDATE SET
  rate = EXCLUDED.rate,
  high_24h = EXCLUDED.high_24h,
  low_24h = EXCLUDED.low_24h,
  change_24h = EXCLUDED.change_24h,
  change_percent_24h = EXCLUDED.change_percent_24h,
  updated_at = NOW();

-- =====================================================
-- DONE! Your database is now ready.
-- =====================================================
