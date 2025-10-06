// frontend/src/shared/ui/ReportCard/ReportCard.tsx
import { cn } from "../../utils/cn";
import type { ReportColorScheme } from "../../types/reports";

export interface ReportCardProps {
  title: string;
  description: string;
  icon: string;
  colorScheme?: ReportColorScheme;
  onClick: () => void;
  disabled?: boolean;
}

const colorSchemes: Record<ReportColorScheme, { bg: string; border: string; hover: string; text: string }> = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    hover: "hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-blue-100 dark:hover:shadow-blue-900/20",
    text: "text-blue-600 dark:text-blue-400",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-200 dark:border-orange-800",
    hover: "hover:border-orange-400 dark:hover:border-orange-600 hover:shadow-orange-100 dark:hover:shadow-orange-900/20",
    text: "text-orange-600 dark:text-orange-400",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-950/30",
    border: "border-green-200 dark:border-green-800",
    hover: "hover:border-green-400 dark:hover:border-green-600 hover:shadow-green-100 dark:hover:shadow-green-900/20",
    text: "text-green-600 dark:text-green-400",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    border: "border-purple-200 dark:border-purple-800",
    hover: "hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-purple-100 dark:hover:shadow-purple-900/20",
    text: "text-purple-600 dark:text-purple-400",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    hover: "hover:border-red-400 dark:hover:border-red-600 hover:shadow-red-100 dark:hover:shadow-red-900/20",
    text: "text-red-600 dark:text-red-400",
  },
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    border: "border-indigo-200 dark:border-indigo-800",
    hover: "hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-indigo-100 dark:hover:shadow-indigo-900/20",
    text: "text-indigo-600 dark:text-indigo-400",
  },
  pink: {
    bg: "bg-pink-50 dark:bg-pink-950/30",
    border: "border-pink-200 dark:border-pink-800",
    hover: "hover:border-pink-400 dark:hover:border-pink-600 hover:shadow-pink-100 dark:hover:shadow-pink-900/20",
    text: "text-pink-600 dark:text-pink-400",
  },
  yellow: {
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    border: "border-yellow-200 dark:border-yellow-800",
    hover: "hover:border-yellow-400 dark:hover:border-yellow-600 hover:shadow-yellow-100 dark:hover:shadow-yellow-900/20",
    text: "text-yellow-600 dark:text-yellow-400",
  },
  cyan: {
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
    border: "border-cyan-200 dark:border-cyan-800",
    hover: "hover:border-cyan-400 dark:hover:border-cyan-600 hover:shadow-cyan-100 dark:hover:shadow-cyan-900/20",
    text: "text-cyan-600 dark:text-cyan-400",
  },
};

export function ReportCard({
  title,
  description,
  icon,
  colorScheme = "blue",
  onClick,
  disabled = false,
}: ReportCardProps) {
  const colors = colorSchemes[colorScheme];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative w-full p-6 rounded-xl border-2 transition-all duration-300",
        "bg-white dark:bg-zinc-900",
        colors.border,
        colors.hover,
        "hover:shadow-lg hover:scale-[1.02]",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer active:scale-[0.98]",
        "text-left"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex items-center justify-center w-16 h-16 rounded-xl mb-4 transition-transform duration-300",
          colors.bg,
          "group-hover:scale-110"
        )}
      >
        <span className="text-4xl">{icon}</span>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className={cn("text-lg font-semibold transition-colors", colors.text)}>
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Arrow indicator */}
      <div
        className={cn(
          "absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0",
          colors.text
        )}
      >
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
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </div>
    </button>
  );
}