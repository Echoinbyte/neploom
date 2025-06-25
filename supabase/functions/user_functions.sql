-- PostgreSQL functions for user profile and management
-- These functions handle user profile operations, onboarding, XP, stardust, etc.

-- Function to update user profile
CREATE OR REPLACE FUNCTION update_user_profile(
  p_user_id UUID,
  p_bio TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_avatar TEXT DEFAULT NULL,
  p_interests TEXT[] DEFAULT NULL,
  p_dislikes TEXT[] DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM loomers WHERE id = p_user_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Update user profile with only non-null values
  UPDATE loomers
  SET 
    bio = COALESCE(p_bio, bio),
    location = COALESCE(p_location, location),
    avatar = COALESCE(p_avatar, avatar),
    interests = COALESCE(p_interests, interests),
    dislikes = COALESCE(p_dislikes, dislikes),
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Return updated user data
  SELECT json_build_object(
    'success', true,
    'user', json_build_object(
      'id', id,
      'email', email,
      'loomer_name', loomer_name,
      'hash_id', hash_id,
      'avatar', avatar,
      'role', role,
      'bio', bio,
      'location', location,
      'interests', interests,
      'dislikes', dislikes,
      'is_verified', is_verified,
      'onboarding_completed', onboarding_completed,
      'stardust', stardust,
      'level', level,
      'xp', xp,
      'aura', aura,
      'updated_at', updated_at
    ),
    'message', 'Profile updated successfully'
  ) INTO v_result
  FROM loomers WHERE id = p_user_id;

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete onboarding
CREATE OR REPLACE FUNCTION complete_onboarding(
  p_user_id UUID,
  p_bio TEXT DEFAULT NULL,
  p_interests TEXT[] DEFAULT NULL,
  p_dislikes TEXT[] DEFAULT NULL,
  p_avatar TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM loomers WHERE id = p_user_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Update user profile and mark onboarding as completed
  UPDATE loomers
  SET 
    bio = COALESCE(p_bio, bio),
    interests = COALESCE(p_interests, interests),
    dislikes = COALESCE(p_dislikes, dislikes),
    avatar = COALESCE(p_avatar, avatar),
    onboarding_completed = true,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Return updated user data
  SELECT json_build_object(
    'success', true,
    'user', json_build_object(
      'id', id,
      'email', email,
      'loomer_name', loomer_name,
      'hash_id', hash_id,
      'avatar', avatar,
      'role', role,
      'bio', bio,
      'location', location,
      'interests', interests,
      'dislikes', dislikes,
      'is_verified', is_verified,
      'onboarding_completed', onboarding_completed,
      'stardust', stardust,
      'level', level,
      'xp', xp,
      'aura', aura
    ),
    'message', 'Onboarding completed successfully'
  ) INTO v_result
  FROM loomers WHERE id = p_user_id;

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user stats and profile
CREATE OR REPLACE FUNCTION get_user_stats(
  p_user_id UUID
) RETURNS JSON AS $$
DECLARE
  v_user RECORD;
  v_looms_count INTEGER;
  v_quicks_count INTEGER;
  v_sparks_count INTEGER;
  v_comets_count INTEGER;
  v_devs_count INTEGER;
  v_followers_count INTEGER;
  v_following_count INTEGER;
  v_friends_count INTEGER;
  v_galaxies_count INTEGER;
  v_social_links JSONB;
  v_powers JSONB;
  v_relics JSONB;
BEGIN
  -- Get user basic info
  SELECT * INTO v_user
  FROM loomers
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Get content counts
  SELECT COUNT(*) INTO v_looms_count FROM looms WHERE creator_id = p_user_id;
  SELECT COUNT(*) INTO v_quicks_count FROM quicks WHERE creator_id = p_user_id;
  SELECT COUNT(*) INTO v_sparks_count FROM sparks WHERE creator_id = p_user_id;
  SELECT COUNT(*) INTO v_comets_count FROM comets WHERE creator_id = p_user_id;
  SELECT COUNT(*) INTO v_devs_count FROM devs WHERE creator_id = p_user_id;

  -- Get connection counts
  SELECT COUNT(*) INTO v_followers_count 
  FROM connections 
  WHERE peer_id = p_user_id AND connection_type = 'moon';

  SELECT COUNT(*) INTO v_following_count 
  FROM connections 
  WHERE user_id = p_user_id AND connection_type = 'moon';

  SELECT COUNT(*) INTO v_friends_count 
  FROM connections 
  WHERE (user_id = p_user_id OR peer_id = p_user_id) AND connection_type = 'star';

  -- Get galaxy memberships count
  SELECT COUNT(*) INTO v_galaxies_count 
  FROM galaxy_memberships 
  WHERE user_id = p_user_id;

  -- Get social links
  SELECT COALESCE(json_agg(json_build_object('id', id, 'url', url)), '[]'::json) INTO v_social_links
  FROM user_social_links
  WHERE user_id = p_user_id;

  -- Get powers
  SELECT COALESCE(json_agg(json_build_object('id', id, 'name', name, 'acquired_at', acquired_at)), '[]'::json) INTO v_powers
  FROM user_powers
  WHERE user_id = p_user_id;

  -- Get relics
  SELECT COALESCE(json_agg(json_build_object('id', id, 'asset_id', asset_id, 'name', name, 'acquired_at', acquired_at)), '[]'::json) INTO v_relics
  FROM user_relics
  WHERE user_id = p_user_id;

  -- Return comprehensive user stats
  RETURN json_build_object(
    'success', true,
    'user', json_build_object(
      'id', v_user.id,
      'loomer_name', v_user.loomer_name,
      'hash_id', v_user.hash_id,
      'email', v_user.email,
      'avatar', v_user.avatar,
      'bio', v_user.bio,
      'location', v_user.location,
      'role', v_user.role,
      'stardust', v_user.stardust,
      'level', v_user.level,
      'xp', v_user.xp,
      'aura', v_user.aura,
      'interests', v_user.interests,
      'dislikes', v_user.dislikes,
      'is_verified', v_user.is_verified,
      'onboarding_completed', v_user.onboarding_completed,
      'created_at', v_user.created_at,
      'stats', json_build_object(
        'content', json_build_object(
          'looms', v_looms_count,
          'quicks', v_quicks_count,
          'sparks', v_sparks_count,
          'comets', v_comets_count,
          'devs', v_devs_count,
          'total', v_looms_count + v_quicks_count + v_sparks_count + v_comets_count + v_devs_count
        ),
        'social', json_build_object(
          'followers', v_followers_count,
          'following', v_following_count,
          'friends', v_friends_count,
          'galaxies', v_galaxies_count
        )
      ),
      'social_links', v_social_links,
      'powers', v_powers,
      'relics', v_relics
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add XP and calculate level
CREATE OR REPLACE FUNCTION add_user_xp(
  p_user_id UUID,
  p_xp_amount INTEGER,
  p_reason TEXT DEFAULT 'Activity reward'
) RETURNS JSON AS $$
DECLARE
  v_user RECORD;
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_level_up BOOLEAN := false;
BEGIN
  -- Get current user data
  SELECT * INTO v_user
  FROM loomers
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Calculate new XP
  v_new_xp := v_user.xp + p_xp_amount;

  -- Calculate new level (simple formula: level = floor(sqrt(xp/100)) + 1)
  v_new_level := FLOOR(SQRT(v_new_xp / 100.0)) + 1;

  -- Check if user leveled up
  IF v_new_level > v_user.level THEN
    v_level_up := true;
  END IF;

  -- Update user XP and level
  UPDATE loomers
  SET 
    xp = v_new_xp,
    level = v_new_level,
    updated_at = NOW()
  WHERE id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'xp_gained', p_xp_amount,
    'total_xp', v_new_xp,
    'level', v_new_level,
    'level_up', v_level_up,
    'reason', p_reason,
    'message', CASE 
      WHEN v_level_up THEN 'Congratulations! You leveled up to level ' || v_new_level || '!'
      ELSE 'You gained ' || p_xp_amount || ' XP!'
    END
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add stardust
CREATE OR REPLACE FUNCTION add_user_stardust(
  p_user_id UUID,
  p_stardust_amount INTEGER,
  p_reason TEXT DEFAULT 'Activity reward'
) RETURNS JSON AS $$
DECLARE
  v_current_stardust INTEGER;
  v_new_stardust INTEGER;
BEGIN
  -- Get current stardust
  SELECT stardust INTO v_current_stardust
  FROM loomers
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Calculate new stardust
  v_new_stardust := v_current_stardust + p_stardust_amount;

  -- Update user stardust
  UPDATE loomers
  SET 
    stardust = v_new_stardust,
    updated_at = NOW()
  WHERE id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'stardust_gained', p_stardust_amount,
    'total_stardust', v_new_stardust,
    'reason', p_reason,
    'message', 'You gained ' || p_stardust_amount || ' stardust!'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to spend stardust
CREATE OR REPLACE FUNCTION spend_user_stardust(
  p_user_id UUID,
  p_stardust_amount INTEGER,
  p_reason TEXT DEFAULT 'Purchase'
) RETURNS JSON AS $$
DECLARE
  v_current_stardust INTEGER;
  v_new_stardust INTEGER;
BEGIN
  -- Get current stardust
  SELECT stardust INTO v_current_stardust
  FROM loomers
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Check if user has enough stardust
  IF v_current_stardust < p_stardust_amount THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient stardust',
      'current_stardust', v_current_stardust,
      'required_stardust', p_stardust_amount
    );
  END IF;

  -- Calculate new stardust
  v_new_stardust := v_current_stardust - p_stardust_amount;

  -- Update user stardust
  UPDATE loomers
  SET 
    stardust = v_new_stardust,
    updated_at = NOW()
  WHERE id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'stardust_spent', p_stardust_amount,
    'remaining_stardust', v_new_stardust,
    'reason', p_reason,
    'message', 'You spent ' || p_stardust_amount || ' stardust!'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user aura
CREATE OR REPLACE FUNCTION update_user_aura(
  p_user_id UUID,
  p_new_aura INTEGER
) RETURNS JSON AS $$
BEGIN
  -- Validate aura range (1-15)
  IF p_new_aura < 1 OR p_new_aura > 15 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Aura must be between 1 and 15'
    );
  END IF;

  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM loomers WHERE id = p_user_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Update user aura
  UPDATE loomers
  SET 
    aura = p_new_aura,
    updated_at = NOW()
  WHERE id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'aura', p_new_aura,
    'message', 'Aura updated successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add social link
CREATE OR REPLACE FUNCTION add_user_social_link(
  p_user_id UUID,
  p_url TEXT
) RETURNS JSON AS $$
DECLARE
  v_link_id UUID;
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM loomers WHERE id = p_user_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Insert social link
  INSERT INTO user_social_links (user_id, url)
  VALUES (p_user_id, p_url)
  RETURNING id INTO v_link_id;

  RETURN json_build_object(
    'success', true,
    'link_id', v_link_id,
    'message', 'Social link added successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove social link
CREATE OR REPLACE FUNCTION remove_user_social_link(
  p_user_id UUID,
  p_link_id UUID
) RETURNS JSON AS $$
BEGIN
  -- Delete social link (only if it belongs to the user)
  DELETE FROM user_social_links
  WHERE id = p_link_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Social link not found or does not belong to user'
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'message', 'Social link removed successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
