-- Create table for transaction mood tags
CREATE TABLE IF NOT EXISTS transaction_moods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mood TEXT NOT NULL CHECK (mood IN ('happy', 'necessary', 'regret', 'neutral', 'excited', 'guilty')),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(transaction_id)
);

-- Create table for weekly challenges
CREATE TABLE IF NOT EXISTS weekly_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    challenge_type TEXT NOT NULL,
    target_value DECIMAL(12, 2),
    target_percentage INT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for user challenge participation
CREATE TABLE IF NOT EXISTS user_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES weekly_challenges(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_progress DECIMAL(12, 2) DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, challenge_id)
);

-- Enable RLS
ALTER TABLE transaction_moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;

-- Policies for transaction_moods
CREATE POLICY "Users can view their own moods"
    ON transaction_moods FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own moods"
    ON transaction_moods FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own moods"
    ON transaction_moods FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own moods"
    ON transaction_moods FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for weekly_challenges (everyone can view)
CREATE POLICY "Anyone can view active challenges"
    ON weekly_challenges FOR SELECT
    USING (is_active = true);

-- Policies for user_challenges
CREATE POLICY "Users can view their own challenge progress"
    ON user_challenges FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can join challenges"
    ON user_challenges FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
    ON user_challenges FOR UPDATE
    USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_transaction_moods_user ON transaction_moods(user_id);
CREATE INDEX idx_transaction_moods_mood ON transaction_moods(mood);
CREATE INDEX idx_user_challenges_user ON user_challenges(user_id);
CREATE INDEX idx_weekly_challenges_active ON weekly_challenges(is_active);

-- Insert some sample challenges
INSERT INTO weekly_challenges (title, description, challenge_type, target_percentage, start_date, end_date) VALUES
('Frugal Friday', 'Reduce your spending by 20% this week', 'reduce_spending', 20, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days'),
('No Dining Out', 'Avoid restaurant expenses for 7 days', 'avoid_category', NULL, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days'),
('Savings Sprint', 'Deposit at least 10% of your income', 'savings_goal', 10, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days');
