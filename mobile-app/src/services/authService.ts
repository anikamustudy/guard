import api from '../config/api';
import { LoginRequest, RegisterRequest, User, AuthTokens, ApiResponse } from '../types';
import { saveToken, saveUser, clearToken, clearUser } from '../utils/storage';

export const login = async (credentials: LoginRequest): Promise<{ user: User; tokens: AuthTokens }> => {
  try {
    const response = await api.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>(
      '/auth/login',
      credentials
    );

    const { user, accessToken, refreshToken } = response.data.data!;

    // Save tokens and user
    await saveToken(accessToken);
    await saveToken(refreshToken, 'refresh_token');
    await saveUser(user);

    return {
      user,
      tokens: { accessToken, refreshToken },
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const register = async (data: RegisterRequest): Promise<{ user: User; tokens: AuthTokens }> => {
  try {
    const response = await api.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>(
      '/auth/register',
      data
    );

    const { user, accessToken, refreshToken } = response.data.data!;

    // Save tokens and user
    await saveToken(accessToken);
    await saveToken(refreshToken, 'refresh_token');
    await saveUser(user);

    return {
      user,
      tokens: { accessToken, refreshToken },
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout API call failed:', error);
  } finally {
    // Clear local storage regardless of API call result
    await clearToken();
    await clearUser();
  }
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    const user = response.data.data!;
    await saveUser(user);
    return user;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to get user');
  }
};

export const updateProfile = async (data: Partial<User>): Promise<User> => {
  try {
    const response = await api.put<ApiResponse<User>>('/auth/profile', data);
    const user = response.data.data!;
    await saveUser(user);
    return user;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};
