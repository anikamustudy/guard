import api from '../config/api';
import { Location, ApiResponse } from '../types';

export const getLocations = async (): Promise<Location[]> => {
  try {
    const response = await api.get<ApiResponse<Location[]>>('/locations');
    return response.data.data || [];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to get locations');
  }
};

export const getLocationById = async (id: string): Promise<Location> => {
  try {
    const response = await api.get<ApiResponse<Location>>(`/locations/${id}`);
    return response.data.data!;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to get location details');
  }
};
