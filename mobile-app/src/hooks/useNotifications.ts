import { useContext } from 'react';
import { useNotifications as useNotificationsContext } from '../context/NotificationContext';

export const useNotifications = () => {
  return useNotificationsContext();
};
