import api from '../config/api';
import { Shift, ApiResponse, PaginatedResponse } from '../types';

export const getMyShifts = async (
  page: number = 1,
  limit: number = 20,
  startDate?: string,
  endDate?: string
): Promise<PaginatedResponse<Shift>> => {
  try {
    const params: any = { page, limit };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get<ApiResponse<PaginatedResponse<Shift>>>('/shifts/my-shifts', {
      params,
    });
    return response.data.data!;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to get shifts');
  }
};

export const getShiftById = async (id: string): Promise<Shift> => {
  try {
    const response = await api.get<ApiResponse<Shift>>(`/shifts/${id}`);
    return response.data.data!;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to get shift details');
  }
};

export const getTodayShift = async (): Promise<Shift | null> => {
  try {
    const response = await api.get<ApiResponse<Shift>>('/shifts/today');
    return response.data.data || null;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw new Error(error.response?.data?.message || 'Failed to get today\'s shift');
  }
};

export const getUpcomingShifts = async (limit: number = 5): Promise<Shift[]> => {
  try {
    const response = await api.get<ApiResponse<Shift[]>>('/shifts/upcoming', {
      params: { limit },
    });
    return response.data.data || [];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to get upcoming shifts');
  }
};
