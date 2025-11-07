'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, AlertColor, Box } from '@mui/material';

export interface ToastMessage {
    id: string;
    message: string;
    severity: AlertColor;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface ToastContextValue {
    showToast: (message: string, severity?: AlertColor, duration?: number, action?: { label: string; onClick: () => void }) => void;
    showSuccess: (message: string) => void;
    showError: (message: string, action?: { label: string; onClick: () => void }) => void;
    showWarning: (message: string) => void;
    showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast = { ...toast, id };
        setToasts(prev => [...prev, newToast]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const showToast = useCallback((
        message: string,
        severity: AlertColor = 'info',
        duration = 4000,
        action?: { label: string; onClick: () => void }
    ) => {
        addToast({ message, severity, duration, action });
    }, [addToast]);

    const showSuccess = useCallback((message: string) => {
        showToast(message, 'success', 3000);
    }, [showToast]);

    const showError = useCallback((message: string, action?: { label: string; onClick: () => void }) => {
        showToast(message, 'error', 5000, action);
    }, [showToast]);

    const showWarning = useCallback((message: string) => {
        showToast(message, 'warning', 4000);
    }, [showToast]);

    const showInfo = useCallback((message: string) => {
        showToast(message, 'info', 4000);
    }, [showToast]);

    const contextValue: ToastContextValue = {
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
    };

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            <Box
                sx={{
                    position: 'fixed',
                    top: 16,
                    right: 16,
                    zIndex: (theme) => theme.zIndex.snackbar,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                }}
            >
                {toasts.map((toast) => (
                    <Snackbar
                        key={toast.id}
                        open={true}
                        autoHideDuration={toast.duration}
                        onClose={() => removeToast(toast.id)}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        sx={{ position: 'static', transform: 'none' }}
                    >
                        <Alert
                            onClose={() => removeToast(toast.id)}
                            severity={toast.severity}
                            variant="filled"
                            sx={{ width: '100%', minWidth: 300 }}
                            action={
                                toast.action ? (
                                    <Box
                                        component="button"
                                        onClick={toast.action.onClick}
                                        sx={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'inherit',
                                            cursor: 'pointer',
                                            textDecoration: 'underline',
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                            '&:hover': {
                                                opacity: 0.8,
                                            },
                                        }}
                                    >
                                        {toast.action.label}
                                    </Box>
                                ) : undefined
                            }
                        >
                            {toast.message}
                        </Alert>
                    </Snackbar>
                ))}
            </Box>
        </ToastContext.Provider>
    );
};

