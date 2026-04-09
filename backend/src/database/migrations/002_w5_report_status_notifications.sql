-- W5 Migration: Report Status History, Notification Preferences, FCM Tokens
-- Issue #52, #53
-- Add bio and profile_image_url to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS bio TEXT,
    ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
-- Report status history table (issue #53)
CREATE TABLE IF NOT EXISTS report_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE
    SET NULL,
        notes TEXT,
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_rsh_report_id ON report_status_history(report_id);
CREATE INDEX IF NOT EXISTS idx_rsh_changed_at ON report_status_history(changed_at);
-- Notification preferences table (issue #52)
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    push_enabled BOOLEAN DEFAULT TRUE,
    status_changes BOOLEAN DEFAULT TRUE,
    nearby_incidents BOOLEAN DEFAULT FALSE,
    weekly_digest BOOLEAN DEFAULT FALSE,
    location_sharing_public BOOLEAN DEFAULT FALSE,
    account_visible_to_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at BEFORE
UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- FCM device tokens table (issue #52)
CREATE TABLE IF NOT EXISTS fcm_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform VARCHAR(20) CHECK (platform IN ('ios', 'android', 'web')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, token)
);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_user_id ON fcm_tokens(user_id);
DROP TRIGGER IF EXISTS update_fcm_tokens_updated_at ON fcm_tokens;
CREATE TRIGGER update_fcm_tokens_updated_at BEFORE
UPDATE ON fcm_tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Notifications table is already in base schema, just verify indexes exist
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);