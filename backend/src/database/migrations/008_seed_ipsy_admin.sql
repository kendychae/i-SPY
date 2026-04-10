-- Migration: 005_seed_ipsy_admin.sql
-- Ensure Admin@ipsy.app exists with admin privileges and verification approval.

WITH existing AS (
  SELECT id
  FROM users
  WHERE LOWER(email) = 'admin@ipsy.app'
  ORDER BY created_at ASC
  LIMIT 1
)
UPDATE users
SET
  email = 'admin@ipsy.app',
  user_type = 'admin',
  is_active = TRUE,
  is_verified = TRUE,
  verification_status = 'approved',
  verification_notes = 'Auto-approved admin account seed',
  verified_at = COALESCE(verified_at, CURRENT_TIMESTAMP),
  updated_at = CURRENT_TIMESTAMP
WHERE id IN (SELECT id FROM existing);

INSERT INTO users (
  email,
  password_hash,
  first_name,
  last_name,
  user_type,
  is_verified,
  is_active,
  verification_status,
  verification_notes,
  verified_at
)
SELECT
  'admin@ipsy.app',
  '$2b$12$placeholderHashChangeBeforeDeployment000000000000000000000',
  'System',
  'Administrator',
  'admin',
  TRUE,
  TRUE,
  'approved',
  'Auto-approved admin account seed',
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1
  FROM users
  WHERE LOWER(email) = 'admin@ipsy.app'
);
