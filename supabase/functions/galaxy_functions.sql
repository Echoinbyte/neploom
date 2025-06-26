-- PostgreSQL functions for galaxy (community) management
-- These functions handle galaxy creation, membership, invitations, etc.

-- Function to create a new galaxy
CREATE OR REPLACE FUNCTION create_galaxy(
  p_creator_id UUID,
  p_slug TEXT,
  p_type galaxy_type,
  p_logo TEXT DEFAULT NULL,
  p_accent_color TEXT DEFAULT NULL,
  p_lore TEXT DEFAULT NULL,
  p_banner TEXT DEFAULT NULL,
  p_rules TEXT DEFAULT NULL,
  p_visibility galaxy_visibility DEFAULT 'public',
  p_call_to_action_label TEXT DEFAULT NULL,
  p_call_to_action_url TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_galaxy_id UUID;
  v_result JSON;
BEGIN
  -- Check if creator exists
  IF NOT EXISTS (SELECT 1 FROM loomers WHERE id = p_creator_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Creator not found'
    );
  END IF;

  -- Check if slug is available
  IF EXISTS (SELECT 1 FROM galaxies WHERE slug = p_slug) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Galaxy slug already exists'
    );
  END IF;

  -- Create galaxy
  INSERT INTO galaxies (
    slug,
    type,
    logo,
    accent_color,
    lore,
    banner,
    rules,
    visibility,
    call_to_action_label,
    call_to_action_url
  ) VALUES (
    p_slug,
    p_type,
    p_logo,
    p_accent_color,
    p_lore,
    p_banner,
    p_rules,
    p_visibility,
    p_call_to_action_label,
    p_call_to_action_url
  ) RETURNING id INTO v_galaxy_id;

  -- Add creator as admin member
  INSERT INTO galaxy_memberships (user_id, galaxy_id, role, reputation_score)
  VALUES (p_creator_id, v_galaxy_id, 'admin', 100);

  -- Create default role map for admin
  INSERT INTO role_maps (galaxy_id, role, access_level)
  VALUES (v_galaxy_id, 'admin', 'admin');

  -- Return galaxy data
  SELECT json_build_object(
    'success', true,
    'galaxy', json_build_object(
      'id', id,
      'slug', slug,
      'type', type,
      'is_verified', is_verified,
      'logo', logo,
      'accent_color', accent_color,
      'lore', lore,
      'banner', banner,
      'rules', rules,
      'visibility', visibility,
      'call_to_action_label', call_to_action_label,
      'call_to_action_url', call_to_action_url,
      'created_at', created_at
    ),
    'message', 'Galaxy created successfully'
  ) INTO v_result
  FROM galaxies WHERE id = v_galaxy_id;

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update galaxy
CREATE OR REPLACE FUNCTION update_galaxy(
  p_user_id UUID,
  p_galaxy_id UUID,
  p_logo TEXT DEFAULT NULL,
  p_accent_color TEXT DEFAULT NULL,
  p_lore TEXT DEFAULT NULL,
  p_banner TEXT DEFAULT NULL,
  p_rules TEXT DEFAULT NULL,
  p_visibility galaxy_visibility DEFAULT NULL,
  p_call_to_action_label TEXT DEFAULT NULL,
  p_call_to_action_url TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_user_role TEXT;
  v_access_level access_level;
  v_result JSON;
BEGIN
  -- Check if user has permission to update galaxy
  SELECT gm.role INTO v_user_role
  FROM galaxy_memberships gm
  WHERE gm.user_id = p_user_id AND gm.galaxy_id = p_galaxy_id;

  IF v_user_role IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User is not a member of this galaxy'
    );
  END IF;

  -- Get access level for user's role
  SELECT rm.access_level INTO v_access_level
  FROM role_maps rm
  WHERE rm.galaxy_id = p_galaxy_id AND rm.role = v_user_role;

  -- Check if user has admin access
  IF v_access_level NOT IN ('creator', 'admin') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient permissions to update galaxy'
    );
  END IF;

  -- Update galaxy with only non-null values
  UPDATE galaxies
  SET 
    logo = COALESCE(p_logo, logo),
    accent_color = COALESCE(p_accent_color, accent_color),
    lore = COALESCE(p_lore, lore),
    banner = COALESCE(p_banner, banner),
    rules = COALESCE(p_rules, rules),
    visibility = COALESCE(p_visibility, visibility),
    call_to_action_label = COALESCE(p_call_to_action_label, call_to_action_label),
    call_to_action_url = COALESCE(p_call_to_action_url, call_to_action_url),
    updated_at = NOW()
  WHERE id = p_galaxy_id;

  -- Return updated galaxy data
  SELECT json_build_object(
    'success', true,
    'galaxy', json_build_object(
      'id', id,
      'slug', slug,
      'type', type,
      'is_verified', is_verified,
      'logo', logo,
      'accent_color', accent_color,
      'lore', lore,
      'banner', banner,
      'rules', rules,
      'visibility', visibility,
      'call_to_action_label', call_to_action_label,
      'call_to_action_url', call_to_action_url,
      'updated_at', updated_at
    ),
    'message', 'Galaxy updated successfully'
  ) INTO v_result
  FROM galaxies WHERE id = p_galaxy_id;

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to join a galaxy
CREATE OR REPLACE FUNCTION join_galaxy(
  p_user_id UUID,
  p_galaxy_id UUID,
  p_invitation_id UUID DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_galaxy RECORD;
  v_invitation RECORD;
  v_default_role TEXT := 'member';
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM loomers WHERE id = p_user_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Get galaxy info
  SELECT * INTO v_galaxy FROM galaxies WHERE id = p_galaxy_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Galaxy not found'
    );
  END IF;

  -- Check if user is already a member
  IF EXISTS (SELECT 1 FROM galaxy_memberships WHERE user_id = p_user_id AND galaxy_id = p_galaxy_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User is already a member of this galaxy'
    );
  END IF;

  -- Handle invitation-based joining
  IF p_invitation_id IS NOT NULL THEN
    SELECT * INTO v_invitation 
    FROM invitations 
    WHERE id = p_invitation_id 
    AND recipient_id = p_user_id 
    AND destination_id = p_galaxy_id
    AND travel_kind = 'galaxy'
    AND status = 'pending'
    AND expires_at > NOW();

    IF NOT FOUND THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Invalid or expired invitation'
      );
    END IF;

    -- Use proposed role from invitation
    v_default_role := COALESCE(v_invitation.proposed_role, 'member');

    -- Update invitation status
    UPDATE invitations 
    SET status = 'accepted' 
    WHERE id = p_invitation_id;
  ELSE
    -- Check if galaxy allows public joining
    IF v_galaxy.visibility = 'private' THEN
      RETURN json_build_object(
        'success', false,
        'error', 'This galaxy is private and requires an invitation'
      );
    END IF;

    IF v_galaxy.visibility = 'invite-only' THEN
      RETURN json_build_object(
        'success', false,
        'error', 'This galaxy is invite-only'
      );
    END IF;
  END IF;

  -- Add user to galaxy
  INSERT INTO galaxy_memberships (user_id, galaxy_id, role, reputation_score)
  VALUES (p_user_id, p_galaxy_id, v_default_role, 0);

  RETURN json_build_object(
    'success', true,
    'membership', json_build_object(
      'galaxy_id', p_galaxy_id,
      'role', v_default_role,
      'reputation_score', 0
    ),
    'message', 'Successfully joined galaxy'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to leave a galaxy
CREATE OR REPLACE FUNCTION leave_galaxy(
  p_user_id UUID,
  p_galaxy_id UUID
) RETURNS JSON AS $$
DECLARE
  v_membership RECORD;
  v_member_count INTEGER;
BEGIN
  -- Get user's membership
  SELECT * INTO v_membership
  FROM galaxy_memberships
  WHERE user_id = p_user_id AND galaxy_id = p_galaxy_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User is not a member of this galaxy'
    );
  END IF;

  -- Count total members
  SELECT COUNT(*) INTO v_member_count
  FROM galaxy_memberships
  WHERE galaxy_id = p_galaxy_id;

  -- Prevent last admin from leaving
  IF v_membership.role = 'admin' AND v_member_count = 1 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Cannot leave galaxy as the last member. Please delete the galaxy instead.'
    );
  END IF;

  -- Remove membership
  DELETE FROM galaxy_memberships
  WHERE user_id = p_user_id AND galaxy_id = p_galaxy_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Successfully left galaxy'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get galaxy details with membership info
CREATE OR REPLACE FUNCTION get_galaxy_details(
  p_galaxy_id UUID,
  p_user_id UUID DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_galaxy RECORD;
  v_user_membership RECORD;
  v_member_count INTEGER;
  v_star_links JSONB;
  v_role_maps JSONB;
BEGIN
  -- Get galaxy info
  SELECT * INTO v_galaxy FROM galaxies WHERE id = p_galaxy_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Galaxy not found'
    );
  END IF;

  -- Get user's membership if user_id provided
  IF p_user_id IS NOT NULL THEN
    SELECT * INTO v_user_membership
    FROM galaxy_memberships
    WHERE user_id = p_user_id AND galaxy_id = p_galaxy_id;
  END IF;

  -- Get member count
  SELECT COUNT(*) INTO v_member_count
  FROM galaxy_memberships
  WHERE galaxy_id = p_galaxy_id;

  -- Get star links (from unified star_links table)
  SELECT COALESCE(json_agg(json_build_object('id', id, 'url', url, 'label', label)), '[]'::json) INTO v_star_links
  FROM star_links
  WHERE galaxy_id = p_galaxy_id;

  -- Get role maps
  SELECT COALESCE(json_agg(json_build_object('role', role, 'access_level', access_level)), '[]'::json) INTO v_role_maps
  FROM role_maps
  WHERE galaxy_id = p_galaxy_id;

  RETURN json_build_object(
    'success', true,
    'galaxy', json_build_object(
      'id', v_galaxy.id,
      'slug', v_galaxy.slug,
      'type', v_galaxy.type,
      'is_verified', v_galaxy.is_verified,
      'logo', v_galaxy.logo,
      'accent_color', v_galaxy.accent_color,
      'lore', v_galaxy.lore,
      'banner', v_galaxy.banner,
      'rules', v_galaxy.rules,
      'visibility', v_galaxy.visibility,
      'call_to_action_label', v_galaxy.call_to_action_label,
      'call_to_action_url', v_galaxy.call_to_action_url,
      'created_at', v_galaxy.created_at,
      'updated_at', v_galaxy.updated_at,
      'member_count', v_member_count,
      'star_links', v_star_links,
      'role_maps', v_role_maps,
      'user_membership', CASE 
        WHEN v_user_membership.id IS NOT NULL THEN
          json_build_object(
            'role', v_user_membership.role,
            'reputation_title', v_user_membership.reputation_title,
            'reputation_score', v_user_membership.reputation_score,
            'joined_at', v_user_membership.joined_at
          )
        ELSE NULL
      END
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

-- Function to get galaxy members
CREATE OR REPLACE FUNCTION get_galaxy_members(
  p_galaxy_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
) RETURNS JSON AS $$
DECLARE
  v_members JSONB;
  v_total_count INTEGER;
BEGIN
  -- Check if galaxy exists
  IF NOT EXISTS (SELECT 1 FROM galaxies WHERE id = p_galaxy_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Galaxy not found'
    );
  END IF;

  -- Get members with user details
  WITH member_data AS (
    SELECT 
      gm.id,
      gm.role,
      gm.reputation_title,
      gm.reputation_score,
      gm.joined_at,
      l.id as user_id,
      l.loomer_name,
      l.hash_id,
      l.avatar,
      l.bio,
      l.level,
      l.aura,
      l.is_verified
    FROM galaxy_memberships gm
    JOIN loomers l ON gm.user_id = l.id
    WHERE gm.galaxy_id = p_galaxy_id
    ORDER BY 
      CASE gm.role 
        WHEN 'admin' THEN 1 
        WHEN 'moderator' THEN 2 
        ELSE 3 
      END,
      gm.reputation_score DESC,
      gm.joined_at ASC
    LIMIT p_limit OFFSET p_offset
  )
  SELECT 
    COALESCE(json_agg(
      json_build_object(
        'id', id,
        'role', role,
        'reputation_title', reputation_title,
        'reputation_score', reputation_score,
        'joined_at', joined_at,
        'user', json_build_object(
          'id', user_id,
          'loomer_name', loomer_name,
          'hash_id', hash_id,
          'avatar', avatar,
          'bio', bio,
          'level', level,
          'aura', aura,
          'is_verified', is_verified
        )
      )
    ), '[]'::json) INTO v_members
  FROM member_data;

  -- Get total count
  SELECT COUNT(*) INTO v_total_count
  FROM galaxy_memberships
  WHERE galaxy_id = p_galaxy_id;

  RETURN json_build_object(
    'success', true,
    'members', v_members,
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

-- Function to search galaxies
CREATE OR REPLACE FUNCTION search_galaxies(
  p_query TEXT,
  p_type galaxy_type DEFAULT NULL,
  p_visibility galaxy_visibility DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS JSON AS $$
DECLARE
  v_galaxies JSONB;
  v_total_count INTEGER;
BEGIN
  -- Search galaxies with member counts
  WITH galaxy_search AS (
    SELECT 
      g.*,
      COUNT(gm.id) as member_count,
      -- Calculate relevance score
      CASE 
        WHEN g.slug ILIKE p_query || '%' THEN 3
        WHEN g.slug ILIKE '%' || p_query || '%' THEN 2
        WHEN g.lore ILIKE '%' || p_query || '%' THEN 1
        ELSE 0
      END as relevance_score
    FROM galaxies g
    LEFT JOIN galaxy_memberships gm ON g.id = gm.galaxy_id
    WHERE (p_visibility IS NULL OR g.visibility = p_visibility OR g.visibility = 'public')
    AND (p_type IS NULL OR g.type = p_type)
    AND (
      g.slug ILIKE '%' || p_query || '%' OR
      g.lore ILIKE '%' || p_query || '%'
    )
    GROUP BY g.id
    ORDER BY relevance_score DESC, member_count DESC, g.created_at DESC
    LIMIT p_limit OFFSET p_offset
  )
  SELECT 
    COALESCE(json_agg(
      json_build_object(
        'id', id,
        'slug', slug,
        'type', type,
        'is_verified', is_verified,
        'logo', logo,
        'accent_color', accent_color,
        'lore', lore,
        'banner', banner,
        'visibility', visibility,
        'call_to_action_label', call_to_action_label,
        'call_to_action_url', call_to_action_url,
        'created_at', created_at,
        'member_count', member_count,
        'relevance_score', relevance_score
      )
    ), '[]'::json) INTO v_galaxies
  FROM galaxy_search;

  -- Get total count
  SELECT COUNT(*) INTO v_total_count
  FROM galaxies g
  WHERE (p_visibility IS NULL OR g.visibility = p_visibility OR g.visibility = 'public')
  AND (p_type IS NULL OR g.type = p_type)
  AND (
    g.slug ILIKE '%' || p_query || '%' OR
    g.lore ILIKE '%' || p_query || '%'
  );

  RETURN json_build_object(
    'success', true,
    'galaxies', v_galaxies,
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

-- Function to subscribe/unsubscribe to galaxy newsletter
CREATE OR REPLACE FUNCTION toggle_galaxy_newsletter_subscription(
  p_user_id UUID,
  p_galaxy_id UUID,
  p_subscribe BOOLEAN
) RETURNS JSON AS $$
DECLARE
  v_membership RECORD;
  v_newsletter_subscription RECORD;
BEGIN
  -- Check if user is a member of the galaxy
  SELECT * INTO v_membership
  FROM galaxy_memberships
  WHERE user_id = p_user_id AND galaxy_id = p_galaxy_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User is not a member of this galaxy'
    );
  END IF;

  -- Update membership newsletter preference
  UPDATE galaxy_memberships
  SET newsletter_subscribed = p_subscribe
  WHERE user_id = p_user_id AND galaxy_id = p_galaxy_id;

  -- Get or create newsletter subscription record
  SELECT * INTO v_newsletter_subscription
  FROM galaxy_newsletter_subscriptions
  WHERE galaxy_id = p_galaxy_id;

  IF FOUND THEN
    -- Update existing subscription
    IF p_subscribe THEN
      -- Add user to subscription list if not already there
      UPDATE galaxy_newsletter_subscriptions
      SET 
        loomer_ids = CASE 
          WHEN p_user_id = ANY(loomer_ids) THEN loomer_ids
          ELSE array_append(loomer_ids, p_user_id)
        END,
        updated_at = NOW()
      WHERE galaxy_id = p_galaxy_id;
    ELSE
      -- Remove user from subscription list
      UPDATE galaxy_newsletter_subscriptions
      SET 
        loomer_ids = array_remove(loomer_ids, p_user_id),
        updated_at = NOW()
      WHERE galaxy_id = p_galaxy_id;
    END IF;
  ELSE
    -- Create new subscription record if subscribing
    IF p_subscribe THEN
      -- Get galaxy newsletter settings
      INSERT INTO galaxy_newsletter_subscriptions (
        galaxy_id,
        loomer_ids,
        email_address,
        app_password,
        content_threshold
      )
      SELECT 
        p_galaxy_id,
        ARRAY[p_user_id],
        newsletter_email,
        newsletter_app_password,
        newsletter_content_threshold
      FROM galaxies
      WHERE id = p_galaxy_id AND newsletter_enabled = TRUE;
    END IF;
  END IF;

  RETURN json_build_object(
    'success', true,
    'subscribed', p_subscribe,
    'message', CASE 
      WHEN p_subscribe THEN 'Successfully subscribed to newsletter'
      ELSE 'Successfully unsubscribed from newsletter'
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

-- Function to update galaxy newsletter settings
CREATE OR REPLACE FUNCTION update_galaxy_newsletter_settings(
  p_user_id UUID,
  p_galaxy_id UUID,
  p_enabled BOOLEAN,
  p_email VARCHAR(255) DEFAULT NULL,
  p_app_password TEXT DEFAULT NULL,
  p_content_threshold INTEGER DEFAULT 10
) RETURNS JSON AS $$
DECLARE
  v_user_role TEXT;
  v_access_level access_level;
BEGIN
  -- Check if user has permission to update galaxy settings
  SELECT gm.role INTO v_user_role
  FROM galaxy_memberships gm
  WHERE gm.user_id = p_user_id AND gm.galaxy_id = p_galaxy_id;

  IF v_user_role IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User is not a member of this galaxy'
    );
  END IF;

  -- Get access level for user's role
  SELECT rm.access_level INTO v_access_level
  FROM role_maps rm
  WHERE rm.galaxy_id = p_galaxy_id AND rm.role = v_user_role;

  -- Check if user has admin access
  IF v_access_level NOT IN ('creator', 'admin') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient permissions'
    );
  END IF;

  -- Update galaxy newsletter settings
  UPDATE galaxies
  SET 
    newsletter_enabled = p_enabled,
    newsletter_email = COALESCE(p_email, newsletter_email),
    newsletter_app_password = COALESCE(p_app_password, newsletter_app_password),
    newsletter_content_threshold = COALESCE(p_content_threshold, newsletter_content_threshold),
    updated_at = NOW()
  WHERE id = p_galaxy_id;

  -- Update or create newsletter subscription record
  INSERT INTO galaxy_newsletter_subscriptions (
    galaxy_id,
    loomer_ids,
    email_address,
    app_password,
    content_threshold
  )
  SELECT 
    p_galaxy_id,
    COALESCE(
      (SELECT array_agg(user_id) FROM galaxy_memberships WHERE galaxy_id = p_galaxy_id AND newsletter_subscribed = TRUE),
      ARRAY[]::UUID[]
    ),
    COALESCE(p_email, newsletter_email),
    COALESCE(p_app_password, newsletter_app_password),
    COALESCE(p_content_threshold, newsletter_content_threshold)
  FROM galaxies
  WHERE id = p_galaxy_id
  ON CONFLICT (galaxy_id) DO UPDATE SET
    email_address = EXCLUDED.email_address,
    app_password = EXCLUDED.app_password,
    content_threshold = EXCLUDED.content_threshold,
    updated_at = NOW();

  RETURN json_build_object(
    'success', true,
    'message', 'Newsletter settings updated successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get galaxy newsletter status and subscription count
CREATE OR REPLACE FUNCTION get_galaxy_newsletter_info(
  p_galaxy_id UUID
) RETURNS JSON AS $$
DECLARE
  v_galaxy RECORD;
  v_subscription_count INTEGER;
  v_current_content_count INTEGER;
BEGIN
  -- Get galaxy newsletter settings
  SELECT * INTO v_galaxy
  FROM galaxies
  WHERE id = p_galaxy_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Galaxy not found'
    );
  END IF;

  -- Get subscription count
  SELECT 
    COALESCE(array_length(loomer_ids, 1), 0),
    current_count
  INTO v_subscription_count, v_current_content_count
  FROM galaxy_newsletter_subscriptions
  WHERE galaxy_id = p_galaxy_id;

  RETURN json_build_object(
    'success', true,
    'newsletter', json_build_object(
      'enabled', v_galaxy.newsletter_enabled,
      'email_configured', v_galaxy.newsletter_email IS NOT NULL,
      'content_threshold', v_galaxy.newsletter_content_threshold,
      'subscription_count', COALESCE(v_subscription_count, 0),
      'current_content_count', COALESCE(v_current_content_count, 0),
      'ready_to_send', COALESCE(v_current_content_count, 0) >= v_galaxy.newsletter_content_threshold
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
