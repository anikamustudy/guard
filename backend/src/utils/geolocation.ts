/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in meters
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Check if a point is within geofence radius
 * @param userLat User's latitude
 * @param userLon User's longitude
 * @param locationLat Location's latitude
 * @param locationLon Location's longitude
 * @param radius Allowed radius in meters
 * @returns Object with isWithinRadius and distance
 */
export const isWithinGeofence = (
  userLat: number,
  userLon: number,
  locationLat: number,
  locationLon: number,
  radius: number
): { isWithinRadius: boolean; distance: number } => {
  const distance = calculateDistance(userLat, userLon, locationLat, locationLon);
  return {
    isWithinRadius: distance <= radius,
    distance,
  };
};
