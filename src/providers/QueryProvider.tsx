import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes - faster refresh for pricing data
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2, // Fewer retries for faster feedback
      retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 5000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true, // Refetch on reconnect for fresh data
      refetchOnMount: true,
      networkMode: 'always',
    },
  },
});

// Export the queryClient for manual cache operations
export { queryClient };

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}