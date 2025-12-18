-- Add DELETE and UPDATE policies for transactions table
-- Run this in Supabase SQL Editor

-- Allow users to delete their own transactions
CREATE POLICY "Users can delete own transactions" ON transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Allow users to update their own transactions
CREATE POLICY "Users can update own transactions" ON transactions
    FOR UPDATE USING (auth.uid() = user_id);
