import apiClient from '../config/api';
import type { Emergency, PaginatedResponse, FilterOptions, ApiResponse } from '../types';

export const emergencyService = {
  getEmergencies: async (filters?: FilterOptions): Promise<PaginatedResponse<Emergency>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Emergency>>>('/emergencies', {
      params: filters,
    });
    return response.data.data!;
  },

  getEmergencyById: async (id: string): Promise<Emergency> => {
    const response = await apiClient.get<ApiResponse<Emergency>>(`/emergencies/${id}`);
    return response.data.data!;
  },

  getActiveEmergencies: async (): Promise<Emergency[]> => {
    const response = await apiClient.get<ApiResponse<Emergency[]>>('/emergencies/active');
    return response.data.data!;
  },

  acknowledgeEmergency: async (id: string): Promise<Emergency> => {
    const response = await apiClient.post<ApiResponse<Emergency>>(`/emergencies/${id}/acknowledge`);
    return response.data.data!;
  },

  resolveEmergency: async (id: string, notes?: string): Promise<Emergency> => {
    const response = await apiClient.post<ApiResponse<Emergency>>(`/emergencies/${id}/resolve`, {
      notes,
    });
    return response.data.data!;
  },

  updateEmergencyStatus: async (id: string, status: string): Promise<Emergency> => {
    const response = await apiClient.patch<ApiResponse<Emergency>>(`/emergencies/${id}/status`, {
      status,
    });
    return response.data.data!;
  },
};
