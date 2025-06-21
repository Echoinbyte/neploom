"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface ModeToggleProps {
  children: React.ReactNode;
  mode: "signin" | "signup";
  className?: string;
}

export default function ModeToggle({
  children,
  mode,
  className = "",
}: ModeToggleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleModeChange = () => {
    const params = new URLSearchParams(searchParams);
    params.set("mode", mode);
    router.push(`?${params.toString()}`);
  };

  return (
    <button
      className={`btn transparent ${className}`}
      onClick={handleModeChange}
    >
      {children}
    </button>
  );
}
