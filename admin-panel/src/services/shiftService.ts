import apiClient from '../config/api';
import type { Shift, PaginatedResponse, FilterOptions, ApiResponse } from '../types';

export const shiftService = {
  getShifts: async (filters?: FilterOptions): Promise<PaginatedResponse<Shift>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Shift>>>('/shifts', {
      params: filters,
    });
    return response.data.data!;
  },

  getShiftById: async (id: string): Promise<Shift> => {
    const response = await apiClient.get<ApiResponse<Shift>>(`/shifts/${id}`);
    return response.data.data!;
  },

  createShift: async (shiftData: Partial<Shift>): Promise<Shift> => {
    const response = await apiClient.post<ApiResponse<Shift>>('/shifts', shiftData);
    return response.data.data!;
  },

  updateShift: async (id: string, shiftData: Partial<Shift>): Promise<Shift> => {
    const response = await apiClient.put<ApiResponse<Shift>>(`/shifts/${id}`, shiftData);
    return response.data.data!;
  },

  deleteShift: async (id: string): Promise<void> => {
    await apiClient.delete(`/shifts/${id}`);
  },

  updateShiftStatus: async (id: string, status: string): Promise<Shift> => {
    const response = await apiClient.patch<ApiResponse<Shift>>(`/shifts/${id}/status`, {
      status,
    });
    return response.data.data!;
  },

  getShiftsByGuard: async (guardId: string): Promise<Shift[]> => {
    const response = await apiClient.get<ApiResponse<Shift[]>>(`/shifts/guard/${guardId}`);
    return response.data.data!;
  },

  getShiftsByLocation: async (locationId: string): Promise<Shift[]> => {
    const response = await apiClient.get<ApiResponse<Shift[]>>(`/shifts/location/${locationId}`);
    return response.data.data!;
  },
};
