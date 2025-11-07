"use client";
import { useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';

export const NotificationHandler = () => {
    const { showNotification } = useNotification();

    useEffect(() => {
        const handleApiError = (event: CustomEvent) => {
            const { message, code } = event.detail;
            if (code !== 'AUTH_TOKEN_EXPIRED' && code !== 'AUTH_TOKEN_INVALID') {
                showNotification(message, 'error');
            }
        };

        window.addEventListener('api-notification-error', handleApiError as EventListener);
        return () => window.removeEventListener('api-notification-error', handleApiError as EventListener);
    }, [showNotification]);

    return null;
};
