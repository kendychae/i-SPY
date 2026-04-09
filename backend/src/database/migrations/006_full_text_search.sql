-- Migration: 006_full_text_search.sql
-- Issue #60: Advanced Search API — PostgreSQL Full-Text & Multi-Filter
-- Author: Samuel Iyen Evbosaru
-- Date: 2026-04-09
--
-- Adds tsvector search_vector column to reports table with a GIN index
-- and a trigger to keep it current on INSERT/UPDATE.
-- Add tsvector column for full-text search
ALTER TABLE reports
ADD COLUMN IF NOT EXISTS search_vector tsvector;
-- Populate existing rows
UPDATE reports
SET search_vector = to_tsvector(
        'english',
        coalesce(title, '') || ' ' || coalesce(description, '')
    )
WHERE search_vector IS NULL;
-- Create GIN index for fast full-text queries
CREATE INDEX IF NOT EXISTS idx_reports_search_vector ON reports USING GIN (search_vector);
-- Create trigger function to keep search_vector current
CREATE OR REPLACE FUNCTION reports_search_vector_update() RETURNS trigger AS $$ BEGIN NEW.search_vector := to_tsvector(
        'english',
        coalesce(NEW.title, '') || ' ' || coalesce(NEW.description, '')
    );
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Attach trigger (drop first to allow re-running)
DROP TRIGGER IF EXISTS tsvectorupdate ON reports;
CREATE TRIGGER tsvectorupdate BEFORE
INSERT
    OR
UPDATE OF title,
    description ON reports FOR EACH ROW EXECUTE FUNCTION reports_search_vector_update();