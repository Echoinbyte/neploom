-- PostgreSQL functions for content management (quicks, looms, etc.)
-- These functions handle all business logic for content creation and management

-- Function to create a new quick
CREATE OR REPLACE FUNCTION create_quick(
  p_creator_id UUID,
  p_slug TEXT,
  p_content TEXT,
  p_images TEXT[] DEFAULT NULL,
  p_visibility content_visibility DEFAULT 'published',
  p_is_requick BOOLEAN DEFAULT FALSE,
  p_original_quick_id UUID DEFAULT NULL,
  p_requick_comment TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_quick_id UUID;
  v_result JSON;
BEGIN
  -- Validate creator exists
  IF NOT EXISTS (SELECT 1 FROM loomers WHERE id = p_creator_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Creator not found'
    );
  END IF;

  -- Check if slug is unique
  IF EXISTS (SELECT 1 FROM quicks WHERE slug = p_slug) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Slug already exists'
    );
  END IF;

  -- For requicks, validate original quick exists
  IF p_is_requick AND p_original_quick_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM quicks WHERE id = p_original_quick_id) THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Original quick not found'
      );
    END IF;
    
    -- Check if user is not requicking their own content
    IF EXISTS (SELECT 1 FROM quicks WHERE id = p_original_quick_id AND creator_id = p_creator_id) THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Cannot requick your own content'
      );
    END IF;
  END IF;

  -- Insert new quick
  INSERT INTO quicks (
    creator_id,
    slug,
    content,
    images,
    visibility,
    is_requick,
    original_quick_id,
    requick_comment
  ) VALUES (
    p_creator_id,
    p_slug,
    p_content,
    p_images,
    p_visibility,
    p_is_requick,
    p_original_quick_id,
    p_requick_comment
  ) RETURNING id INTO v_quick_id;

  -- Return success with quick data
  SELECT json_build_object(
    'success', true,
    'quick', json_build_object(
      'id', q.id,
      'creator_id', q.creator_id,
      'slug', q.slug,
      'content', q.content,
      'images', q.images,
      'visibility', q.visibility,
      'is_requick', q.is_requick,
      'original_quick_id', q.original_quick_id,
      'requick_comment', q.requick_comment,
      'created_at', q.created_at,
      'creator', json_build_object(
        'id', l.id,
        'loomer_name', l.loomer_name,
        'hash_id', l.hash_id,
        'avatar', l.avatar,
        'is_verified', l.is_verified
      )
    ),
    'message', CASE 
      WHEN p_is_requick THEN 'Quick requicked successfully'
      ELSE 'Quick created successfully'
    END
  ) INTO v_result
  FROM quicks q
  LEFT JOIN loomers l ON q.creator_id = l.id
  WHERE q.id = v_quick_id;

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get quick details with creator and original quick info
CREATE OR REPLACE FUNCTION get_quick_details(
  p_quick_id UUID
) RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Get quick with creator and original quick details
  SELECT json_build_object(
    'success', true,
    'quick', json_build_object(
      'id', q.id,
      'slug', q.slug,
      'content', q.content,
      'images', q.images,
      'visibility', q.visibility,
      'is_requick', q.is_requick,
      'requick_comment', q.requick_comment,
      'created_at', q.created_at,
      'creator', json_build_object(
        'id', l.id,
        'loomer_name', l.loomer_name,
        'hash_id', l.hash_id,
        'avatar', l.avatar,
        'is_verified', l.is_verified
      ),
      'original_quick', CASE 
        WHEN q.is_requick AND oq.id IS NOT NULL THEN json_build_object(
          'id', oq.id,
          'slug', oq.slug,
          'content', oq.content,
          'images', oq.images,
          'created_at', oq.created_at,
          'creator', json_build_object(
            'id', ol.id,
            'loomer_name', ol.loomer_name,
            'hash_id', ol.hash_id,
            'avatar', ol.avatar,
            'is_verified', ol.is_verified
          )
        )
        ELSE NULL
      END,
      'stats', json_build_object(
        'likes_count', (SELECT COUNT(*) FROM likes WHERE content_type = 'quick' AND content_id = q.id),
        'comments_count', (SELECT COUNT(*) FROM comments WHERE content_type = 'quick' AND content_id = q.id),
        'requicks_count', (SELECT COUNT(*) FROM quicks WHERE original_quick_id = q.id)
      )
    )
  ) INTO v_result
  FROM quicks q
  LEFT JOIN loomers l ON q.creator_id = l.id
  LEFT JOIN quicks oq ON q.original_quick_id = oq.id
  LEFT JOIN loomers ol ON oq.creator_id = ol.id
  WHERE q.id = p_quick_id;

  IF v_result IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Quick not found'
    );
  END IF;

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a quick
CREATE OR REPLACE FUNCTION delete_quick(
  p_quick_id UUID,
  p_user_id UUID
) RETURNS JSON AS $$
DECLARE
  v_quick RECORD;
BEGIN
  -- Get quick details
  SELECT * INTO v_quick FROM quicks WHERE id = p_quick_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Quick not found'
    );
  END IF;

  -- Check if user owns the quick
  IF v_quick.creator_id != p_user_id THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Unauthorized to delete this quick'
    );
  END IF;

  -- Delete the quick (this will also cascade delete any requicks due to foreign key)
  DELETE FROM quicks WHERE id = p_quick_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Quick deleted successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get feed of quicks (including requicks)
CREATE OR REPLACE FUNCTION get_quicks_feed(
  p_user_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Get quicks feed with creator and original quick info
  SELECT json_build_object(
    'success', true,
    'quicks', json_agg(
      json_build_object(
        'id', q.id,
        'slug', q.slug,
        'content', q.content,
        'images', q.images,
        'visibility', q.visibility,
        'is_requick', q.is_requick,
        'requick_comment', q.requick_comment,
        'created_at', q.created_at,
        'creator', json_build_object(
          'id', l.id,
          'loomer_name', l.loomer_name,
          'hash_id', l.hash_id,
          'avatar', l.avatar,
          'is_verified', l.is_verified
        ),
        'original_quick', CASE 
          WHEN q.is_requick AND oq.id IS NOT NULL THEN json_build_object(
            'id', oq.id,
            'slug', oq.slug,
            'content', oq.content,
            'images', oq.images,
            'created_at', oq.created_at,
            'creator', json_build_object(
              'id', ol.id,
              'loomer_name', ol.loomer_name,
              'hash_id', ol.hash_id,
              'avatar', ol.avatar,
              'is_verified', ol.is_verified
            )
          )
          ELSE NULL
        END,
        'stats', json_build_object(
          'likes_count', (SELECT COUNT(*) FROM likes WHERE content_type = 'quick' AND content_id = q.id),
          'comments_count', (SELECT COUNT(*) FROM comments WHERE content_type = 'quick' AND content_id = q.id),
          'requicks_count', (SELECT COUNT(*) FROM quicks WHERE original_quick_id = q.id)
        ),
        'user_interactions', CASE 
          WHEN p_user_id IS NOT NULL THEN json_build_object(
            'liked', EXISTS(SELECT 1 FROM likes WHERE user_id = p_user_id AND content_type = 'quick' AND content_id = q.id),
            'requicked', EXISTS(SELECT 1 FROM quicks WHERE creator_id = p_user_id AND original_quick_id = q.id)
          )
          ELSE NULL
        END
      ) ORDER BY q.created_at DESC
    ),
    'pagination', json_build_object(
      'limit', p_limit,
      'offset', p_offset,
      'total', (SELECT COUNT(*) FROM quicks WHERE visibility = 'published')
    )
  ) INTO v_result
  FROM quicks q
  LEFT JOIN loomers l ON q.creator_id = l.id
  LEFT JOIN quicks oq ON q.original_quick_id = oq.id
  LEFT JOIN loomers ol ON oq.creator_id = ol.id
  WHERE q.visibility = 'published'
  ORDER BY q.created_at DESC
  LIMIT p_limit OFFSET p_offset;

  RETURN COALESCE(v_result, json_build_object(
    'success', true,
    'quicks', '[]'::json,
    'pagination', json_build_object(
      'limit', p_limit,
      'offset', p_offset,
      'total', 0
    )
  ));

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's quicks and requicks
CREATE OR REPLACE FUNCTION get_user_quicks(
  p_user_id UUID,
  p_include_requicks BOOLEAN DEFAULT TRUE,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
) RETURNS JSON AS $$
DECLARE
  v_result JSON;
  v_where_clause TEXT;
BEGIN
  -- Build where clause based on include_requicks parameter
  v_where_clause := 'q.creator_id = $1';
  IF NOT p_include_requicks THEN
    v_where_clause := v_where_clause || ' AND q.is_requick = FALSE';
  END IF;

  -- Get user's quicks with creator and original quick info
  EXECUTE format('
    SELECT json_build_object(
      ''success'', true,
      ''quicks'', COALESCE(json_agg(
        json_build_object(
          ''id'', q.id,
          ''slug'', q.slug,
          ''content'', q.content,
          ''images'', q.images,
          ''visibility'', q.visibility,
          ''is_requick'', q.is_requick,
          ''requick_comment'', q.requick_comment,
          ''created_at'', q.created_at,
          ''creator'', json_build_object(
            ''id'', l.id,
            ''loomer_name'', l.loomer_name,
            ''hash_id'', l.hash_id,
            ''avatar'', l.avatar,
            ''is_verified'', l.is_verified
          ),
          ''original_quick'', CASE 
            WHEN q.is_requick AND oq.id IS NOT NULL THEN json_build_object(
              ''id'', oq.id,
              ''slug'', oq.slug,
              ''content'', oq.content,
              ''images'', oq.images,
              ''created_at'', oq.created_at,
              ''creator'', json_build_object(
                ''id'', ol.id,
                ''loomer_name'', ol.loomer_name,
                ''hash_id'', ol.hash_id,
                ''avatar'', ol.avatar,
                ''is_verified'', ol.is_verified
              )
            )
            ELSE NULL
          END,
          ''stats'', json_build_object(
            ''likes_count'', (SELECT COUNT(*) FROM likes WHERE content_type = ''quick'' AND content_id = q.id),
            ''comments_count'', (SELECT COUNT(*) FROM comments WHERE content_type = ''quick'' AND content_id = q.id),
            ''requicks_count'', (SELECT COUNT(*) FROM quicks WHERE original_quick_id = q.id)
          )
        ) ORDER BY q.created_at DESC
      ), ''[]''::json),
      ''pagination'', json_build_object(
        ''limit'', $3,
        ''offset'', $4,
        ''total'', (SELECT COUNT(*) FROM quicks WHERE %s)
      )
    )
    FROM quicks q
    LEFT JOIN loomers l ON q.creator_id = l.id
    LEFT JOIN quicks oq ON q.original_quick_id = oq.id
    LEFT JOIN loomers ol ON oq.creator_id = ol.id
    WHERE %s
    ORDER BY q.created_at DESC
    LIMIT $3 OFFSET $4
  ', v_where_clause, v_where_clause)
  INTO v_result
  USING p_user_id, p_include_requicks, p_limit, p_offset;

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a pair with optional quiz options
CREATE OR REPLACE FUNCTION create_pair(
  p_term TEXT,
  p_definition TEXT,
  p_options JSONB DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_pair_id UUID;
BEGIN
  -- Validate options for quiz type
  IF p_options IS NOT NULL THEN
    -- Ensure options is an array with at least 2 items
    IF NOT (jsonb_typeof(p_options) = 'array' AND jsonb_array_length(p_options) >= 2) THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Quiz options must be an array with at least 2 items'
      );
    END IF;
  END IF;

  -- Create the pair
  INSERT INTO pairs (term, definition, options)
  VALUES (p_term, p_definition, p_options)
  RETURNING id INTO v_pair_id;

  RETURN json_build_object(
    'success', true,
    'pair_id', v_pair_id,
    'message', 'Pair created successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a spark with validation for quiz types
CREATE OR REPLACE FUNCTION create_spark(
  p_creator_id UUID,
  p_slug TEXT,
  p_name TEXT,
  p_type spark_type,
  p_pair_id UUID DEFAULT NULL,
  p_visibility content_visibility DEFAULT 'published'
) RETURNS JSON AS $$
DECLARE
  v_spark_id UUID;
  v_pair RECORD;
BEGIN
  -- Validate creator exists
  IF NOT EXISTS (SELECT 1 FROM loomers WHERE id = p_creator_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Creator not found'
    );
  END IF;

  -- Check if slug is unique
  IF EXISTS (SELECT 1 FROM sparks WHERE slug = p_slug) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Slug already exists'
    );
  END IF;

  -- Validate quiz requirements
  IF p_type = 'quiz' THEN
    IF p_pair_id IS NULL THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Quiz type sparks must have an associated pair'
      );
    END IF;

    -- Check if the pair has valid options
    SELECT * INTO v_pair FROM pairs WHERE id = p_pair_id;
    
    IF NOT FOUND THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Associated pair not found'
      );
    END IF;

    IF v_pair.options IS NULL OR jsonb_array_length(v_pair.options) < 2 THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Quiz type sparks must have associated pairs with at least 2 options'
      );
    END IF;
  END IF;

  -- Validate pair exists if provided
  IF p_pair_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pairs WHERE id = p_pair_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Associated pair not found'
    );
  END IF;

  -- Create the spark
  INSERT INTO sparks (creator_id, slug, name, type, pair_id, visibility)
  VALUES (p_creator_id, p_slug, p_name, p_type, p_pair_id, p_visibility)
  RETURNING id INTO v_spark_id;

  RETURN json_build_object(
    'success', true,
    'spark_id', v_spark_id,
    'message', 'Spark created successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update a pair with options validation
CREATE OR REPLACE FUNCTION update_pair(
  p_pair_id UUID,
  p_term TEXT DEFAULT NULL,
  p_definition TEXT DEFAULT NULL,
  p_options JSONB DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_associated_quiz_sparks INTEGER;
BEGIN
  -- Check if pair exists
  IF NOT EXISTS (SELECT 1 FROM pairs WHERE id = p_pair_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Pair not found'
    );
  END IF;

  -- If updating options, validate them
  IF p_options IS NOT NULL THEN
    IF NOT (jsonb_typeof(p_options) = 'array' AND jsonb_array_length(p_options) >= 2) THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Quiz options must be an array with at least 2 items'
      );
    END IF;
  END IF;

  -- Check if this pair is used by quiz-type sparks
  SELECT COUNT(*) INTO v_associated_quiz_sparks
  FROM sparks
  WHERE pair_id = p_pair_id AND type = 'quiz';

  -- If removing options but quiz sparks depend on them, prevent the update
  IF p_options IS NULL AND v_associated_quiz_sparks > 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Cannot remove options from a pair that is used by quiz-type sparks'
    );
  END IF;

  -- Update the pair
  UPDATE pairs
  SET 
    term = COALESCE(p_term, term),
    definition = COALESCE(p_definition, definition),
    options = COALESCE(p_options, options)
  WHERE id = p_pair_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Pair updated successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
