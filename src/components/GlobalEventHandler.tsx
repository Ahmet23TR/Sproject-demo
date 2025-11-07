"use client";
import { useEffect } from 'react';
import { useErrorContext } from '../context/ErrorContext';
import { useNotification } from '../context/NotificationContext';
import { GlobalErrorDisplay } from './GlobalErrorDisplay';

interface GlobalEventHandlerProps {
    children: React.ReactNode;
}

export const GlobalEventHandler: React.FC<GlobalEventHandlerProps> = ({ children }) => {
    const { hasCriticalError, triggerCriticalError } = useErrorContext();
    const { showNotification } = useNotification();

    useEffect(() => {
        // CRITICAL ERROR LISTENER
        const handleCriticalError = (event: CustomEvent) => {
            triggerCriticalError(event.detail.message);
        };
        window.addEventListener('critical-api-error', handleCriticalError as EventListener);

        // NOTIFICATION ERROR LISTENER
        const handleNotificationError = (event: CustomEvent) => {
            showNotification(event.detail.message, 'error');
        };
        window.addEventListener('notification-api-error', handleNotificationError as EventListener);

        return () => {
            window.removeEventListener('critical-api-error', handleCriticalError as EventListener);
            window.removeEventListener('notification-api-error', handleNotificationError as EventListener);
        };
    }, [triggerCriticalError, showNotification]);

    if (hasCriticalError) {
        return <GlobalErrorDisplay onRetry={() => window.location.reload()} />;
    }

    return <>{children}</>;
};
