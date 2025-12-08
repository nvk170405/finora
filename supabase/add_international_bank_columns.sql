-- Migration to add international bank support columns to withdrawal_requests table
-- Run this in Supabase SQL Editor after the initial create_withdrawal_requests.sql

-- Add new columns for international bank support
ALTER TABLE withdrawal_requests 
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'IN',
ADD COLUMN IF NOT EXISTS bank_code TEXT,
ADD COLUMN IF NOT EXISTS bank_code_type TEXT DEFAULT 'IFSC',
ADD COLUMN IF NOT EXISTS swift_code TEXT;

-- Copy existing ifsc_code values to bank_code for backward compatibility
UPDATE withdrawal_requests 
SET bank_code = ifsc_code 
WHERE bank_code IS NULL AND ifsc_code IS NOT NULL;

-- Add comment to explain columns
COMMENT ON COLUMN withdrawal_requests.country IS 'Country code: IN, US, GB, EU, OTHER';
COMMENT ON COLUMN withdrawal_requests.bank_code IS 'Bank routing code: IFSC, ABA Routing, Sort Code, IBAN, or SWIFT';
COMMENT ON COLUMN withdrawal_requests.bank_code_type IS 'Type of bank code: IFSC, ROUTING, SORT, IBAN, SWIFT';
COMMENT ON COLUMN withdrawal_requests.swift_code IS 'SWIFT/BIC code for international transfers';
