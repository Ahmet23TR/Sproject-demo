'use client';

import { useState, useCallback, useRef } from 'react';
import { useToast } from '../components/ui/ToastProvider';

export interface AsyncActionState<T = unknown> {
  loading: boolean;
  error: string | null;
  data: T | null;
}

export interface AsyncActionReturn<T = unknown> extends AsyncActionState<T> {
  run: (...args: unknown[]) => Promise<T>;
  reset: () => void;
}

export function useAsyncAction<T = unknown>(
  asyncFn: (...args: unknown[]) => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    showToastOnError?: boolean;
    showToastOnSuccess?: boolean;
    successMessage?: string;
    errorMessage?: string;
  }
): AsyncActionReturn<T> {
  const [state, setState] = useState<AsyncActionState<T>>({
    loading: false,
    error: null,
    data: null,
  });

  const { showSuccess, showError } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  const run = useCallback(
    async (...args: unknown[]): Promise<T> => {
      // Cancel previous request if still running
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await asyncFn(...args);
        
        setState(prev => ({ ...prev, loading: false, data: result, error: null }));

        if (options?.onSuccess) {
          options.onSuccess(result);
        }

        if (options?.showToastOnSuccess) {
          showSuccess(options.successMessage || 'Action completed successfully.');
        }

        return result;
      } catch (error: unknown) {
        // Don't update state if request was aborted
        if (error instanceof Error && error.name === 'AbortError') {
          throw error;
        }

        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));

        if (options?.onError) {
          options.onError(error as Error);
        }

        if (options?.showToastOnError !== false) {
          showError(options?.errorMessage || errorMessage, {
            label: 'Retry',
            onClick: () => run(...args),
          });
        }

        throw error;
      }
    },
    [asyncFn, options, showSuccess, showError]
  );

  const reset = useCallback(() => {
    setState({ loading: false, error: null, data: null });
  }, []);

  return {
    ...state,
    run,
    reset,
  };
}
