import { type ReactNode } from "react";
import { cn } from "../../utils/cn";

type BadgeVariant =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "gray";
type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  onRemove?: () => void;
  children: ReactNode;
  className?: string;
}

export function Badge({
  variant = "gray",
  size = "md",
  icon,
  onRemove,
  children,
  className,
}: BadgeProps) {
  const variantClasses = {
    primary:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    success:
      "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    warning:
      "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
    danger:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
    info: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    gray: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-zinc-700 dark:text-zinc-300 dark:border-zinc-600",
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const iconSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full border",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {icon && (
        <span className={cn("flex-shrink-0", iconSizeClasses[size])}>
          {icon}
        </span>
      )}
      <span className="leading-none">{children}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="flex-shrink-0 hover:bg-black/10 rounded-full p-0.5 transition-colors"
          aria-label="Удалить"
        >
          <svg
            className={iconSizeClasses[size]}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
}
