import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

// Use SecureStore for sensitive data on native, AsyncStorage on web
const isWeb = Platform.OS === 'web';

export const saveToken = async (token: string, key: string = TOKEN_KEY): Promise<void> => {
  try {
    if (isWeb) {
      await AsyncStorage.setItem(key, token);
    } else {
      await SecureStore.setItemAsync(key, token);
    }
  } catch (error) {
    console.error('Error saving token:', error);
    throw error;
  }
};

export const getToken = async (key: string = TOKEN_KEY): Promise<string | null> => {
  try {
    if (isWeb) {
      return await AsyncStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const clearToken = async (): Promise<void> => {
  try {
    if (isWeb) {
      await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
    } else {
      await Promise.all([
        SecureStore.deleteItemAsync(TOKEN_KEY),
        SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY),
      ]);
    }
  } catch (error) {
    console.error('Error clearing token:', error);
    throw error;
  }
};

export const saveUser = async (user: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
};

export const getUser = async (): Promise<any | null> => {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const clearUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error clearing user:', error);
    throw error;
  }
};

export const storage = {
  saveToken,
  getToken,
  clearToken,
  saveUser,
  getUser,
  clearUser,
};
