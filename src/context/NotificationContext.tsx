// src/context/NotificationContext.tsx
import React, { createContext, useState, useContext, useCallback } from 'react';
import Notification from '../components/Notification';

interface NotificationContextType {
  showNotification: (type: 'success' | 'error' | 'info', message: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  showNotification: () => {},
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    isVisible: boolean;
  }>({
    type: 'info',
    message: '',
    isVisible: false,
  });

  // Usar useCallback para evitar recrear la función en cada renderizado
  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setNotification({
      type,
      message,
      isVisible: true,
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      isVisible: false,
    }));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;