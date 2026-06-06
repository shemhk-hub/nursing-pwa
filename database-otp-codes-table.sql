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
