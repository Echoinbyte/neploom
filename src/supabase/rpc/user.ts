// PostgreSQL RPC functions for user management
// All user management logic is now handled by PostgreSQL stored procedures
import { createServerClient } from "@/supabase/server";
import { createBrowserClient } from "@/supabase/client";

export async function completeOnboarding(
  userId: string,
  profileData: {
    bio?: string;
    dob?: string;
    location?: string;
    role?: "reader" | "author" | "both";
    avatar?: string;
    interests?: string[];
    dislikes?: string[];
    vectors?: number[];
  }
) {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc("complete_onboarding", {
    p_user_id: userId,
    p_bio: profileData.bio,
    p_dob: profileData.dob,
    p_location: profileData.location,
    p_role: profileData.role,
    p_avatar: profileData.avatar,
    p_interests: profileData.interests,
    p_dislikes: profileData.dislikes,
    p_vectors: profileData.vectors,
  });

  if (error) {
    console.error("Complete onboarding error:", error);
    return {
      success: false,
      error: "Failed to complete onboarding",
    };
  }

  return data;
}

export async function getUserStats(userId: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc("get_user_stats", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Get user stats error:", error);
    return {
      success: false,
      error: "Failed to get user stats",
    };
  }

  return data;
}

export async function getUserProfile(identifier: string, byUsername = false) {
  const supabase = createBrowserClient();

  try {
    const query = byUsername
      ? supabase.from("loomers").select("*").eq("loomer_name", identifier)
      : supabase.from("loomers").select("*").eq("id", identifier);

    const { data: user, error } = await query.single();

    if (error || !user) {
      throw new Error("User not found");
    }

    // Remove sensitive data for public profiles
    const publicUser = {
      id: user.id,
      loomer_name: user.loomer_name,
      hash_id: user.hash_id,
      bio: user.bio,
      dob: user.dob,
      location: user.location,
      avatar: user.avatar,
      banner: user.banner,
      role: user.role,
      interests: user.interests,
      dislikes: user.dislikes,
      is_verified: user.is_verified,
      stardust: user.stardust,
      level: user.level,
      xp: user.xp,
      aura: user.aura,
      vectors: user.vectors,
      created_at: user.created_at,
    };

    return {
      success: true,
      user: publicUser,
    };
  } catch (error) {
    console.error("Get user profile error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get user profile",
    };
  }
}

export async function searchUsers(query: string, limit = 10) {
  const supabase = createBrowserClient();

  const { data, error } = await supabase.rpc("search_users", {
    p_query: query,
    p_limit: limit,
  });

  if (error) {
    console.error("Search users error:", error);
    return {
      success: false,
      error: "Search failed",
    };
  }

  return data;
}

export async function updateUserXP(userId: string, xpGain: number) {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc("add_user_xp", {
    p_user_id: userId,
    p_xp_amount: xpGain,
  });

  if (error) {
    console.error("Update user XP error:", error);
    return {
      success: false,
      error: "Failed to update XP",
    };
  }

  return data;
}

export async function addUserStardust(userId: string, amount: number) {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc("add_user_stardust", {
    p_user_id: userId,
    p_stardust_amount: amount,
  });

  if (error) {
    console.error("Add user stardust error:", error);
    return {
      success: false,
      error: "Failed to add stardust",
    };
  }

  return data;
}

// Export the updateUserProfile function from auth.ts for convenience
export { updateUserProfile } from "./auth";
