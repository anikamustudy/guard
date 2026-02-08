import api from '../config/api';
import { Notification, ApiResponse, PaginatedResponse } from '../types';

export const registerPushToken = async (token: string): Promise<void> => {
  try {
    await api.post('/notifications/register-token', { token });
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to register push token');
  }
};

export const getNotifications = async (
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<Notification>> => {
  try {
    const response = await api.get<ApiResponse<PaginatedResponse<Notification>>>('/notifications', {
      params: { page, limit },
    });
    return response.data.data!;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to get notifications');
  }
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  try {
    await api.put(`/notifications/${id}/read`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
  }
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    await api.put('/notifications/read-all');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to mark all notifications as read');
  }
};

export const getUnreadCount = async (): Promise<number> => {
  try {
    const response = await api.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
    return response.data.data?.count || 0;
  } catch (error: any) {
    console.error('Failed to get unread count:', error);
    return 0;
  }
};
