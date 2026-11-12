-- =========================================================
-- MIRAX MEDIA — Neon PostgreSQL Database Schema
-- Database: mirax_media
-- Table: contacts
-- =========================================================

-- 1. Enable UUID Extension (standard in PostgreSQL / Neon)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Custom Enum Type for Enquiry Status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contact_status') THEN
    CREATE TYPE contact_status AS ENUM (
      'NEW',
      'CONTACTED',
      'IN_PROGRESS',
      'COMPLETED',
      'REJECTED'
    );
  END IF;
END$$;

-- 3. Create Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  company_name VARCHAR(150),
  service VARCHAR(100) NOT NULL,
  budget VARCHAR(100),
  message TEXT NOT NULL,
  status contact_status NOT NULL DEFAULT 'NEW',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts (email);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts (status);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts (created_at DESC);

-- 5. Automatic updated_at Trigger Function
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Attach Trigger to contacts table
DROP TRIGGER IF EXISTS trigger_contacts_updated_at ON contacts;
CREATE TRIGGER trigger_contacts_updated_at
BEFORE UPDATE ON contacts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();
