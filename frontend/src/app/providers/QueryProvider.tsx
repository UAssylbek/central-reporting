// frontend/src/app/providers/QueryProvider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { ReactNode } from 'react';

/**
 * Конфигурация React Query client
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Время, в течение которого данные считаются свежими (5 минут)
      staleTime: 5 * 60 * 1000,

      // Время хранения данных в кэше (10 минут)
      gcTime: 10 * 60 * 1000,

      // Повторная загрузка при фокусе окна
      refetchOnWindowFocus: false,

      // Повторная загрузка при восстановлении соединения
      refetchOnReconnect: true,

      // Количество попыток при ошибке
      retry: 1,

      // Функция retry только для network ошибок
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Показывать ошибки мутаций
      retry: false,
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * Provider для React Query
 * Обеспечивает кэширование и управление состоянием запросов
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools только в development режиме */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}

// Экспортируем queryClient для использования вне React компонентов
// eslint-disable-next-line react-refresh/only-export-components
export { queryClient };
