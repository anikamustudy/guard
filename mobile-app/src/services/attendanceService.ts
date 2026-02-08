import api from '../config/api';
import { Attendance, CheckInRequest, CheckOutRequest, ApiResponse, PaginatedResponse } from '../types';

export const checkIn = async (data: CheckInRequest): Promise<Attendance> => {
  try {
    const response = await api.post<ApiResponse<Attendance>>('/attendance/check-in', data);
    return response.data.data!;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Check-in failed');
  }
};

export const checkOut = async (data: CheckOutRequest): Promise<Attendance> => {
  try {
    const response = await api.post<ApiResponse<Attendance>>('/attendance/check-out', data);
    return response.data.data!;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Check-out failed');
  }
};

export const getAttendanceHistory = async (
  page: number = 1,
  limit: number = 20,
  startDate?: string,
  endDate?: string
): Promise<PaginatedResponse<Attendance>> => {
  try {
    const params: any = { page, limit };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get<ApiResponse<PaginatedResponse<Attendance>>>('/attendance/history', {
      params,
    });
    return response.data.data!;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to get attendance history');
  }
};

export const getAttendanceById = async (id: string): Promise<Attendance> => {
  try {
    const response = await api.get<ApiResponse<Attendance>>(`/attendance/${id}`);
    return response.data.data!;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to get attendance details');
  }
};

export const getTodayAttendance = async (): Promise<Attendance | null> => {
  try {
    const response = await api.get<ApiResponse<Attendance>>('/attendance/today');
    return response.data.data || null;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw new Error(error.response?.data?.message || 'Failed to get today\'s attendance');
  }
};
