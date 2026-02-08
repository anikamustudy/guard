import React, { createContext, useState, useContext, useEffect, ReactNode, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Notification } from '../types';
import * as notificationService from '../services/notificationService';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  expoPushToken: string | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotifications();
    refreshNotifications();
    refreshUnreadCount();

    // Listen for notifications
    notificationListener.current = Notifications.addNotificationReceivedListener((notification: any) => {
      console.log('Notification received:', notification);
      refreshNotifications();
      refreshUnreadCount();
    });

    // Listen for notification responses (user tapped on notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response: any) => {
      console.log('Notification response:', response);
      // Handle navigation based on notification data
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const registerForPushNotifications = async () => {
    if (!Device.isDevice) {
      console.log('Must use physical device for push notifications');
      return;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'guard-attendance-app',
      });

      setExpoPushToken(token.data);

      // Register token with backend
      try {
        await notificationService.registerPushToken(token.data);
      } catch (error) {
        console.error('Failed to register push token with backend:', error);
      }

      // Android specific
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#1E3A8A',
        });
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  const refreshNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await notificationService.getNotifications(1, 50);
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Failed to refresh unread count:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markNotificationAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      await Notifications.setBadgeCountAsync(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        expoPushToken,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
