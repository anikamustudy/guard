import apiClient from '../config/api';
import type { Location, PaginatedResponse, FilterOptions, ApiResponse } from '../types';

export const locationService = {
  getLocations: async (filters?: FilterOptions): Promise<PaginatedResponse<Location>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Location>>>('/locations', {
      params: filters,
    });
    return response.data.data!;
  },

  getAllLocations: async (): Promise<Location[]> => {
    const response = await apiClient.get<ApiResponse<Location[]>>('/locations/all');
    return response.data.data!;
  },

  getLocationById: async (id: string): Promise<Location> => {
    const response = await apiClient.get<ApiResponse<Location>>(`/locations/${id}`);
    return response.data.data!;
  },

  createLocation: async (locationData: Partial<Location>): Promise<Location> => {
    const response = await apiClient.post<ApiResponse<Location>>('/locations', locationData);
    return response.data.data!;
  },

  updateLocation: async (id: string, locationData: Partial<Location>): Promise<Location> => {
    const response = await apiClient.put<ApiResponse<Location>>(`/locations/${id}`, locationData);
    return response.data.data!;
  },

  deleteLocation: async (id: string): Promise<void> => {
    await apiClient.delete(`/locations/${id}`);
  },

  updateLocationStatus: async (id: string, status: string): Promise<Location> => {
    const response = await apiClient.patch<ApiResponse<Location>>(`/locations/${id}/status`, {
      status,
    });
    return response.data.data!;
  },
};
