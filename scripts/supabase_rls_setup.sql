-- ============================================
-- SUPABASE ROW LEVEL SECURITY (RLS) SETUP
-- ============================================
-- Run this script in Supabase SQL Editor
-- Dashboard → SQL Editor → New Query

-- Step 1: Enable RLS on all tables
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Step 2: Create RLS Policies
-- ============================================

-- IMPORTANT: Since you're using Node.js backend with service role,
-- these policies apply to direct database access only.
-- Your backend will bypass RLS using the service role key.

-- Users table policies
-- Allow service role full access (your backend)
CREATE POLICY "Allow service role full access to users"
ON users FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Prevent public access
CREATE POLICY "Prevent public access to users"
ON users FOR ALL
TO anon
USING (false);

-- Subscriptions table policies
CREATE POLICY "Allow service role full access to subscriptions"
ON subscriptions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Prevent public access to subscriptions"
ON subscriptions FOR ALL
TO anon
USING (false);

-- Payment receipts table policies
CREATE POLICY "Allow service role full access to payment_receipts"
ON payment_receipts FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Prevent public access to payment_receipts"
ON payment_receipts FOR ALL
TO anon
USING (false);

-- Contact submissions table policies
CREATE POLICY "Allow service role full access to contact_submissions"
ON contact_submissions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Prevent public access to contact_submissions"
ON contact_submissions FOR ALL
TO anon
USING (false);

-- Admin notifications table policies
CREATE POLICY "Allow service role full access to admin_notifications"
ON admin_notifications FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Prevent public access to admin_notifications"
ON admin_notifications FOR ALL
TO anon
USING (false);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check all RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- DONE! RLS is now enabled.
-- ============================================
-- Your backend using service_role connection will work normally.
-- Direct database access without proper credentials is now blocked.
