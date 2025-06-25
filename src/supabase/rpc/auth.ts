// PostgreSQL RPC functions for authentication
// All authentication logic is now handled by PostgreSQL stored procedures
import { createServerClient } from "@/supabase/server";
import { createBrowserClient } from "@/supabase/client";

// Server-side RPC function wrappers
export async function createUser(userData: {
  email: string;
  password: string;
  loomerName: string;
}) {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc("create_user_account", {
    p_email: userData.email,
    p_password: userData.password,
    p_loomer_name: userData.loomerName,
  });

  if (error) {
    console.error("Create user error:", error);
    return {
      success: false,
      error: "Failed to create user account",
    };
  }

  // Return the data directly as it already contains the success property
  return data;
}

export async function authenticateUser(credentials: {
  identifier: string;
  password: string;
}) {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc("authenticate_user", {
    p_identifier: credentials.identifier,
    p_password: credentials.password,
  });

  if (error) {
    console.error("Authentication error:", error);
    return {
      success: false,
      error: "Authentication failed",
    };
  }

  return data;
}

export async function verifyUserEmail(email: string, verificationCode: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc("verify_user_email", {
    p_email: email,
    p_verification_code: verificationCode,
  });

  if (error) {
    console.error("Verification error:", error);
    return {
      success: false,
      error: "Email verification failed",
    };
  }

  return data;
}

export async function resendVerificationCode(email: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc("resend_verification_code", {
    p_email: email,
  });

  if (error) {
    console.error("Resend verification error:", error);
    return {
      success: false,
      error: "Failed to resend verification code",
    };
  }

  return data;
}

export async function createOrUpdateSocialUser(socialData: {
  email: string;
  name: string;
  image?: string;
}) {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc("create_or_update_social_user", {
    p_email: socialData.email,
    p_name: socialData.name,
    p_image: socialData.image,
  });

  if (error) {
    console.error("Social user creation error:", error);
    return {
      success: false,
      error: "Failed to create/update social user",
    };
  }

  return data;
}

export async function updateUserProfile(
  userId: string,
  updateData: {
    bio?: string;
    location?: string;
    avatar?: string;
    interests?: string[];
    dislikes?: string[];
  }
) {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc("update_user_profile", {
    p_user_id: userId,
    p_bio: updateData.bio,
    p_location: updateData.location,
    p_avatar: updateData.avatar,
    p_interests: updateData.interests,
    p_dislikes: updateData.dislikes,
  });

  if (error) {
    console.error("Profile update error:", error);
    return {
      success: false,
      error: "Failed to update profile",
    };
  }

  return data;
}

// Client-side helper functions
export async function getUserById(userId: string) {
  const supabase = createBrowserClient();

  const { data: user, error } = await supabase
    .from("loomers")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Get user error:", error);
    return null;
  }

  return user;
}

export async function getUserByUsername(username: string) {
  const supabase = createBrowserClient();

  const { data: user, error } = await supabase
    .from("loomers")
    .select("*")
    .eq("loomer_name", username)
    .single();

  if (error) {
    console.error("Get user by username error:", error);
    return null;
  }

  return user;
}
