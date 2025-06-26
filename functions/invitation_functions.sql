-- PostgreSQL functions for invitation management
-- These functions handle wormhole invitations between users and to galaxies

-- Function to create an invitation
CREATE OR REPLACE FUNCTION create_invitation(
  p_initiator_id UUID,
  p_recipient_id UUID,
  p_travel_kind TEXT, -- 'galaxy' or 'orbit'
  p_destination_id UUID,
  p_proposed_role TEXT DEFAULT NULL,
  p_message TEXT DEFAULT NULL,
  p_expires_in_hours INTEGER DEFAULT 168 -- 7 days default
) RETURNS JSON AS $$
DECLARE
  v_invitation_id UUID;
  v_expires_at TIMESTAMPTZ;
  v_result JSON;
BEGIN
  -- Validate users exist
  IF NOT EXISTS (SELECT 1 FROM loomers WHERE id = p_initiator_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Initiator not found'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM loomers WHERE id = p_recipient_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Recipient not found'
    );
  END IF;

  -- Prevent self-invitation
  IF p_initiator_id = p_recipient_id THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Cannot invite yourself'
    );
  END IF;

  -- Validate travel kind
  IF p_travel_kind NOT IN ('galaxy', 'orbit') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid travel kind. Must be galaxy or orbit'
    );
  END IF;

  -- Validate destination exists based on travel kind
  IF p_travel_kind = 'galaxy' THEN
    IF NOT EXISTS (SELECT 1 FROM galaxies WHERE id = p_destination_id) THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Galaxy not found'
      );
    END IF;
    
    -- Check if initiator is a member of the galaxy with invitation permissions
    IF NOT EXISTS (
      SELECT 1 FROM galaxy_memberships gm
      JOIN role_maps rm ON gm.galaxy_id = rm.galaxy_id AND gm.role = rm.role
      WHERE gm.user_id = p_initiator_id 
      AND gm.galaxy_id = p_destination_id
      AND rm.access_level IN ('creator', 'admin', 'moderator')
    ) THEN
      RETURN json_build_object(
        'success', false,
        'error', 'You do not have permission to invite users to this galaxy'
      );
    END IF;
  ELSIF p_travel_kind = 'orbit' THEN
    IF NOT EXISTS (SELECT 1 FROM loomers WHERE id = p_destination_id) THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Destination user not found'
      );
    END IF;
  END IF;

  -- Check for existing pending invitation
  IF EXISTS (
    SELECT 1 FROM invitations
    WHERE initiator_id = p_initiator_id
    AND recipient_id = p_recipient_id
    AND travel_kind = p_travel_kind
    AND destination_id = p_destination_id
    AND status = 'pending'
    AND expires_at > NOW()
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'A pending invitation already exists'
    );
  END IF;

  -- Calculate expiration time
  v_expires_at := NOW() + (p_expires_in_hours || ' hours')::INTERVAL;

  -- Create invitation
  INSERT INTO invitations (
    initiator_id,
    recipient_id,
    travel_kind,
    destination_id,
    proposed_role,
    message,
    expires_at
  ) VALUES (
    p_initiator_id,
    p_recipient_id,
    p_travel_kind,
    p_destination_id,
    p_proposed_role,
    p_message,
    v_expires_at
  ) RETURNING id INTO v_invitation_id;

  -- Get invitation details with related data
  SELECT json_build_object(
    'success', true,
    'invitation', json_build_object(
      'id', i.id,
      'travel_kind', i.travel_kind,
      'proposed_role', i.proposed_role,
      'message', i.message,
      'status', i.status,
      'created_at', i.created_at,
      'expires_at', i.expires_at,
      'initiator', json_build_object(
        'id', l1.id,
        'loomer_name', l1.loomer_name,
        'hash_id', l1.hash_id,
        'avatar', l1.avatar
      ),
      'recipient', json_build_object(
        'id', l2.id,
        'loomer_name', l2.loomer_name,
        'hash_id', l2.hash_id,
        'avatar', l2.avatar
      ),
      'destination', CASE 
        WHEN i.travel_kind = 'galaxy' THEN
          json_build_object(
            'id', g.id,
            'slug', g.slug,
            'type', g.type,
            'logo', g.logo,
            'lore', g.lore
          )
        ELSE
          json_build_object(
            'id', l3.id,
            'loomer_name', l3.loomer_name,
            'hash_id', l3.hash_id,
            'avatar', l3.avatar
          )
      END
    ),
    'message', 'Invitation created successfully'
  ) INTO v_result
  FROM invitations i
  JOIN loomers l1 ON i.initiator_id = l1.id
  JOIN loomers l2 ON i.recipient_id = l2.id
  LEFT JOIN galaxies g ON i.travel_kind = 'galaxy' AND i.destination_id = g.id
  LEFT JOIN loomers l3 ON i.travel_kind = 'orbit' AND i.destination_id = l3.id
  WHERE i.id = v_invitation_id;

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to respond to an invitation
CREATE OR REPLACE FUNCTION respond_to_invitation(
  p_invitation_id UUID,
  p_recipient_id UUID,
  p_response invitation_status -- 'accepted' or 'declined'
) RETURNS JSON AS $$
DECLARE
  v_invitation RECORD;
  v_result JSON;
BEGIN
  -- Validate response
  IF p_response NOT IN ('accepted', 'declined') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid response. Must be accepted or declined'
    );
  END IF;

  -- Get invitation
  SELECT * INTO v_invitation
  FROM invitations
  WHERE id = p_invitation_id
  AND recipient_id = p_recipient_id
  AND status = 'pending'
  AND expires_at > NOW();

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invitation not found, expired, or already responded to'
    );
  END IF;

  -- Update invitation status
  UPDATE invitations
  SET status = p_response
  WHERE id = p_invitation_id;

  -- Handle acceptance actions
  IF p_response = 'accepted' THEN
    IF v_invitation.travel_kind = 'galaxy' THEN
      -- Join galaxy using the join_galaxy function
      SELECT * INTO v_result
      FROM json_populate_record(NULL::RECORD, (
        SELECT join_galaxy(
          p_recipient_id,
          v_invitation.destination_id,
          p_invitation_id
        )
      )::JSON) AS (success BOOLEAN);
      
      IF NOT (v_result->>'success')::BOOLEAN THEN
        -- Rollback invitation status if galaxy join failed
        UPDATE invitations SET status = 'pending' WHERE id = p_invitation_id;
        RETURN v_result;
      END IF;
    ELSIF v_invitation.travel_kind = 'orbit' THEN
      -- Create connection (follow) using create_user_connection function
      SELECT * INTO v_result
      FROM json_populate_record(NULL::RECORD, (
        SELECT create_user_connection(
          p_recipient_id,
          v_invitation.destination_id,
          'moon'::connection_type
        )
      )::JSON) AS (success BOOLEAN);
      
      IF NOT (v_result->>'success')::BOOLEAN THEN
        -- Rollback invitation status if connection failed
        UPDATE invitations SET status = 'pending' WHERE id = p_invitation_id;
        RETURN v_result;
      END IF;
    END IF;
  END IF;

  RETURN json_build_object(
    'success', true,
    'response', p_response,
    'invitation_id', p_invitation_id,
    'message', CASE 
      WHEN p_response = 'accepted' THEN 'Invitation accepted successfully'
      ELSE 'Invitation declined'
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

-- Function to get user's invitations
CREATE OR REPLACE FUNCTION get_user_invitations(
  p_user_id UUID,
  p_type TEXT DEFAULT 'received', -- 'received', 'sent', or 'all'
  p_status invitation_status DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
) RETURNS JSON AS $$
DECLARE
  v_invitations JSONB;
  v_total_count INTEGER;
  v_where_clause TEXT;
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM loomers WHERE id = p_user_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Build where clause based on type
  v_where_clause := CASE p_type
    WHEN 'received' THEN 'i.recipient_id = $1'
    WHEN 'sent' THEN 'i.initiator_id = $1'
    WHEN 'all' THEN '(i.recipient_id = $1 OR i.initiator_id = $1)'
    ELSE 'i.recipient_id = $1'
  END;

  -- Get invitations with details
  EXECUTE format('
    WITH invitation_data AS (
      SELECT 
        i.id,
        i.travel_kind,
        i.proposed_role,
        i.message,
        i.status,
        i.created_at,
        i.expires_at,
        l1.id as initiator_id,
        l1.loomer_name as initiator_name,
        l1.hash_id as initiator_hash,
        l1.avatar as initiator_avatar,
        l2.id as recipient_id,
        l2.loomer_name as recipient_name,
        l2.hash_id as recipient_hash,
        l2.avatar as recipient_avatar,
        CASE 
          WHEN i.travel_kind = ''galaxy'' THEN
            json_build_object(
              ''id'', g.id,
              ''slug'', g.slug,
              ''type'', g.type,
              ''logo'', g.logo,
              ''lore'', g.lore
            )
          ELSE
            json_build_object(
              ''id'', l3.id,
              ''loomer_name'', l3.loomer_name,
              ''hash_id'', l3.hash_id,
              ''avatar'', l3.avatar
            )
        END as destination_data
      FROM invitations i
      JOIN loomers l1 ON i.initiator_id = l1.id
      JOIN loomers l2 ON i.recipient_id = l2.id
      LEFT JOIN galaxies g ON i.travel_kind = ''galaxy'' AND i.destination_id = g.id
      LEFT JOIN loomers l3 ON i.travel_kind = ''orbit'' AND i.destination_id = l3.id
      WHERE %s
      AND ($2 IS NULL OR i.status = $2)
      ORDER BY i.created_at DESC
      LIMIT $3 OFFSET $4
    )
    SELECT 
      COALESCE(json_agg(
        json_build_object(
          ''id'', id,
          ''travel_kind'', travel_kind,
          ''proposed_role'', proposed_role,
          ''message'', message,
          ''status'', status,
          ''created_at'', created_at,
          ''expires_at'', expires_at,
          ''initiator'', json_build_object(
            ''id'', initiator_id,
            ''loomer_name'', initiator_name,
            ''hash_id'', initiator_hash,
            ''avatar'', initiator_avatar
          ),
          ''recipient'', json_build_object(
            ''id'', recipient_id,
            ''loomer_name'', recipient_name,
            ''hash_id'', recipient_hash,
            ''avatar'', recipient_avatar
          ),
          ''destination'', destination_data
        )
      ), ''[]''::json)
    FROM invitation_data', v_where_clause)
  INTO v_invitations
  USING p_user_id, p_status, p_limit, p_offset;

  -- Get total count
  EXECUTE format('
    SELECT COUNT(*)
    FROM invitations i
    WHERE %s
    AND ($2 IS NULL OR i.status = $2)', v_where_clause)
  INTO v_total_count
  USING p_user_id, p_status;

  RETURN json_build_object(
    'success', true,
    'invitations', v_invitations,
    'total_count', v_total_count,
    'type', p_type,
    'status_filter', p_status,
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

-- Function to cancel an invitation
CREATE OR REPLACE FUNCTION cancel_invitation(
  p_invitation_id UUID,
  p_user_id UUID
) RETURNS JSON AS $$
DECLARE
  v_invitation RECORD;
BEGIN
  -- Get invitation
  SELECT * INTO v_invitation
  FROM invitations
  WHERE id = p_invitation_id
  AND initiator_id = p_user_id
  AND status = 'pending';

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invitation not found or cannot be cancelled'
    );
  END IF;

  -- Update invitation status to expired
  UPDATE invitations
  SET status = 'expired'
  WHERE id = p_invitation_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Invitation cancelled successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS JSON AS $$
DECLARE
  v_cleaned_count INTEGER;
BEGIN
  -- Update expired invitations
  UPDATE invitations
  SET status = 'expired'
  WHERE status = 'pending'
  AND expires_at <= NOW();

  GET DIAGNOSTICS v_cleaned_count = ROW_COUNT;

  RETURN json_build_object(
    'success', true,
    'cleaned_count', v_cleaned_count,
    'message', 'Expired invitations cleaned up'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
