'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';

type LoadingContextValue = {
    isLoading: boolean;
    startLoading: () => void;
    stopLoading: () => void;
    withLoading: <T>(promiseOrFn: Promise<T> | (() => Promise<T>)) => Promise<T>;
};

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
    const inFlightCountRef = useRef<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const axiosInterceptorIds = useRef<{ request?: number; response?: number; error?: number }>({});
    const originalFetchRef = useRef<typeof fetch | null>(null);

    const updateStateFromCount = useCallback(() => {
        setIsLoading(inFlightCountRef.current > 0);
    }, []);

    const startLoading = useCallback(() => {
        inFlightCountRef.current += 1;
        updateStateFromCount();
    }, [updateStateFromCount]);

    const stopLoading = useCallback(() => {
        inFlightCountRef.current = Math.max(0, inFlightCountRef.current - 1);
        updateStateFromCount();
    }, [updateStateFromCount]);

    const withLoading = useCallback(
        async <T,>(promiseOrFn: Promise<T> | (() => Promise<T>)) => {
            startLoading();
            try {
                const p = typeof promiseOrFn === 'function' ? (promiseOrFn as () => Promise<T>)() : promiseOrFn;
                return await p;
            } finally {
                stopLoading();
            }
        },
        [startLoading, stopLoading]
    );

    useEffect(() => {
        // Setup Axios interceptors (global axios import used throughout services)
        const reqId = axios.interceptors.request.use((config) => {
            startLoading();
            return config;
        });
        const resId = axios.interceptors.response.use(
            (response) => {
                stopLoading();
                return response;
            },
            (error) => {
                stopLoading();
                return Promise.reject(error);
            }
        );
        axiosInterceptorIds.current.request = reqId;
        axiosInterceptorIds.current.response = resId;
        const cleanupInterceptorIds = { request: reqId, response: resId };

        // Patch window.fetch to include loading as well
        if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
            originalFetchRef.current = window.fetch.bind(window);
            window.fetch = async (...args: Parameters<typeof fetch>): Promise<Response> => {
                startLoading();
                try {
                    const res = await (originalFetchRef.current as typeof fetch)(...args);
                    return res;
                } finally {
                    stopLoading();
                }
            };
        }
        const originalFetchLocal = originalFetchRef.current;

        return () => {
            // Eject interceptors
            if (cleanupInterceptorIds.request !== undefined) {
                axios.interceptors.request.eject(cleanupInterceptorIds.request);
            }
            if (cleanupInterceptorIds.response !== undefined) {
                axios.interceptors.response.eject(cleanupInterceptorIds.response);
            }
            // Restore original fetch
            if (typeof window !== 'undefined' && originalFetchLocal) {
                window.fetch = originalFetchLocal as typeof fetch;
            }
        };
    }, [startLoading, stopLoading]);

    const value = useMemo<LoadingContextValue>(() => ({ isLoading, startLoading, stopLoading, withLoading }), [isLoading, startLoading, stopLoading, withLoading]);

    return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
}

export function useLoading(): LoadingContextValue {
    const ctx = useContext(LoadingContext);
    if (!ctx) throw new Error('useLoading must be used within a LoadingProvider');
    return ctx;
}


