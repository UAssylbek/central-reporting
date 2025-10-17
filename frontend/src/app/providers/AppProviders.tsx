// frontend/src/app/providers/AppProviders.tsx
import type { ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * >@=52>9 Provider ?@8;>65=8O
 * 1J548=O5B 2A5 providers 2 >48= :><?>=5=B
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <QueryProvider>
        {children}
      </QueryProvider>
    </ErrorBoundary>
  );
}
