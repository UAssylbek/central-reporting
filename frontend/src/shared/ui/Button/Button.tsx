// frontend/src/shared/ui/Button/Button.tsx
import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

type ButtonVariant = "primary" | "accent" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

  const variantClasses = {
    primary:
      "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700",
    accent:
      "bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500 dark:bg-orange-600 dark:hover:bg-orange-700",
    secondary:
      "bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-600 dark:hover:bg-zinc-700",
    danger:
      "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700",
    ghost:
      "bg-transparent text-blue-600 hover:bg-blue-50 focus:ring-blue-500 dark:text-blue-400 dark:hover:bg-zinc-800",
  };

  const sizeClasses = {
    sm: "text-sm px-3 py-2 gap-1.5",
    md: "text-base px-4 py-2.5 gap-2",
    lg: "text-lg px-6 py-3 gap-2",
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!loading && leftIcon && (
        <span className="flex-shrink-0 w-5 h-5">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!loading && rightIcon && (
        <span className="flex-shrink-0 w-5 h-5">{rightIcon}</span>
      )}
    </button>
  );
}
