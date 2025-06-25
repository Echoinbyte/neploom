-- NepLoom Production Database Schema
-- Optimized for Supabase with pgvector, PostGIS, and PostgreSQL extensions

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Custom Types/Enums
CREATE TYPE user_role AS ENUM ('supreme', 'admin', 'moderator', 'time', 'space');
CREATE TYPE galaxy_type AS ENUM ('community', 'brand', 'official');
CREATE TYPE galaxy_visibility AS ENUM ('public', 'private', 'invite-only');
CREATE TYPE content_visibility AS ENUM ('published', 'unlisted', 'galaxyOnly', 'followersOnly', 'galaxyAndFollowersOnly');
CREATE TYPE content_type AS ENUM ('loom', 'quick', 'spark', 'comet', 'dev');
CREATE TYPE connection_type AS ENUM ('orbit', 'moon', 'star', 'reverse');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired');
CREATE TYPE dev_language AS ENUM ('html-css-js', 'markdown');
CREATE TYPE dev_type AS ENUM ('profile', 'game', 'loom');
CREATE TYPE dev_applicate AS ENUM ('general', 'strict');
CREATE TYPE spark_type AS ENUM ('quiz', 'blast', 'match', 'flashcard');
CREATE TYPE access_level AS ENUM ('creator', 'admin', 'moderator', 'starGeneral', 'member', 'guest');

-- Core Users Table (Loomers)
CREATE TABLE loomers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loomer_name VARCHAR(50) UNIQUE NOT NULL,
    hash_id VARCHAR(8) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    bio TEXT,
    dob DATE,
    location VARCHAR(255),
    avatar TEXT NOT NULL DEFAULT 'default-avatar.png',
    role user_role DEFAULT 'time',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(6),
    verification_expires_at TIMESTAMPTZ,
    stardust INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    aura INTEGER DEFAULT 1 CHECK (aura >= 1 AND aura <= 15),
    interests TEXT[], -- Array of user interests
    dislikes TEXT[], -- Array of user dislikes
    vectors vector(384), -- pgvector for AI search
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Social Links (normalized, no platform field)
CREATE TABLE user_social_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES loomers(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Powers/Achievements (normalized)
CREATE TABLE user_powers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES loomers(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    acquired_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Relics/Collectibles (normalized)
CREATE TABLE user_relics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES loomers(id) ON DELETE CASCADE,
    asset_id VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    acquired_at TIMESTAMPTZ DEFAULT NOW()
);

-- Galaxies (Communities)
CREATE TABLE galaxies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    type galaxy_type NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    logo TEXT,
    accent_color VARCHAR(7), -- Hex color
    lore TEXT,
    banner TEXT,
    rules TEXT,
    visibility galaxy_visibility DEFAULT 'public',
    call_to_action_label VARCHAR(100),
    call_to_action_url TEXT,
    vectors vector(384), -- pgvector for AI search
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Galaxy Star Links (normalized, no platform field)
CREATE TABLE galaxy_star_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    galaxy_id UUID REFERENCES galaxies(id) ON DELETE CASCADE,
    url TEXT NOT NULL
);

-- Role Maps for Galaxies
CREATE TABLE role_maps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    galaxy_id UUID REFERENCES galaxies(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    access_level access_level NOT NULL,
    UNIQUE(galaxy_id, role)
);

-- Galaxy Memberships (Users in Galaxies)
CREATE TABLE galaxy_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES loomers(id) ON DELETE CASCADE,
    galaxy_id UUID REFERENCES galaxies(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    reputation_title VARCHAR(100),
    reputation_score INTEGER DEFAULT 0,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, galaxy_id)
);

-- User Connections (Social Graph)
CREATE TABLE connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES loomers(id) ON DELETE CASCADE,
    peer_id UUID REFERENCES loomers(id) ON DELETE CASCADE,
    connection_type connection_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, peer_id, connection_type),
    CHECK(user_id != peer_id)
);

-- Invitations (WormHoles) - no responded_at field
CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    initiator_id UUID REFERENCES loomers(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES loomers(id) ON DELETE CASCADE,
    travel_kind VARCHAR(20) NOT NULL, -- 'galaxy', 'orbit'
    destination_id UUID, -- Could reference galaxies or loomers
    proposed_role VARCHAR(50),
    status invitation_status DEFAULT 'pending',
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Dev (Custom Code)
CREATE TABLE devs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES loomers(id) ON DELETE CASCADE,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255),
    description TEXT,
    cover_image TEXT,
    code TEXT NOT NULL,
    language dev_language NOT NULL,
    type dev_type NOT NULL,
    applicate dev_applicate DEFAULT 'general',
    visibility content_visibility DEFAULT 'published',
    vectors vector(384), -- pgvector for AI search
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pairs (for Sparks/Flashcards)
CREATE TABLE pairs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    term TEXT NOT NULL,
    definition TEXT NOT NULL
);

-- Sparks (Interactive Content)
CREATE TABLE sparks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES loomers(id) ON DELETE CASCADE,
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type spark_type NOT NULL,
    pair_id UUID REFERENCES pairs(id) ON DELETE SET NULL,
    visibility content_visibility DEFAULT 'published',
    vectors vector(384), -- pgvector for AI search
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Looms (Main Content)
CREATE TABLE looms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES loomers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    mindmap TEXT,
    description TEXT,
    tags TEXT[], -- PostgreSQL array
    visibility content_visibility DEFAULT 'published',
    images TEXT[], -- Array of image URLs
    views INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    content TEXT,
    content_type VARCHAR(20) DEFAULT 'app', -- 'dev' or 'app'
    dev_content_id UUID REFERENCES devs(id) ON DELETE SET NULL,
    vectors vector(384), -- For AI search
    ai_summary TEXT,
    word_count INTEGER DEFAULT 0,
    readability_score DECIMAL(5,2),
    grammar_score DECIMAL(5,2),
    bounce_rate DECIMAL(5,4),
    avg_time_ratio DECIMAL(10,6),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quicks (Short Content)
CREATE TABLE quicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES loomers(id) ON DELETE CASCADE,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    images TEXT[],
    visibility content_visibility DEFAULT 'published',
    vectors vector(384), -- pgvector for AI search
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comets (Polls)
CREATE TABLE comets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES loomers(id) ON DELETE CASCADE,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    options JSONB NOT NULL, -- Store poll options as JSON
    visibility content_visibility DEFAULT 'published',
    expires_at TIMESTAMPTZ,
    vectors vector(384), -- pgvector for AI search
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments (for all content types)
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commenter_id UUID REFERENCES loomers(id) ON DELETE CASCADE,
    content_type content_type NOT NULL,
    content_id UUID NOT NULL, -- Generic reference to any content
    message TEXT NOT NULL,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For nested comments
    vectors vector(384), -- pgvector for AI search on comments
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes (for all content types)
CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES loomers(id) ON DELETE CASCADE,
    content_type content_type NOT NULL,
    content_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, content_type, content_id)
);

-- Content Lists (User-organized content)
CREATE TABLE content_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES loomers(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    is_system BOOLEAN DEFAULT FALSE, -- For 'pinned', 'app' lists
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content List Items
CREATE TABLE content_list_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id UUID REFERENCES content_lists(id) ON DELETE CASCADE,
    content_type content_type NOT NULL,
    content_id UUID NOT NULL,
    position INTEGER,
    added_at TIMESTAMPTZ DEFAULT NOW()
);

-- Galaxy Topics
CREATE TABLE galaxy_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    galaxy_id UUID REFERENCES galaxies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    is_system BOOLEAN DEFAULT FALSE, -- For 'pinned', 'votings', etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Galaxy Topic Contents
CREATE TABLE galaxy_topic_contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID REFERENCES galaxy_topics(id) ON DELETE CASCADE,
    content_type content_type NOT NULL,
    content_id UUID NOT NULL,
    position INTEGER,
    added_at TIMESTAMPTZ DEFAULT NOW()
);

-- Galaxy Events
CREATE TABLE galaxy_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    galaxy_id UUID REFERENCES galaxies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    stardust_reward INTEGER CHECK (stardust_reward >= 1 AND stardust_reward <= 50),
    badges TEXT,
    reputation_title VARCHAR(100),
    reputation_score INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (expires_at > created_at + INTERVAL '1 day')
);

-- Event Participants
CREATE TABLE event_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES galaxy_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES loomers(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Event Submissions
CREATE TABLE event_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES galaxy_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES loomers(id) ON DELETE CASCADE,
    content_type content_type NOT NULL,
    content_id UUID NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Galaxy Rooms (Chat)
CREATE TABLE galaxy_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    galaxy_id UUID REFERENCES galaxies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    is_global BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES loomers(id) ON DELETE CASCADE,
    room_id UUID REFERENCES galaxy_rooms(id) ON DELETE CASCADE,
    connection_id UUID REFERENCES connections(id) ON DELETE CASCADE, -- For DMs
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (
        (room_id IS NOT NULL AND connection_id IS NULL) OR 
        (room_id IS NULL AND connection_id IS NOT NULL)
    )
);

-- Content Reports
CREATE TABLE content_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES loomers(id) ON DELETE CASCADE,
    content_type content_type NOT NULL,
    content_id UUID NOT NULL,
    reason TEXT NOT NULL,
    reported_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monetization (Affiliate Links)
CREATE TABLE affiliate_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loom_id UUID REFERENCES looms(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    added_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Associations (Many-to-Many relationships between content)
CREATE TABLE content_associations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_type content_type NOT NULL,
    source_id UUID NOT NULL,
    target_type content_type NOT NULL,
    target_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_type, source_id, target_type, target_id)
);

-- Performance Indexes
CREATE INDEX idx_loomers_email ON loomers(email);
CREATE INDEX idx_loomers_loomer_name ON loomers(loomer_name);
CREATE INDEX idx_loomers_hash_id ON loomers(hash_id);
CREATE INDEX idx_loomers_role ON loomers(role);
CREATE INDEX idx_loomers_created_at ON loomers(created_at);
CREATE INDEX idx_loomers_interests ON loomers USING gin(interests);
CREATE INDEX idx_loomers_dislikes ON loomers USING gin(dislikes);
CREATE INDEX idx_loomers_vectors ON loomers USING ivfflat (vectors vector_cosine_ops) WITH (lists = 100);

CREATE INDEX idx_galaxies_slug ON galaxies(slug);
CREATE INDEX idx_galaxies_type ON galaxies(type);
CREATE INDEX idx_galaxies_visibility ON galaxies(visibility);
CREATE INDEX idx_galaxies_vectors ON galaxies USING ivfflat (vectors vector_cosine_ops) WITH (lists = 100);

CREATE INDEX idx_galaxy_memberships_user_id ON galaxy_memberships(user_id);
CREATE INDEX idx_galaxy_memberships_galaxy_id ON galaxy_memberships(galaxy_id);
CREATE INDEX idx_galaxy_memberships_role ON galaxy_memberships(role);

CREATE INDEX idx_connections_user_id ON connections(user_id);
CREATE INDEX idx_connections_peer_id ON connections(peer_id);
CREATE INDEX idx_connections_type ON connections(connection_type);

CREATE INDEX idx_invitations_initiator_id ON invitations(initiator_id);
CREATE INDEX idx_invitations_recipient_id ON invitations(recipient_id);
CREATE INDEX idx_invitations_status ON invitations(status);
CREATE INDEX idx_invitations_expires_at ON invitations(expires_at);

CREATE INDEX idx_looms_creator_id ON looms(creator_id);
CREATE INDEX idx_looms_slug ON looms(slug);
CREATE INDEX idx_looms_visibility ON looms(visibility);
CREATE INDEX idx_looms_created_at ON looms(created_at);
CREATE INDEX idx_looms_views ON looms(views);
CREATE INDEX idx_looms_vectors ON looms USING ivfflat (vectors vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_looms_tags ON looms USING gin(tags);

CREATE INDEX idx_quicks_creator_id ON quicks(creator_id);
CREATE INDEX idx_quicks_slug ON quicks(slug);
CREATE INDEX idx_quicks_created_at ON quicks(created_at);
CREATE INDEX idx_quicks_vectors ON quicks USING ivfflat (vectors vector_cosine_ops) WITH (lists = 100);

CREATE INDEX idx_sparks_creator_id ON sparks(creator_id);
CREATE INDEX idx_sparks_slug ON sparks(slug);
CREATE INDEX idx_sparks_type ON sparks(type);
CREATE INDEX idx_sparks_vectors ON sparks USING ivfflat (vectors vector_cosine_ops) WITH (lists = 100);

CREATE INDEX idx_comets_creator_id ON comets(creator_id);
CREATE INDEX idx_comets_slug ON comets(slug);
CREATE INDEX idx_comets_expires_at ON comets(expires_at);
CREATE INDEX idx_comets_vectors ON comets USING ivfflat (vectors vector_cosine_ops) WITH (lists = 100);

CREATE INDEX idx_devs_creator_id ON devs(creator_id);
CREATE INDEX idx_devs_slug ON devs(slug);
CREATE INDEX idx_devs_type ON devs(type);
CREATE INDEX idx_devs_language ON devs(language);
CREATE INDEX idx_devs_vectors ON devs USING ivfflat (vectors vector_cosine_ops) WITH (lists = 100);

CREATE INDEX idx_comments_content_type_id ON comments(content_type, content_id);
CREATE INDEX idx_comments_commenter_id ON comments(commenter_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);
CREATE INDEX idx_comments_vectors ON comments USING ivfflat (vectors vector_cosine_ops) WITH (lists = 100);

CREATE INDEX idx_likes_user_content ON likes(user_id, content_type, content_id);
CREATE INDEX idx_likes_content ON likes(content_type, content_id);

CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_room_id ON messages(room_id);
CREATE INDEX idx_messages_connection_id ON messages(connection_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_loomers_updated_at BEFORE UPDATE ON loomers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_galaxies_updated_at BEFORE UPDATE ON galaxies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_looms_updated_at BEFORE UPDATE ON looms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_devs_updated_at BEFORE UPDATE ON devs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically expire invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void AS $$
BEGIN
    UPDATE invitations 
    SET status = 'expired' 
    WHERE status = 'pending' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;