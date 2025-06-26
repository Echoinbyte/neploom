import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { email, name, image } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { success: false, message: "Email and name are required" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Call the create_or_update_social_user RPC function
    const { data, error } = await supabase.rpc("create_or_update_social_user", {
      p_email: email,
      p_name: name,
      p_image: image,
    });

    if (error) {
      console.error("Social user upsert error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to create/update user" },
        { status: 500 }
      );
    }

    if (!data.success) {
      return NextResponse.json(
        { success: false, message: data.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      isNewUser: data.is_new_user,
      message: "User created/updated successfully",
    });
  } catch (error) {
    console.error("One-click login error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
