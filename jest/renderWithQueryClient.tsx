import React from 'react';

import {
  QueryClient,
  type QueryClientConfig,
  QueryClientProvider,
} from '@tanstack/react-query';
import {
  render,
  type RenderOptions,
  type RenderResult,
} from '@testing-library/react-native';

export function createTestQueryClient(config?: QueryClientConfig) {
  return new QueryClient({
    defaultOptions: {
      mutations: {
        gcTime: Infinity,
        retry: false,
      },
      queries: {
        gcTime: Infinity,
        retry: false,
      },
    },
    ...config,
  });
}

export function renderWithQueryClient(
  ui: React.ReactElement,
  queryClient = createTestQueryClient(),
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult & { queryClient: QueryClient } {
  function Wrapper({ children }: React.PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return {
    queryClient,
    ...render(ui, {
      wrapper: Wrapper,
      ...options,
    }),
  };
}
