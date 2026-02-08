import apiClient from '../config/api';
import type { DashboardStats, ApiResponse } from '../types';

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return response.data.data!;
  },

  getAttendanceChart: async (days: number = 7): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>('/dashboard/attendance-chart', {
      params: { days },
    });
    return response.data.data!;
  },

  getLocationStats: async (): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>('/dashboard/location-stats');
    return response.data.data!;
  },
};
