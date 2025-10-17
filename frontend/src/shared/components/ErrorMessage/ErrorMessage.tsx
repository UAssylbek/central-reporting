// frontend/src/shared/components/ErrorMessage/ErrorMessage.tsx
import { AppError } from '../../api/types';

interface ErrorMessageProps {
  error: Error | AppError | null | undefined;
  title?: string;
  retry?: () => void;
  className?: string;
}

/**
 * Компонент для отображения ошибок API
 *
 * @example
 * ```tsx
 * function UsersList() {
 *   const { data, error, refetch } = useUsers();
 *
 *   if (error) {
 *     return <ErrorMessage error={error} retry={refetch} />;
 *   }
 *
 *   return <UsersTable data={data} />;
 * }
 * ```
 */
export function ErrorMessage({ error, title, retry, className = '' }: ErrorMessageProps) {
  if (!error) return null;

  const isAppError = error instanceof AppError;
  const statusCode = isAppError ? error.statusCode : undefined;
  const message = error.message || 'Произошла ошибка';

  return (
    <div className={`bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        {/* Иконка */}
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Контент */}
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
              {title}
            </h3>
          )}

          <p className="text-sm text-red-700 dark:text-red-300">
            {message}
          </p>

          {statusCode && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              Код ошибки: {statusCode}
            </p>
          )}

          {/* Кнопка повтора */}
          {retry && (
            <button
              onClick={retry}
              className="mt-3 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline"
            >
              Попробовать снова
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Компонент для inline отображения ошибок (меньше, без иконки)
 */
export function ErrorMessageInline({ error, className = '' }: Pick<ErrorMessageProps, 'error' | 'className'>) {
  if (!error) return null;

  return (
    <p className={`text-sm text-red-600 dark:text-red-400 ${className}`}>
      {error.message || 'Произошла ошибка'}
    </p>
  );
}
