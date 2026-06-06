-- COMPLETE NURSING PWA DATABASE SCHEMA
-- Deploy this file in Supabase SQL Editor
-- Date: 2026-06-06

-- Nursing PWA Database Schema
-- PostgreSQL with Supabase
-- Created: 2026-06-06

-- ============================================
-- CORE TABLES
-- ============================================

-- Users table (extends Supabase auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'admin')),
  avatar_url TEXT,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium', 'trial')),
  otp_secret TEXT, -- For TOTP 2FA (optional for admins)
  otp_phone_verified BOOLEAN DEFAULT FALSE,
  otp_email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_subscription ON users(subscription_status);

-- ============================================
-- CURRICULUM STRUCTURE (INC BSc Nursing)
-- ============================================

-- Years table (1-4)
CREATE TABLE IF NOT EXISTS years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INTEGER NOT NULL CHECK (number >= 1 AND number <= 4),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(number)
);

-- Semesters table (1-8, 2 per year)
CREATE TABLE IF NOT EXISTS semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year_id UUID NOT NULL REFERENCES years(id) ON DELETE CASCADE,
  number INTEGER NOT NULL CHECK (number >= 1 AND number <= 8),
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(year_id, number)
);

CREATE INDEX idx_semesters_year ON semesters(year_id);

-- Subjects table (5-6 per semester)
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  credits DECIMAL(3,1),
  instructor_name TEXT,
  instructor_email TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subjects_semester ON subjects(semester_id);
CREATE INDEX idx_subjects_code ON subjects(code);
CREATE INDEX idx_subjects_status ON subjects(status);

-- Units table (4-5 per subject)
CREATE TABLE IF NOT EXISTS units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(subject_id, number)
);

CREATE INDEX idx_units_subject ON units(subject_id);
CREATE INDEX idx_units_status ON units(status);

-- Topics table (multiple per unit)
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT, -- Rich HTML content
  pdf_url TEXT,
  video_url TEXT,
  duration_minutes INTEGER,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_topics_unit ON topics(unit_id);
CREATE INDEX idx_topics_status ON topics(status);

-- ============================================
-- STUDENT FEATURES
-- ============================================

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'premium', 'trial')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP WITH TIME ZONE,
  price DECIMAL(10, 2),
  currency TEXT DEFAULT 'INR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, topic_id)
);

CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_topic ON bookmarks(topic_id);

-- Downloads table
CREATE TABLE IF NOT EXISTS downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  download_size_mb DECIMAL(10, 2),
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_downloads_user ON downloads(user_id);
CREATE INDEX idx_downloads_topic ON downloads(topic_id);
CREATE INDEX idx_downloads_date ON downloads(downloaded_at);

-- Ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, topic_id)
);

CREATE INDEX idx_ratings_user ON ratings(user_id);
CREATE INDEX idx_ratings_topic ON ratings(topic_id);

-- User Progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, topic_id)
);

CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_topic ON user_progress(topic_id);

-- ============================================
-- ADMIN & OPERATIONAL FEATURES
-- ============================================

-- Activity Log table
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_log_user ON activity_log(user_id);
CREATE INDEX idx_activity_log_action ON activity_log(action);
CREATE INDEX idx_activity_log_date ON activity_log(created_at);

-- Backups table
CREATE TABLE IF NOT EXISTS backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type TEXT NOT NULL CHECK (backup_type IN ('manual', 'automatic')),
  backup_url TEXT NOT NULL,
  backup_size_mb DECIMAL(10, 2),
  status TEXT DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

CREATE INDEX idx_backups_created ON backups(created_at);
CREATE INDEX idx_backups_status ON backups(status);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  notification_type TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own user record
CREATE POLICY users_own_record ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can only see their own subscriptions
CREATE POLICY subscriptions_own_data ON subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only see their own bookmarks
CREATE POLICY bookmarks_own_data ON bookmarks
  FOR ALL
  USING (auth.uid() = user_id);

-- Users can only see their own downloads
CREATE POLICY downloads_own_data ON downloads
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only see their own ratings
CREATE POLICY ratings_own_data ON ratings
  FOR ALL
  USING (auth.uid() = user_id);

-- Users can only see their own progress
CREATE POLICY user_progress_own_data ON user_progress
  FOR ALL
  USING (auth.uid() = user_id);

-- Users can only see their own notifications
CREATE POLICY notifications_own_data ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow admins to see activity logs
CREATE POLICY activity_log_admin_read ON activity_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- SEED DATA (INC CURRICULUM)
-- ============================================

-- Years
INSERT INTO years (number, title, description) VALUES
  (1, 'Year 1', 'First Year BSc Nursing'),
  (2, 'Year 2', 'Second Year BSc Nursing'),
  (3, 'Year 3', 'Third Year BSc Nursing'),
  (4, 'Year 4', 'Fourth Year BSc Nursing')
ON CONFLICT DO NOTHING;

-- Get year IDs for inserting semesters
-- (This will be done via application code for simplicity)

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp trigger to relevant tables
CREATE TRIGGER users_update_timestamp BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER subjects_update_timestamp BEFORE UPDATE ON subjects
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER units_update_timestamp BEFORE UPDATE ON units
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER topics_update_timestamp BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER subscriptions_update_timestamp BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER ratings_update_timestamp BEFORE UPDATE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER user_progress_update_timestamp BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================
-- SEARCH INDEXES
-- ============================================

-- Full-text search on subjects and units
CREATE INDEX idx_subjects_search ON subjects USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_units_search ON units USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_topics_search ON topics USING gin(to_tsvector('english', title || ' ' || COALESCE(content, '')));

-- ============================================
-- SCHEMA DOCUMENTATION
-- ============================================

-- Table comments
COMMENT ON TABLE users IS 'Core user table - students and admins';
COMMENT ON TABLE years IS 'Academic years (1-4)';
COMMENT ON TABLE semesters IS 'Semesters (1-8, 2 per year)';
COMMENT ON TABLE subjects IS 'Course subjects (5-6 per semester)';
COMMENT ON TABLE units IS 'Subject units (4-5 per subject)';
COMMENT ON TABLE topics IS 'Unit topics with content';
COMMENT ON TABLE subscriptions IS 'User subscription management';
COMMENT ON TABLE bookmarks IS 'User bookmarked topics';
COMMENT ON TABLE downloads IS 'Topic downloads by users';
COMMENT ON TABLE ratings IS 'User ratings and reviews';
COMMENT ON TABLE user_progress IS 'Topic progress tracking';
COMMENT ON TABLE activity_log IS 'Audit trail and activity logging';
COMMENT ON TABLE backups IS 'Database backup records';
COMMENT ON TABLE notifications IS 'User notifications';


-- OTP Codes Table
-- Temporary storage for OTP verification during auth flow
-- Automatically cleaned up after expiry

CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE,
  email TEXT,
  phone TEXT,
  code TEXT NOT NULL,
  user_role TEXT NOT NULL CHECK (user_role IN ('student', 'admin')),
  attempts INTEGER DEFAULT 0 CHECK (attempts >= 0 AND attempts <= 5),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Ensure either email or phone is provided
  CONSTRAINT otp_has_contact CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- Indexes for performance
CREATE INDEX idx_otp_codes_session ON otp_codes(session_id);
CREATE INDEX idx_otp_codes_email ON otp_codes(email) WHERE email IS NOT NULL;
CREATE INDEX idx_otp_codes_phone ON otp_codes(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_otp_codes_expires ON otp_codes(expires_at);

-- Automatically delete expired OTP codes
-- Note: In production, use a scheduled job or trigger
-- This is a simple index-based approach for cleanup queries
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_codes
  WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- You can call this manually or via a scheduled Supabase function:
-- SELECT cleanup_expired_otps();

-- Alternative: Automatic cleanup via a trigger
CREATE OR REPLACE FUNCTION auto_cleanup_otps()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM otp_codes
  WHERE expires_at < CURRENT_TIMESTAMP AND created_at < CURRENT_TIMESTAMP - INTERVAL '1 hour';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- This trigger runs on every OTP insert to clean up old codes
CREATE TRIGGER trigger_cleanup_expired_otps
  AFTER INSERT ON otp_codes
  FOR EACH ROW
  EXECUTE FUNCTION auto_cleanup_otps();

-- Allow anyone to insert OTP codes (unauthenticated during signup)
ALTER TABLE otp_codes DISABLE ROW LEVEL SECURITY;

-- Or create a policy that allows public access during auth flow
-- ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "allow_public_otp_creation" ON otp_codes
--   FOR INSERT
--   WITH CHECK (true);
--
-- CREATE POLICY "allow_otp_verification" ON otp_codes
--   FOR SELECT
--   USING (true);


-- ============================================
-- DEPLOYMENT VERIFICATION
-- ============================================
-- After running this script, you should have 14 tables:

SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
