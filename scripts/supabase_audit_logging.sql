-- ============================================
-- AUDIT LOGGING SETUP FOR SUPABASE
-- ============================================
-- Run this script in Supabase SQL Editor
-- This creates an audit trail for all critical operations

-- Step 1: Create audit_logs table
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    record_id TEXT,
    old_data JSONB,
    new_data JSONB,
    user_id TEXT,
    changed_at TIMESTAMP DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Add index for faster queries
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_changed_at ON audit_logs(changed_at);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);

-- Step 2: Create audit trigger function
-- ============================================

CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
    record_id_val TEXT;
BEGIN
    -- Get the ID of the record being modified
    IF TG_OP = 'DELETE' THEN
        record_id_val := OLD.id::TEXT;
    ELSE
        record_id_val := NEW.id::TEXT;
    END IF;

    -- Log the action
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, action, record_id, old_data, user_id)
        VALUES (TG_TABLE_NAME, TG_OP, record_id_val, row_to_json(OLD)::JSONB, OLD.id::TEXT);
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, action, record_id, old_data, new_data, user_id)
        VALUES (TG_TABLE_NAME, TG_OP, record_id_val, row_to_json(OLD)::JSONB, row_to_json(NEW)::JSONB, NEW.id::TEXT);
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, action, record_id, new_data, user_id)
        VALUES (TG_TABLE_NAME, TG_OP, record_id_val, row_to_json(NEW)::JSONB, NEW.id::TEXT);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Apply audit triggers to critical tables
-- ============================================

-- Users table audit
CREATE TRIGGER users_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Subscriptions table audit
CREATE TRIGGER subscriptions_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Payment receipts audit (especially important for financial data)
CREATE TRIGGER payment_receipts_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON payment_receipts
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Admin notifications audit
CREATE TRIGGER admin_notifications_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON admin_notifications
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Step 4: Enable RLS on audit_logs table
-- ============================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can access audit logs
CREATE POLICY "Service role only can access audit logs"
ON audit_logs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Prevent public access
CREATE POLICY "Prevent public access to audit logs"
ON audit_logs FOR ALL
TO anon
USING (false);

-- ============================================
-- USEFUL AUDIT QUERIES
-- ============================================

-- View recent audit logs
-- SELECT * FROM audit_logs ORDER BY changed_at DESC LIMIT 50;

-- View all changes to a specific user
-- SELECT * FROM audit_logs WHERE table_name = 'users' AND record_id = 'USER_ID' ORDER BY changed_at DESC;

-- View all deletions
-- SELECT * FROM audit_logs WHERE action = 'DELETE' ORDER BY changed_at DESC;

-- View all changes in last 24 hours
-- SELECT * FROM audit_logs WHERE changed_at > NOW() - INTERVAL '24 hours' ORDER BY changed_at DESC;

-- View payment receipt modifications (fraud detection)
-- SELECT * FROM audit_logs WHERE table_name = 'payment_receipts' ORDER BY changed_at DESC;

-- ============================================
-- CLEANUP FUNCTION (Optional)
-- ============================================
-- Deletes audit logs older than 1 year to save space

CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM audit_logs WHERE changed_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- To manually run cleanup:
-- SELECT cleanup_old_audit_logs();

-- ============================================
-- VERIFICATION
-- ============================================

-- Test audit logging by making a change:
-- UPDATE users SET email = email WHERE id = (SELECT id FROM users LIMIT 1);
-- Then check: SELECT * FROM audit_logs ORDER BY changed_at DESC LIMIT 5;

-- ============================================
-- DONE! Audit logging is now enabled.
-- ============================================
