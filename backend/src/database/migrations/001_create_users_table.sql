-- Migration: 001_create_users_table.sql
-- Issue #11: Design and Implement Users Table
-- Author: Figuelia Ya'Sin
-- Date: 2026-03-25
--
-- Creates the users table with proper constraints, indexes,
-- and an auto-updating updated_at trigger.
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    user_type VARCHAR(20) NOT NULL DEFAULT 'citizen' CHECK (user_type IN ('citizen', 'officer', 'admin')),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users (user_type);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users (is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at DESC);
-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_users_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_users_updated_at();
-- Seed a default admin account (password: change-me-in-production)
-- Password hash below is bcrypt for the string 'AdminPass1!'
-- IMPORTANT: Change this password immediately after first deployment.
INSERT INTO users (
        email,
        password_hash,
        first_name,
        last_name,
        user_type,
        is_verified
    )
VALUES (
        'admin@vigilux.local',
        '$2b$12$placeholderHashChangeBeforeDeployment000000000000000000000',
        'VIGILUX',
        'Admin',
        'admin',
        TRUE
    ) ON CONFLICT (email) DO NOTHING;