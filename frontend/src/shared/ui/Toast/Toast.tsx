// frontend/src/shared/ui/Toast/Toast.tsx
import { useEffect } from "react";
import { cn } from "../../utils/cn";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastProps {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose: () => void;
}

const variantStyles: Record<ToastVariant, string> = {
  success:
    "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
  error:
    "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
  warning:
    "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
  info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
};

const icons: Record<ToastVariant, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

export function Toast({
  message,
  variant = "info",
  duration = 3000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 min-w-[320px] max-w-md",
        "flex items-start gap-3 p-4 rounded-lg border shadow-lg",
        "animate-in slide-in-from-top-5 fade-in duration-300",
        variantStyles[variant]
      )}
      role="alert"
    >
      <span className="text-xl flex-shrink-0">{icons[variant]}</span>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Закрыть"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}