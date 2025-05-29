
// Utility functions for distance calculations

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param coord1 First coordinate
 * @param coord2 Second coordinate
 * @returns Distance in kilometers
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) * Math.cos(toRadians(coord2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 * @param distance Distance in kilometers
 * @returns Formatted distance string
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)}km`;
  } else {
    return `${Math.round(distance)}km`;
  }
}

/**
 * Find users within a given radius
 * @param userLocation User's current location
 * @param allUsers Array of all users with location data
 * @param radiusKm Radius in kilometers
 * @returns Array of nearby users with calculated distances
 */
export function findNearbyUsers(
  userLocation: Coordinates,
  allUsers: Array<{ id: string; latitude?: number; longitude?: number; [key: string]: any }>,
  radiusKm: number = 50
) {
  return allUsers
    .filter(user => 
      user.latitude !== undefined && 
      user.longitude !== undefined &&
      user.id !== 'current-user' // Filter out current user
    )
    .map(user => ({
      ...user,
      distance: calculateDistance(
        userLocation,
        { latitude: user.latitude!, longitude: user.longitude! }
      )
    }))
    .filter(user => user.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}
