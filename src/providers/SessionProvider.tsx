"use client";

import { SessionProvider as _SessionProvider } from "next-auth/react";

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  return <_SessionProvider>{children}</_SessionProvider>;
}
