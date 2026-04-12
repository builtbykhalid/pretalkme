-- Add delay and path targeting to announcements
ALTER TABLE in_app_announcements
ADD COLUMN delay_seconds integer DEFAULT 0,
ADD COLUMN target_path text;

-- Create analytics table for announcements
CREATE TABLE IF NOT EXISTS announcement_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    announcement_id uuid REFERENCES in_app_announcements(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type text CHECK (event_type IN ('view', 'click', 'dismiss')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for announcement events
ALTER TABLE announcement_events ENABLE ROW LEVEL SECURITY;

-- Admins can read all events
CREATE POLICY "Admins can view all announcement events"
    ON announcement_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Users can insert their own events
CREATE POLICY "Users can insert their own events"
    ON announcement_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admins can delete events (cleanup)
CREATE POLICY "Admins can delete events"
    ON announcement_events FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );
