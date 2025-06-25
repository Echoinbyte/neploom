-- PostgreSQL functions for authentication and user management
-- These functions handle all business logic for the authentication system

-- Function to create a new user account
CREATE OR REPLACE FUNCTION create_user_account(
  p_email TEXT,
  p_password TEXT,
  p_loomer_name TEXT
) RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_hash_id TEXT;
  v_verification_code TEXT;
  v_password_hash TEXT;
  v_result JSON;
BEGIN
  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM loomers WHERE email = p_email) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User with this email already exists'
    );
  END IF;

  IF EXISTS (SELECT 1 FROM loomers WHERE loomer_name = p_loomer_name) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Username is already taken'
    );
  END IF;

  -- Generate unique hash_id
  v_hash_id := substring(gen_random_uuid()::text, 1, 8);
  WHILE EXISTS (SELECT 1 FROM loomers WHERE hash_id = v_hash_id) LOOP
    v_hash_id := substring(gen_random_uuid()::text, 1, 8);
  END LOOP;

  -- Generate verification code
  v_verification_code := LPAD((FLOOR(RANDOM() * 900000) + 100000)::TEXT, 6, '0');

  -- Hash password using pgcrypto
  v_password_hash := crypt(p_password, gen_salt('bf', 12));

  -- Insert new user
  INSERT INTO loomers (
    email,
    password_hash,
    loomer_name,
    hash_id,
    verification_code,
    verification_expires_at,
    avatar,
    role,
    onboarding_completed,
    is_verified,
    stardust,
    level,
    xp,
    aura,
    interests,
    dislikes
  ) VALUES (
    p_email,
    v_password_hash,
    p_loomer_name,
    v_hash_id,
    v_verification_code,
    NOW() + INTERVAL '15 minutes',
    'default-avatar.png',
    'time',
    false,
    false,
    0,
    1,
    0,
    1,
    ARRAY[]::TEXT[],
    ARRAY[]::TEXT[]
  ) RETURNING id INTO v_user_id;

  -- Return success with user data
  SELECT json_build_object(
    'success', true,
    'user', json_build_object(
      'id', id,
      'email', email,
      'loomer_name', loomer_name,
      'hash_id', hash_id,
      'avatar', avatar,
      'role', role,
      'is_verified', is_verified,
      'onboarding_completed', onboarding_completed,
      'stardust', stardust,
      'level', level,
      'xp', xp,
      'aura', aura,
      'created_at', created_at
    ),
    'verification_code', v_verification_code,
    'message', 'User created successfully. Please verify your email.'
  ) INTO v_result
  FROM loomers WHERE id = v_user_id;

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to authenticate user login
CREATE OR REPLACE FUNCTION authenticate_user(
  p_identifier TEXT,
  p_password TEXT
) RETURNS JSON AS $$
DECLARE
  v_user RECORD;
  v_result JSON;
BEGIN
  -- Find user by email or username
  SELECT * INTO v_user
  FROM loomers
  WHERE email = p_identifier OR loomer_name = p_identifier;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No user found with this email or username'
    );
  END IF;

  -- Check if user is verified
  IF NOT v_user.is_verified THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Please verify your account before logging in'
    );
  END IF;

  -- Verify password
  IF NOT (v_user.password_hash = crypt(p_password, v_user.password_hash)) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Incorrect password'
    );
  END IF;

  -- Update last login timestamp
  UPDATE loomers 
  SET updated_at = NOW() 
  WHERE id = v_user.id;

  -- Return success with user data
  RETURN json_build_object(
    'success', true,
    'user', json_build_object(
      'id', v_user.id,
      'email', v_user.email,
      'loomer_name', v_user.loomer_name,
      'hash_id', v_user.hash_id,
      'avatar', v_user.avatar,
      'role', v_user.role,
      'is_verified', v_user.is_verified,
      'onboarding_completed', v_user.onboarding_completed,
      'stardust', v_user.stardust,
      'level', v_user.level,
      'xp', v_user.xp,
      'aura', v_user.aura,
      'bio', v_user.bio,
      'location', v_user.location,
      'interests', v_user.interests,
      'dislikes', v_user.dislikes
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

-- Function to verify user email
CREATE OR REPLACE FUNCTION verify_user_email(
  p_email TEXT,
  p_verification_code TEXT
) RETURNS JSON AS $$
DECLARE
  v_user RECORD;
BEGIN
  -- Find user with verification code
  SELECT * INTO v_user
  FROM loomers
  WHERE email = p_email;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  IF v_user.is_verified THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Account is already verified'
    );
  END IF;

  IF v_user.verification_code != p_verification_code THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid verification code'
    );
  END IF;

  IF NOW() > v_user.verification_expires_at THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Verification code has expired'
    );
  END IF;

  -- Update user as verified
  UPDATE loomers
  SET 
    is_verified = true,
    verification_code = NULL,
    verification_expires_at = NULL,
    updated_at = NOW()
  WHERE id = v_user.id;

  RETURN json_build_object(
    'success', true,
    'message', 'Account verified successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to resend verification code
CREATE OR REPLACE FUNCTION resend_verification_code(
  p_email TEXT
) RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_verification_code TEXT;
BEGIN
  -- Check if user exists and is not verified
  SELECT id INTO v_user_id
  FROM loomers
  WHERE email = p_email AND NOT is_verified;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found or already verified'
    );
  END IF;

  -- Generate new verification code
  v_verification_code := LPAD((FLOOR(RANDOM() * 900000) + 100000)::TEXT, 6, '0');

  -- Update verification code and expiry
  UPDATE loomers
  SET 
    verification_code = v_verification_code,
    verification_expires_at = NOW() + INTERVAL '15 minutes',
    updated_at = NOW()
  WHERE id = v_user_id;

  RETURN json_build_object(
    'success', true,
    'verification_code', v_verification_code,
    'message', 'Verification code sent successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset password
CREATE OR REPLACE FUNCTION reset_password(
  p_email TEXT,
  p_new_password TEXT,
  p_verification_code TEXT
) RETURNS JSON AS $$
DECLARE
  v_user RECORD;
  v_password_hash TEXT;
BEGIN
  -- Find user with verification code
  SELECT * INTO v_user
  FROM loomers
  WHERE email = p_email;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  IF v_user.verification_code != p_verification_code THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid verification code'
    );
  END IF;

  IF NOW() > v_user.verification_expires_at THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Verification code has expired'
    );
  END IF;

  -- Hash new password
  v_password_hash := crypt(p_new_password, gen_salt('bf', 12));

  -- Update password and clear verification code
  UPDATE loomers
  SET 
    password_hash = v_password_hash,
    verification_code = NULL,
    verification_expires_at = NULL,
    updated_at = NOW()
  WHERE id = v_user.id;

  RETURN json_build_object(
    'success', true,
    'message', 'Password reset successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to change password (authenticated user)
CREATE OR REPLACE FUNCTION change_password(
  p_user_id UUID,
  p_current_password TEXT,
  p_new_password TEXT
) RETURNS JSON AS $$
DECLARE
  v_user RECORD;
  v_password_hash TEXT;
BEGIN
  -- Find user
  SELECT * INTO v_user
  FROM loomers
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Verify current password
  IF NOT (v_user.password_hash = crypt(p_current_password, v_user.password_hash)) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Current password is incorrect'
    );
  END IF;

  -- Hash new password
  v_password_hash := crypt(p_new_password, gen_salt('bf', 12));

  -- Update password
  UPDATE loomers
  SET 
    password_hash = v_password_hash,
    updated_at = NOW()
  WHERE id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Password changed successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create or update user from social login
CREATE OR REPLACE FUNCTION create_or_update_social_user(
  p_email TEXT,
  p_name TEXT,
  p_image TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_user RECORD;
  v_loomer_name TEXT;
  v_hash_id TEXT;
  v_is_new_user BOOLEAN := false;
  v_result JSON;
BEGIN
  -- Check if user exists
  SELECT * INTO v_user FROM loomers WHERE email = p_email;

  IF FOUND THEN
    -- Update existing user's avatar if provided and current avatar is default
    IF p_image IS NOT NULL AND v_user.avatar = 'default-avatar.png' THEN
      UPDATE loomers
      SET 
        avatar = p_image,
        updated_at = NOW()
      WHERE id = v_user.id;
      
      v_user.avatar := p_image;
    END IF;

    -- Return existing user
    RETURN json_build_object(
      'success', true,
      'user', json_build_object(
        'id', v_user.id,
        'email', v_user.email,
        'loomer_name', v_user.loomer_name,
        'hash_id', v_user.hash_id,
        'avatar', v_user.avatar,
        'role', v_user.role,
        'is_verified', v_user.is_verified,
        'onboarding_completed', v_user.onboarding_completed,
        'stardust', v_user.stardust,
        'level', v_user.level,
        'xp', v_user.xp,
        'aura', v_user.aura
      ),
      'is_new_user', false
    );
  END IF;

  -- Create new user from social login
  v_is_new_user := true;
  
  -- Generate unique loomer_name from social name
  v_loomer_name := lower(regexp_replace(p_name, '[^a-zA-Z0-9]', '', 'g'));
  IF length(v_loomer_name) < 3 THEN
    v_loomer_name := 'user' || floor(random() * 10000)::text;
  END IF;
  
  -- Ensure username is unique
  WHILE EXISTS (SELECT 1 FROM loomers WHERE loomer_name = v_loomer_name) LOOP
    v_loomer_name := v_loomer_name || floor(random() * 1000)::text;
  END LOOP;

  -- Generate unique hash_id
  v_hash_id := substring(gen_random_uuid()::text, 1, 8);
  WHILE EXISTS (SELECT 1 FROM loomers WHERE hash_id = v_hash_id) LOOP
    v_hash_id := substring(gen_random_uuid()::text, 1, 8);
  END LOOP;

  -- Insert new user
  INSERT INTO loomers (
    email,
    password_hash,
    loomer_name,
    hash_id,
    avatar,
    role,
    onboarding_completed,
    is_verified,
    stardust,
    level,
    xp,
    aura,
    interests,
    dislikes
  ) VALUES (
    p_email,
    '', -- Social users don't need password
    v_loomer_name,
    v_hash_id,
    COALESCE(p_image, 'default-avatar.png'),
    'time',
    false,
    true, -- Social accounts are auto-verified
    0,
    1,
    0,
    1,
    ARRAY[]::TEXT[],
    ARRAY[]::TEXT[]
  ) RETURNING * INTO v_user;

  -- Return new user data
  RETURN json_build_object(
    'success', true,
    'user', json_build_object(
      'id', v_user.id,
      'email', v_user.email,
      'loomer_name', v_user.loomer_name,
      'hash_id', v_user.hash_id,
      'avatar', v_user.avatar,
      'role', v_user.role,
      'is_verified', v_user.is_verified,
      'onboarding_completed', v_user.onboarding_completed,
      'stardust', v_user.stardust,
      'level', v_user.level,
      'xp', v_user.xp,
      'aura', v_user.aura
    ),
    'is_new_user', true
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
