-- NepLoom PostgreSQL Functions Migration
-- This file creates all the stored procedures for authentication, user management, social features, and galaxy management
-- Run this after the main schema.sql to add all RPC functions

-- Load authentication functions
\i auth_functions.sql

-- Load user management functions  
\i user_functions.sql

-- Load social/connection functions
\i social_functions.sql

-- Load galaxy management functions
\i galaxy_functions.sql

-- Load invitation functions
\i invitation_functions.sql

-- Load content functions
\i content_functions.sql

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant execute permissions to service role (for server-side calls)
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Create indexes for better performance on RPC function queries
CREATE INDEX IF NOT EXISTS idx_loomers_email_verification ON loomers(email, verification_code) WHERE NOT is_verified;
CREATE INDEX IF NOT EXISTS idx_loomers_loomer_name_search ON loomers USING gin(loomer_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_loomers_bio_search ON loomers USING gin(bio gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_galaxies_slug_search ON galaxies USING gin(slug gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_galaxies_lore_search ON galaxies USING gin(lore gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_invitations_recipient_status ON invitations(recipient_id, status, expires_at);
CREATE INDEX IF NOT EXISTS idx_invitations_initiator_status ON invitations(initiator_id, status, expires_at);
CREATE INDEX IF NOT EXISTS idx_connections_user_type ON connections(user_id, connection_type);
CREATE INDEX IF NOT EXISTS idx_connections_peer_type ON connections(peer_id, connection_type);
CREATE INDEX IF NOT EXISTS idx_galaxy_memberships_user ON galaxy_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_galaxy_memberships_galaxy ON galaxy_memberships(galaxy_id);

-- Enable row level security for additional protection
ALTER TABLE loomers ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE galaxy_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE star_links ENABLE ROW LEVEL SECURITY; -- Updated to use unified table
ALTER TABLE user_powers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_relics ENABLE ROW LEVEL SECURITY;
ALTER TABLE galaxy_newsletter_subscriptions ENABLE ROW LEVEL SECURITY; -- New newsletter table

-- Create RLS policies (these will be managed by the application logic in functions)
-- Users can read their own data
CREATE POLICY "Users can read own data" ON loomers
  FOR SELECT USING (auth.uid()::text = id::text);

-- Users can update their own data through functions only
CREATE POLICY "Users can update own data" ON loomers
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Users can manage their own connections
CREATE POLICY "Users can manage own connections" ON connections
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Users can manage their own star links (unified table)
CREATE POLICY "Users can manage own star links" ON star_links
  FOR ALL USING (auth.uid()::text = loomer_id::text);

-- Users can read their own powers and relics
CREATE POLICY "Users can read own powers" ON user_powers
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can read own relics" ON user_relics
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can manage their own galaxy memberships
CREATE POLICY "Users can manage own memberships" ON galaxy_memberships
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Users can manage invitations they sent or received
CREATE POLICY "Users can manage own invitations" ON invitations
  FOR ALL USING (auth.uid()::text = initiator_id::text OR auth.uid()::text = recipient_id::text);

-- Create a function to initialize default data for new users
CREATE OR REPLACE FUNCTION initialize_new_user_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Add any default data initialization here if needed
  -- For example, adding default powers, relics, etc.
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user initialization
CREATE TRIGGER trigger_initialize_new_user
  AFTER INSERT ON loomers
  FOR EACH ROW
  EXECUTE FUNCTION initialize_new_user_data();

-- Create a function to automatically clean up expired invitations
CREATE OR REPLACE FUNCTION auto_cleanup_expired_invitations()
RETURNS void AS $$
BEGIN
  UPDATE invitations
  SET status = 'expired'
  WHERE status = 'pending'
  AND expires_at <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create extension for scheduling (if available)
-- This would require pg_cron extension to be enabled
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('cleanup-expired-invitations', '0 */6 * * *', 'SELECT auto_cleanup_expired_invitations();');

-- Create helper function to get user by identifier (email or username)
CREATE OR REPLACE FUNCTION get_user_by_identifier(p_identifier TEXT)
RETURNS TABLE(
  id UUID,
  email TEXT,
  loomer_name TEXT,
  hash_id TEXT,
  password_hash TEXT,
  is_verified BOOLEAN,
  onboarding_completed BOOLEAN,
  avatar TEXT,
  role user_role,
  stardust INTEGER,
  level INTEGER,
  xp INTEGER,
  aura INTEGER,
  bio TEXT,
  location TEXT,
  interests TEXT[],
  dislikes TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id, l.email, l.loomer_name, l.hash_id, l.password_hash,
    l.is_verified, l.onboarding_completed, l.avatar, l.role,
    l.stardust, l.level, l.xp, l.aura, l.bio, l.location,
    l.interests, l.dislikes, l.created_at, l.updated_at
  FROM loomers l
  WHERE l.email = p_identifier OR l.loomer_name = p_identifier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to check if slug is available
CREATE OR REPLACE FUNCTION is_slug_available(p_table_name TEXT, p_slug TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
BEGIN
  EXECUTE format('SELECT COUNT(*) FROM %I WHERE slug = $1', p_table_name)
  INTO v_count
  USING p_slug;
  
  RETURN v_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to generate unique slug
CREATE OR REPLACE FUNCTION generate_unique_slug(p_table_name TEXT, p_base_slug TEXT)
RETURNS TEXT AS $$
DECLARE
  v_slug TEXT;
  v_counter INTEGER := 1;
BEGIN
  v_slug := p_base_slug;
  
  WHILE NOT is_slug_available(p_table_name, v_slug) LOOP
    v_slug := p_base_slug || '-' || v_counter;
    v_counter := v_counter + 1;
  END LOOP;
  
  RETURN v_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Migration to upgrade from old table structure to new unified structure
-- This should be run after the schema.sql and before other function files

-- Step 1: Migrate data from old tables to new unified star_links table
DO $$
BEGIN
    -- Check if old tables exist and migrate data
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_social_links') THEN
        INSERT INTO star_links (loomer_id, url, created_at)
        SELECT user_id, url, created_at FROM user_social_links;
        
        DROP TABLE user_social_links CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'galaxy_star_links') THEN
        INSERT INTO star_links (galaxy_id, url, created_at)
        SELECT galaxy_id, url, NOW() FROM galaxy_star_links;
        
        DROP TABLE galaxy_star_links CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'affiliate_links') THEN
        INSERT INTO star_links (loom_id, url, created_at)
        SELECT loom_id, url, added_at FROM affiliate_links;
        
        DROP TABLE affiliate_links CASCADE;
    END IF;
END
$$;

-- Step 2: Add newsletter subscription data to existing galaxy memberships
UPDATE galaxy_memberships SET newsletter_subscribed = FALSE WHERE newsletter_subscribed IS NULL;

-- Log successful migration
INSERT INTO pg_stat_statements_info (dealloc) VALUES (0) 
ON CONFLICT DO NOTHING;

-- Create a simple logging function for debugging
CREATE OR REPLACE FUNCTION log_function_call(
  p_function_name TEXT,
  p_user_id UUID DEFAULT NULL,
  p_parameters JSONB DEFAULT NULL
) RETURNS void AS $$
BEGIN
  -- This could be expanded to log to a dedicated table for debugging
  -- For now, it's a placeholder for future logging functionality
  RAISE NOTICE 'Function called: % by user: % with params: %', 
    p_function_name, 
    COALESCE(p_user_id::text, 'anonymous'), 
    COALESCE(p_parameters::text, '{}');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
