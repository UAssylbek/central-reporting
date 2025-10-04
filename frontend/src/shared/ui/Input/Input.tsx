// frontend/src/shared/ui/Input/Input.tsx
import { type InputHTMLAttributes, type ReactNode, useState } from "react";
import { cn } from "../../utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  type = "text",
  className,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className={cn("space-y-1", fullWidth && "w-full")}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500">
            {leftIcon}
          </div>
        )}

        <input
          type={inputType}
          className={cn(
            "block w-full rounded-lg border transition-colors",
            "bg-white dark:bg-zinc-800",
            "text-gray-900 dark:text-white",
            "placeholder-gray-400 dark:placeholder-zinc-500",
            error
              ? "border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 dark:border-zinc-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500",
            "focus:outline-none focus:ring-2 focus:ring-opacity-50",
            "disabled:bg-gray-100 dark:disabled:bg-zinc-900 disabled:text-gray-500 dark:disabled:text-zinc-600 disabled:cursor-not-allowed",
            leftIcon ? "pl-10" : "pl-3",
            rightIcon || isPassword ? "pr-10" : "pr-3",
            "py-2",
            className
          )}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-400 transition-colors"
          >
            {showPassword ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        )}

        {!isPassword && rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500">
            {rightIcon}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-zinc-400">{helperText}</p>
      )}
    </div>
  );
}
