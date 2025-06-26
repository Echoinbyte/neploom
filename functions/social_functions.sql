-- PostgreSQL functions for social features and connections
-- These functions handle user connections, follows, friends, etc.

-- Function to create a connection between users
CREATE OR REPLACE FUNCTION create_user_connection(
  p_user_id UUID,
  p_peer_id UUID,
  p_connection_type connection_type
) RETURNS JSON AS $$
BEGIN
  -- Validate users exist
  IF NOT EXISTS (SELECT 1 FROM loomers WHERE id = p_user_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM loomers WHERE id = p_peer_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Target user not found'
    );
  END IF;

  -- Prevent self-connection
  IF p_user_id = p_peer_id THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Cannot connect to yourself'
    );
  END IF;

  -- Check if connection already exists
  IF EXISTS (
    SELECT 1 FROM connections 
    WHERE user_id = p_user_id 
    AND peer_id = p_peer_id 
    AND connection_type = p_connection_type
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Connection already exists'
    );
  END IF;

  -- Create connection
  INSERT INTO connections (user_id, peer_id, connection_type)
  VALUES (p_user_id, p_peer_id, p_connection_type);

  -- For 'star' connections (friends), create reverse connection
  IF p_connection_type = 'star' THEN
    INSERT INTO connections (user_id, peer_id, connection_type)
    VALUES (p_peer_id, p_user_id, 'star')
    ON CONFLICT (user_id, peer_id, connection_type) DO NOTHING;
  END IF;

  RETURN json_build_object(
    'success', true,
    'message', 'Connection created successfully',
    'connection_type', p_connection_type
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove a connection between users
CREATE OR REPLACE FUNCTION remove_user_connection(
  p_user_id UUID,
  p_peer_id UUID,
  p_connection_type connection_type
) RETURNS JSON AS $$
BEGIN
  -- Remove connection
  DELETE FROM connections
  WHERE user_id = p_user_id 
  AND peer_id = p_peer_id 
  AND connection_type = p_connection_type;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Connection not found'
    );
  END IF;

  -- For 'star' connections (friends), remove reverse connection
  IF p_connection_type = 'star' THEN
    DELETE FROM connections
    WHERE user_id = p_peer_id 
    AND peer_id = p_user_id 
    AND connection_type = 'star';
  END IF;

  RETURN json_build_object(
    'success', true,
    'message', 'Connection removed successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user connections
CREATE OR REPLACE FUNCTION get_user_connections(
  p_user_id UUID,
  p_connection_type connection_type DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
) RETURNS JSON AS $$
DECLARE
  v_connections JSONB;
  v_total_count INTEGER;
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM loomers WHERE id = p_user_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Get connections with user details
  WITH connection_data AS (
    SELECT 
      c.id,
      c.connection_type,
      c.created_at,
      l.id as peer_id,
      l.loomer_name,
      l.hash_id,
      l.avatar,
      l.bio,
      l.level,
      l.aura
    FROM connections c
    JOIN loomers l ON c.peer_id = l.id
    WHERE c.user_id = p_user_id
    AND (p_connection_type IS NULL OR c.connection_type = p_connection_type)
    ORDER BY c.created_at DESC
    LIMIT p_limit OFFSET p_offset
  )
  SELECT 
    COALESCE(json_agg(
      json_build_object(
        'id', id,
        'connection_type', connection_type,
        'created_at', created_at,
        'peer', json_build_object(
          'id', peer_id,
          'loomer_name', loomer_name,
          'hash_id', hash_id,
          'avatar', avatar,
          'bio', bio,
          'level', level,
          'aura', aura
        )
      )
    ), '[]'::json) INTO v_connections
  FROM connection_data;

  -- Get total count
  SELECT COUNT(*) INTO v_total_count
  FROM connections
  WHERE user_id = p_user_id
  AND (p_connection_type IS NULL OR connection_type = p_connection_type);

  RETURN json_build_object(
    'success', true,
    'connections', v_connections,
    'total_count', v_total_count,
    'limit', p_limit,
    'offset', p_offset
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get followers (users who moon/follow this user)
CREATE OR REPLACE FUNCTION get_user_followers(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
) RETURNS JSON AS $$
DECLARE
  v_followers JSONB;
  v_total_count INTEGER;
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM loomers WHERE id = p_user_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Get followers with user details
  WITH follower_data AS (
    SELECT 
      c.id,
      c.created_at,
      l.id as follower_id,
      l.loomer_name,
      l.hash_id,
      l.avatar,
      l.bio,
      l.level,
      l.aura
    FROM connections c
    JOIN loomers l ON c.user_id = l.id
    WHERE c.peer_id = p_user_id
    AND c.connection_type = 'moon'
    ORDER BY c.created_at DESC
    LIMIT p_limit OFFSET p_offset
  )
  SELECT 
    COALESCE(json_agg(
      json_build_object(
        'id', id,
        'created_at', created_at,
        'follower', json_build_object(
          'id', follower_id,
          'loomer_name', loomer_name,
          'hash_id', hash_id,
          'avatar', avatar,
          'bio', bio,
          'level', level,
          'aura', aura
        )
      )
    ), '[]'::json) INTO v_followers
  FROM follower_data;

  -- Get total count
  SELECT COUNT(*) INTO v_total_count
  FROM connections
  WHERE peer_id = p_user_id AND connection_type = 'moon';

  RETURN json_build_object(
    'success', true,
    'followers', v_followers,
    'total_count', v_total_count,
    'limit', p_limit,
    'offset', p_offset
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get following (users this user moons/follows)
CREATE OR REPLACE FUNCTION get_user_following(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
) RETURNS JSON AS $$
DECLARE
  v_following JSONB;
  v_total_count INTEGER;
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM loomers WHERE id = p_user_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Get following with user details
  WITH following_data AS (
    SELECT 
      c.id,
      c.created_at,
      l.id as following_id,
      l.loomer_name,
      l.hash_id,
      l.avatar,
      l.bio,
      l.level,
      l.aura
    FROM connections c
    JOIN loomers l ON c.peer_id = l.id
    WHERE c.user_id = p_user_id
    AND c.connection_type = 'moon'
    ORDER BY c.created_at DESC
    LIMIT p_limit OFFSET p_offset
  )
  SELECT 
    COALESCE(json_agg(
      json_build_object(
        'id', id,
        'created_at', created_at,
        'following', json_build_object(
          'id', following_id,
          'loomer_name', loomer_name,
          'hash_id', hash_id,
          'avatar', avatar,
          'bio', bio,
          'level', level,
          'aura', aura
        )
      )
    ), '[]'::json) INTO v_following
  FROM following_data;

  -- Get total count
  SELECT COUNT(*) INTO v_total_count
  FROM connections
  WHERE user_id = p_user_id AND connection_type = 'moon';

  RETURN json_build_object(
    'success', true,
    'following', v_following,
    'total_count', v_total_count,
    'limit', p_limit,
    'offset', p_offset
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check connection status between two users
CREATE OR REPLACE FUNCTION check_connection_status(
  p_user_id UUID,
  p_peer_id UUID
) RETURNS JSON AS $$
DECLARE
  v_user_to_peer TEXT;
  v_peer_to_user TEXT;
  v_are_friends BOOLEAN;
BEGIN
  -- Check connection from user to peer
  SELECT connection_type::text INTO v_user_to_peer
  FROM connections
  WHERE user_id = p_user_id AND peer_id = p_peer_id;

  -- Check connection from peer to user
  SELECT connection_type::text INTO v_peer_to_user
  FROM connections
  WHERE user_id = p_peer_id AND peer_id = p_user_id;

  -- Check if they are friends (both have 'star' connections)
  v_are_friends := (v_user_to_peer = 'star' AND v_peer_to_user = 'star');

  RETURN json_build_object(
    'success', true,
    'user_to_peer', COALESCE(v_user_to_peer, 'none'),
    'peer_to_user', COALESCE(v_peer_to_user, 'none'),
    'are_friends', v_are_friends,
    'user_follows_peer', (v_user_to_peer = 'moon'),
    'peer_follows_user', (v_peer_to_user = 'moon')
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search users
CREATE OR REPLACE FUNCTION search_users(
  p_query TEXT,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS JSON AS $$
DECLARE
  v_users JSONB;
  v_total_count INTEGER;
BEGIN
  -- Search users by loomer_name, hash_id, or bio
  WITH user_search AS (
    SELECT 
      id,
      loomer_name,
      hash_id,
      avatar,
      bio,
      level,
      aura,
      stardust,
      is_verified,
      created_at,
      -- Calculate relevance score
      CASE 
        WHEN loomer_name ILIKE p_query || '%' THEN 3
        WHEN hash_id ILIKE p_query || '%' THEN 2
        WHEN loomer_name ILIKE '%' || p_query || '%' THEN 1
        WHEN bio ILIKE '%' || p_query || '%' THEN 0.5
        ELSE 0
      END as relevance_score
    FROM loomers
    WHERE is_verified = true
    AND (
      loomer_name ILIKE '%' || p_query || '%' OR
      hash_id ILIKE '%' || p_query || '%' OR
      bio ILIKE '%' || p_query || '%'
    )
    ORDER BY relevance_score DESC, level DESC, stardust DESC
    LIMIT p_limit OFFSET p_offset
  )
  SELECT 
    COALESCE(json_agg(
      json_build_object(
        'id', id,
        'loomer_name', loomer_name,
        'hash_id', hash_id,
        'avatar', avatar,
        'bio', bio,
        'level', level,
        'aura', aura,
        'stardust', stardust,
        'is_verified', is_verified,
        'created_at', created_at,
        'relevance_score', relevance_score
      )
    ), '[]'::json) INTO v_users
  FROM user_search;

  -- Get total count
  SELECT COUNT(*) INTO v_total_count
  FROM loomers
  WHERE is_verified = true
  AND (
    loomer_name ILIKE '%' || p_query || '%' OR
    hash_id ILIKE '%' || p_query || '%' OR
    bio ILIKE '%' || p_query || '%'
  );

  RETURN json_build_object(
    'success', true,
    'users', v_users,
    'total_count', v_total_count,
    'query', p_query,
    'limit', p_limit,
    'offset', p_offset
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
