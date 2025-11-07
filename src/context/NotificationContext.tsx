"use client";
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';

type Severity = "error" | "warning" | "info" | "success";

interface NotificationContextType {
    showNotification: (message: string, severity?: Severity) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<Severity>('info');

    const showNotification = useCallback((newMessage: string, newSeverity: Severity = 'error') => {
        setMessage(newMessage);
        setSeverity(newSeverity);
        setOpen(true);
    }, []);

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
