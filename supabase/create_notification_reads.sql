-- Create table to store user notification read state
CREATE TABLE IF NOT EXISTS notification_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_id TEXT NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, notification_id)
);

-- Enable RLS
ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own read notifications
CREATE POLICY "Users can view their own reads"
    ON notification_reads FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reads"
    ON notification_reads FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reads"
    ON notification_reads FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_notification_reads_user ON notification_reads(user_id);

-- Special entry to mark "all read" timestamp
-- When user clicks "mark all as read", we store a timestamp
-- Any notification before this timestamp is considered read
CREATE TABLE IF NOT EXISTS notification_read_timestamps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    marked_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notification_read_timestamps ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own timestamps
CREATE POLICY "Users can view their own timestamp"
    ON notification_read_timestamps FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own timestamp"
    ON notification_read_timestamps FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own timestamp"
    ON notification_read_timestamps FOR UPDATE
    USING (auth.uid() = user_id);
