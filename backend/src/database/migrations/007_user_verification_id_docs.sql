-- Migration: 004_user_verification_id_docs.sql
-- Adds ID document metadata and admin verification workflow fields

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS id_document_url TEXT,
  ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS verification_notes TEXT,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_verification_status_check'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_verification_status_check
      CHECK (verification_status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

UPDATE users
SET verification_status = CASE WHEN is_verified THEN 'approved' ELSE 'pending' END
WHERE verification_status IS NULL
   OR verification_status NOT IN ('pending', 'approved', 'rejected');

CREATE INDEX IF NOT EXISTS idx_users_verification_status ON users (verification_status);
