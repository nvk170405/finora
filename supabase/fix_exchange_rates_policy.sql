-- Exchange Rates Update Policy Fix
-- Run this in Supabase Dashboard > SQL Editor

-- The current policy only allows service_role to update exchange rates
-- We need to allow authenticated users to also update/insert exchange rates
-- (In production, you'd use Edge Functions with service_role, but for development...)

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Service role can update rates" ON exchange_rates;

-- Allow authenticated users to insert exchange rates
CREATE POLICY "Authenticated users can insert rates" ON exchange_rates
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update exchange rates
CREATE POLICY "Authenticated users can update rates" ON exchange_rates
  FOR UPDATE TO authenticated
  USING (true);

-- Keep public read access
-- (Already exists: "Anyone can view exchange rates")

-- Verify: Run this to check policies
-- SELECT * FROM pg_policies WHERE tablename = 'exchange_rates';
