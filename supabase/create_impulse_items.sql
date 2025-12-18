-- Create table for impulse purchase wishlist
CREATE TABLE IF NOT EXISTS impulse_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    category TEXT,
    notes TEXT,
    image_url TEXT,
    timer_hours INT DEFAULT 24,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unlock_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'approved', 'rejected')),
    decision_reason TEXT
);

-- Enable RLS
ALTER TABLE impulse_items ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own items
CREATE POLICY "Users can view their own items"
    ON impulse_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own items"
    ON impulse_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items"
    ON impulse_items FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items"
    ON impulse_items FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_impulse_items_user ON impulse_items(user_id);
CREATE INDEX idx_impulse_items_status ON impulse_items(status);
