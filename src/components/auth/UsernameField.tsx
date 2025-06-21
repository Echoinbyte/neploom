"use client";

import { useState, useEffect } from "react";
import { FaCheck, FaXmark } from "react-icons/fa6";
import { Loader2, User } from "lucide-react";

interface UsernameFieldProps {
  className?: string;
}

export default function UsernameField({ className = "" }: UsernameFieldProps) {
  const [username, setUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [message, setMessage] = useState("");
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (username.length > 0) {
      setIsChecking(true);
      const timer = setTimeout(async () => {
        // Simulate username validation
        const isUnique = !["admin", "user", "test"].includes(
          username.toLowerCase()
        );
        setIsValid(isUnique);
        setMessage(isUnique ? "Username is unique" : "Username is taken");
        setIsChecking(false);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setMessage("");
      setIsValid(false);
    }
  }, [username]);
  return (
    <div
      className={`input-field bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 relative ${className}`}
    >
      <User className="icon text-gray-600 dark:text-gray-300" />
      <input
        name="username"
        type="text"
        placeholder="Username"
        className="text-gray-800 dark:text-gray-50 bg-transparent focus:outline-none"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        minLength={2}
        maxLength={20}
        pattern="^[a-zA-Z0-9_]+$"
        autoComplete="new-password"
        data-lpignore="true"
        data-form-type="other"
      />
      <div className="absolute flex h-full items-center right-3 top-0">
        {" "}
        {isChecking && (
          <Loader2 className="animate-spin w-4 h-4 text-gray-500 dark:text-gray-400" />
        )}
        {!isChecking &&
          message &&
          (isValid ? (
            <FaCheck className="text-green-500 w-4 h-4" />
          ) : (
            <FaXmark className="text-red-500 w-4 h-4" />
          ))}
      </div>
    </div>
  );
}
