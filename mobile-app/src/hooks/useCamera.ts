import { useState } from 'react';
import { useCameraPermissions } from 'expo-camera';

interface UseCameraReturn {
  hasPermission: boolean | null;
  isLoading: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
}

export const useCamera = (): UseCameraReturn => {
  const [permission, requestCameraPermission] = useCameraPermissions();
  const [error, setError] = useState<string | null>(null);

  const requestPermission = async (): Promise<boolean> => {
    setError(null);
    try {
      const result = await requestCameraPermission();
      const granted = result.granted;
      if (!granted) {
        setError('Camera permission denied');
      }
      return granted;
    } catch (err: any) {
      setError(err.message || 'Failed to request camera permission');
      return false;
    }
  };

  return {
    hasPermission: permission?.granted ?? null,
    isLoading: false,
    error,
    requestPermission,
  };
};
