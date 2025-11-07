"use client";
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface ErrorContextType {
    hasCriticalError: boolean;
    criticalErrorMessage: string;
    triggerCriticalError: (message: string) => void;
    clearCriticalError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider = ({ children }: { children: ReactNode }) => {
    const [hasCriticalError, setHasCriticalError] = useState(false);
    const [criticalErrorMessage, setCriticalErrorMessage] = useState('');

    const triggerCriticalError = useCallback((message: string) => {
        setCriticalErrorMessage(message);
        setHasCriticalError(true);
    }, []);

    const clearCriticalError = useCallback(() => {
        setHasCriticalError(false);
        setCriticalErrorMessage('');
    }, []);

    return (
        <ErrorContext.Provider value={{
            hasCriticalError,
            criticalErrorMessage,
            triggerCriticalError,
            clearCriticalError
        }}>
            {children}
        </ErrorContext.Provider>
    );
};

export const useErrorContext = () => {
    const context = useContext(ErrorContext);
    if (!context) {
        throw new Error('useErrorContext must be used within an ErrorProvider');
    }
    return context;
};
