import api from '../config/api';
import { EmergencyAlert, ApiResponse } from '../types';

export interface SendEmergencyAlertRequest {
  latitude: number;
  longitude: number;
  alertType: 'panic' | 'medical' | 'security' | 'other';
  message?: string;
  locationId?: string;
}

export const sendEmergencyAlert = async (data: SendEmergencyAlertRequest): Promise<EmergencyAlert> => {
  try {
    const response = await api.post<ApiResponse<EmergencyAlert>>('/emergency/alert', data);
    return response.data.data!;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to send emergency alert');
  }
};

export const getMyEmergencyAlerts = async (): Promise<EmergencyAlert[]> => {
  try {
    const response = await api.get<ApiResponse<EmergencyAlert[]>>('/emergency/my-alerts');
    return response.data.data || [];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to get emergency alerts');
  }
};

export const acknowledgeAlert = async (alertId: string): Promise<EmergencyAlert> => {
  try {
    const response = await api.put<ApiResponse<EmergencyAlert>>(`/emergency/alert/${alertId}/acknowledge`);
    return response.data.data!;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to acknowledge alert');
  }
};
