// frontend/src/shared/components/ErrorBoundary/DefaultErrorFallback.tsx
import { AppError } from '../../api/types';

interface DefaultErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

/**
 * Дефолтный UI для ошибок
 */
export function DefaultErrorFallback({ error, resetError }: DefaultErrorFallbackProps) {
  const isAppError = error instanceof AppError;
  const statusCode = isAppError ? error.statusCode : undefined;

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6 space-y-4">
        {/* Иконка */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Заголовок */}
        <h1 className="text-2xl font-bold text-center text-neutral-900 dark:text-neutral-100">
          Что-то пошло не так
        </h1>

        {/* Сообщение об ошибке */}
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-md p-4">
          <p className="text-sm text-red-800 dark:text-red-200 font-medium">
            {error.message || 'Произошла неизвестная ошибка'}
          </p>

          {statusCode && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              Код ошибки: {statusCode}
            </p>
          )}
        </div>

        {/* Детали для разработки */}
        {import.meta.env.DEV && (
          <details className="text-xs">
            <summary className="cursor-pointer text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100">
              Детали для разработчика
            </summary>
            <pre className="mt-2 p-2 bg-neutral-100 dark:bg-neutral-900 rounded text-neutral-800 dark:text-neutral-200 overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}

        {/* Действия */}
        <div className="flex gap-3">
          <button
            onClick={resetError}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
          >
            Попробовать снова
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className="flex-1 px-4 py-2 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 rounded-md font-medium transition-colors"
          >
            На главную
          </button>
        </div>

        {/* Дополнительная информация */}
        <p className="text-xs text-center text-neutral-500 dark:text-neutral-400">
          Если проблема повторяется, обратитесь в поддержку
        </p>
      </div>
    </div>
  );
}
