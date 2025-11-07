'use client';

import { useState, useCallback, useEffect } from 'react';

type BusyScope = string;
type BusyState = Map<BusyScope, boolean>;

interface BusyScopeContextValue {
  setBusy: (scope: BusyScope) => void;
  clearBusy: (scope: BusyScope) => void;
  isBusy: (scope: BusyScope) => boolean;
  withBusy: <T>(scope: BusyScope, promise: Promise<T>) => Promise<T>;
}

// Global busy state store
const globalBusyState = new Map<BusyScope, boolean>();
const listeners = new Set<(state: BusyState) => void>();

const notifyListeners = () => {
  listeners.forEach(listener => listener(new Map(globalBusyState)));
};

export function useBusyScope(): BusyScopeContextValue {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const listener = () => forceUpdate({});
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const setBusy = useCallback((scope: BusyScope) => {
    globalBusyState.set(scope, true);
    notifyListeners();
  }, []);

  const clearBusy = useCallback((scope: BusyScope) => {
    globalBusyState.delete(scope);
    notifyListeners();
  }, []);

  const isBusy = useCallback((scope: BusyScope) => {
    return globalBusyState.has(scope);
  }, []);

  const withBusy = useCallback(async <T>(scope: BusyScope, promise: Promise<T>): Promise<T> => {
    setBusy(scope);
    try {
      const result = await promise;
      return result;
    } finally {
      clearBusy(scope);
    }
  }, [setBusy, clearBusy]);

  return {
    setBusy,
    clearBusy,
    isBusy,
    withBusy,
  };
}

// Hook for specific scope
export function useBusy(scope: BusyScope): boolean {
  const { isBusy } = useBusyScope();
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const listener = () => forceUpdate({});
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return isBusy(scope);
}

// Hook for multiple scopes
export function useBusyMultiple(scopes: BusyScope[]): boolean {
  const { isBusy } = useBusyScope();
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const listener = () => forceUpdate({});
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return scopes.some(scope => isBusy(scope));
}
