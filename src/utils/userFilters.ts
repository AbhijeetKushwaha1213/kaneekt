import { User } from '@/types';

// Calculate distance based on latitude/longitude (using Haversine formula)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

// Filter users by interests
export function filterUsersByInterests(users: User[], selectedInterests: string[]): User[] {
  return users.filter(user => {
    return selectedInterests.some(interest => user.interests.includes(interest));
  });
}

// Sort users by distance from a location
export function sortUsersByLocation(users: User[], latitude: number, longitude: number): User[] {
  // Create a copy of users array to avoid mutating the original
  return [...users].sort((a, b) => {
    const aCoords = extractCoordinates(a);
    const bCoords = extractCoordinates(b);
    
    if (aCoords && bCoords) {
      const distanceA = calculateDistance(latitude, longitude, aCoords.lat, aCoords.lng);
      const distanceB = calculateDistance(latitude, longitude, bCoords.lat, bCoords.lng);
      // Update users with calculated distance if User type supports it (it does)
      // This mutation is inside sort, which is generally okay if users are copies or if distance is meant to be transient
      a.distance = distanceA;
      b.distance = distanceB;
      return distanceA - distanceB;
    }
    
    // If one has coordinates and the other doesn't, prioritize the one with coordinates
    if (aCoords && !bCoords) return -1;
    if (!aCoords && bCoords) return 1;
    
    // Fall back to existing distance property if available (e.g., pre-calculated)
    if (typeof a.distance === 'number' && typeof b.distance === 'number') {
      return a.distance - b.distance;
    }
    
    // Fallback: if location text is available, sort alphabetically as a last resort
    if (a.location && b.location) {
      return a.location.localeCompare(b.location);
    }
    if (a.location && !b.location) return -1;
    if (!a.location && b.location) return 1;

    return 0;
  });
}

// Helper to extract coordinates from user location data
function extractCoordinates(user: User): { lat: number, lng: number } | null {
  // Prioritize direct latitude/longitude if available on the User object
  if (typeof user.latitude === 'number' && typeof user.longitude === 'number') {
    return { lat: user.latitude, lng: user.longitude };
  }
  
  // Attempt to parse from user.location string if it's "lat,lng" - this is fragile
  if (user.location && user.location.includes(',')) {
    const parts = user.location.split(',');
    if (parts.length === 2) {
      const lat = parseFloat(parts[0].trim());
      const lng = parseFloat(parts[1].trim());
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
  }
  
  return null;
}

// Sort users by activity (for "Most active" sorting option)
export function sortUsersByActivity(users: User[]): User[] {
  return [...users].sort((a, b) => {
    // Use profileData if available, otherwise direct fields.
    // Activity can be based on profile updated_at or completeness.
    const lastActiveA = a.profileData?.updated_at || a.profileData?.created_at || '';
    const lastActiveB = b.profileData?.updated_at || b.profileData?.created_at || '';
    
    if (lastActiveA && lastActiveB) {
      return new Date(lastActiveB).getTime() - new Date(lastActiveA).getTime(); // Most recent update first
    }
    // Fallback: more interests or longer bio means more active
    const scoreA = (a.interests?.length || 0) + (a.bio?.length || 0) / 50;
    const scoreB = (b.interests?.length || 0) + (b.bio?.length || 0) / 50;
    return scoreB - scoreA;
  });
}

// Sort users by recency (for "Recently joined" sorting option)
export function sortUsersByRecency(users: User[]): User[] {
  return [...users].sort((a, b) => {
    const joinedA = a.profileData?.created_at || '';
    const joinedB = b.profileData?.created_at || '';

    if (joinedA && joinedB) {
      return new Date(joinedB).getTime() - new Date(joinedA).getTime(); // Most recent join first
    }
    // Fallback to ID-based sorting if created_at is not available
    return (b.id || '').localeCompare(a.id || '');
  });
}

// Sort users by similarity (for "Similar hobbies" sorting option)
// This function should already work if `users` are `User[]` and `currentUserInterests` is `string[]`
export function sortUsersBySimilarity(users: User[], currentUserInterests: string[]): User[] {
  return [...users].sort((a, b) => {
    const aMatches = (a.interests || []).filter(interest => currentUserInterests.includes(interest)).length;
    const bMatches = (b.interests || []).filter(interest => currentUserInterests.includes(interest)).length;
    return bMatches - aMatches; // More matches first
  });
}
