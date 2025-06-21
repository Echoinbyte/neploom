"use client";

interface SimpleSubmitButtonProps {
  children: React.ReactNode;
  className?: string;
}

export default function SimpleSubmitButton({
  children,
  className = "",
}: SimpleSubmitButtonProps) {
  return (
    <button type="submit" className={`btn ${className}`}>
      {children}
    </button>
  );
}
