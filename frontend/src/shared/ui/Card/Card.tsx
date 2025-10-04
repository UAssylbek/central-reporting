import { type ReactNode } from "react";
import { cn } from "../../utils/cn";

interface CardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  hoverable?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Card({
  title,
  description,
  children,
  footer,
  hoverable = false,
  onClick,
  className,
}: CardProps) {
  const isClickable = !!onClick;

  return (
    <div
      className={cn(
        "bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm overflow-hidden",
        (hoverable || isClickable) &&
          "hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {(title || description) && (
        <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-700">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="px-6 py-4">{children}</div>

      {footer && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-700">
          {footer}
        </div>
      )}
    </div>
  );
}
