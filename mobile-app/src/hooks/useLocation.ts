import { useState, useEffect } from 'react';
import { Coordinates } from '../types';
import * as geolocation from '../utils/geolocation';
import * as Location from 'expo-location';

interface UseLocationReturn {
  location: Coordinates | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  refreshLocation: () => Promise<void>;
  calculateDistance: (targetLocation: Coordinates) => number | null;
  isWithinGeofence: (targetLocation: Coordinates, radius?: number) => boolean;
}

export const useLocation = (): UseLocationReturn => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (err) {
      console.error('Error checking location permission:', err);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      const granted = await geolocation.requestLocationPermission();
      setHasPermission(granted);
      if (!granted) {
        setError('Location permission denied');
      }
      return granted;
    } catch (err: any) {
      setError(err.message || 'Failed to request location permission');
      return false;
    }
  };

  const refreshLocation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const currentLocation = await geolocation.getCurrentLocation();
      if (currentLocation) {
        setLocation(currentLocation);
      } else {
        setError('Failed to get current location');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get location');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDistance = (targetLocation: Coordinates): number | null => {
    if (!location) return null;
    return geolocation.calculateDistance(location, targetLocation);
  };

  const isWithinGeofence = (targetLocation: Coordinates, radius?: number): boolean => {
    if (!location) return false;
    return geolocation.isWithinGeofence(location, targetLocation, radius);
  };

  return {
    location,
    isLoading,
    error,
    hasPermission,
    requestPermission,
    refreshLocation,
    calculateDistance,
    isWithinGeofence,
  };
};
