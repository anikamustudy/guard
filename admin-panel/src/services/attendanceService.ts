import apiClient from '../config/api';
import type { Attendance, PaginatedResponse, FilterOptions, AttendanceReport, ApiResponse } from '../types';

export const attendanceService = {
  getAttendances: async (filters?: FilterOptions): Promise<PaginatedResponse<Attendance>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Attendance>>>('/attendance', {
      params: filters,
    });
    return response.data.data!;
  },

  getAttendanceById: async (id: string): Promise<Attendance> => {
    const response = await apiClient.get<ApiResponse<Attendance>>(`/attendance/${id}`);
    return response.data.data!;
  },

  getAttendanceByGuard: async (guardId: string, filters?: FilterOptions): Promise<PaginatedResponse<Attendance>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Attendance>>>(`/attendance/guard/${guardId}`, {
      params: filters,
    });
    return response.data.data!;
  },

  getAttendanceReports: async (startDate: string, endDate: string): Promise<AttendanceReport[]> => {
    const response = await apiClient.get<ApiResponse<AttendanceReport[]>>('/attendance/reports', {
      params: { startDate, endDate },
    });
    return response.data.data!;
  },

  exportAttendance: async (filters?: FilterOptions): Promise<Blob> => {
    const response = await apiClient.get('/attendance/export', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },

  updateAttendanceStatus: async (id: string, status: string, notes?: string): Promise<Attendance> => {
    const response = await apiClient.patch<ApiResponse<Attendance>>(`/attendance/${id}/status`, {
      status,
      notes,
    });
    return response.data.data!;
  },
};
