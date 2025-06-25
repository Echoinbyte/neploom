"use client";

import { useState } from "react";
import { GoEye, GoEyeClosed } from "react-icons/go";

interface PasswordToggleProps {
  fieldName: string;
  placeholder: string;
  className?: string;
  icon: React.ReactNode;
}

export default function PasswordToggle({
  fieldName,
  placeholder,
  className = "",
  icon,
}: PasswordToggleProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  return (
    <div
      className={`input-field bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 relative ${className}`}
    >
      {icon}
      <input
        name={fieldName}
        type={isPasswordVisible ? "text" : "password"}
        placeholder={placeholder}
        required
        minLength={8}
        maxLength={50}
        autoComplete="new-password"
        data-lpignore="true"
        data-form-type="other"
      />{" "}
      <div className="absolute flex h-full items-center right-3 top-0">
        {" "}
        {isPasswordVisible ? (
          <GoEye
            className="inline cursor-pointer text-gray-600 dark:text-gray-400 w-4 h-4"
            onClick={() => setIsPasswordVisible(false)}
          />
        ) : (
          <GoEyeClosed
            className="inline cursor-pointer text-gray-600 dark:text-gray-400 w-4 h-4"
            onClick={() => setIsPasswordVisible(true)}
          />
        )}
      </div>
    </div>
  );
}
