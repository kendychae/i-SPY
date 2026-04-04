-- Migration: 005_client_id.sql
-- Issue #48: Offline Sync Strategy & Conflict Resolution Design
-- Author: Figuelia Ya'Sin
-- Date: 2026-04-04
--
-- Adds client_id column to reports table for idempotency and conflict resolution.
-- This enables the offline queue to prevent duplicate submissions when syncing.

-- Add client_id column with UNIQUE constraint for idempotency
ALTER TABLE reports
ADD COLUMN IF NOT EXISTS client_id UUID UNIQUE;

-- Create index for fast lookups by client_id
CREATE INDEX IF NOT EXISTS idx_reports_client_id ON reports(client_id);