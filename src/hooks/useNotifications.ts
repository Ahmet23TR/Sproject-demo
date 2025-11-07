import { useNotification } from '../context/NotificationContext';

export const useNotifications = () => {
  const { showNotification } = useNotification();

  return {
    showError: (message: string) => showNotification(message, 'error'),
    showWarning: (message: string) => showNotification(message, 'warning'),
    showInfo: (message: string) => showNotification(message, 'info'),
    showSuccess: (message: string) => showNotification(message, 'success'),
    showNotification, // Direct access to the original function
  };
};
