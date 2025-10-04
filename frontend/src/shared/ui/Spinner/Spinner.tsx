// frontend/src/shared/ui/Spinner/Spinner.tsx
import { cn } from "../../utils/cn";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  variant?: "primary" | "white";
  fullScreen?: boolean;
  className?: string;
}

export function Spinner({
  size = "md",
  text,
  variant = "primary",
  fullScreen = false,
  className,
}: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const variantClasses = {
    primary: "border-blue-600 dark:border-blue-400",
    white: "border-white",
  };

  const spinnerElement = (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-t-transparent",
          sizeClasses[size],
          variantClasses[variant]
        )}
        role="status"
        aria-label="Загрузка"
      />
      {text && (
        <p
          className={cn(
            "text-sm font-medium",
            variant === "white"
              ? "text-white"
              : "text-gray-600 dark:text-zinc-400"
          )}
        >
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
}
