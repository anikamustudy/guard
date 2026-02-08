import apiClient from '../config/api';
import type { User, Guard, PaginatedResponse, FilterOptions, ApiResponse } from '../types';

export const userService = {
  getUsers: async (filters?: FilterOptions): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<User>>>('/users', {
      params: filters,
    });
    return response.data.data!;
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data!;
  },

  createUser: async (userData: Partial<User>): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>('/users', userData);
    return response.data.data!;
  },

  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, userData);
    return response.data.data!;
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  getGuards: async (filters?: FilterOptions): Promise<PaginatedResponse<Guard>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Guard>>>('/users/guards', {
      params: filters,
    });
    return response.data.data!;
  },

  getGuardById: async (id: string): Promise<Guard> => {
    const response = await apiClient.get<ApiResponse<Guard>>(`/users/guards/${id}`);
    return response.data.data!;
  },

  updateGuardStatus: async (id: string, status: string): Promise<Guard> => {
    const response = await apiClient.patch<ApiResponse<Guard>>(`/users/guards/${id}/status`, {
      status,
    });
    return response.data.data!;
  },
};
