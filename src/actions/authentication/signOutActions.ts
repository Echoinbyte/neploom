"use server";

import { signOut } from "next-auth/react";
import { redirect } from "next/navigation";

export async function signOutAction() {
  try {
    await signOut({
      redirect: false,
      callbackUrl: "/authentication",
    });

    // Redirect to authentication page
    redirect("/authentication");
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
}

export async function signOutAndRedirectAction(
  callbackUrl: string = "/authentication"
) {
  try {
    await signOut({
      redirect: false,
      callbackUrl,
    });

    redirect(callbackUrl);
  } catch (error) {
    console.error("Sign out and redirect error:", error);
    throw error;
  }
}
