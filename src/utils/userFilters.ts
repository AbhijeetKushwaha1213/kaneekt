
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
    // If both have location data
    if (a.location && b.location) {
      const aCoords = extractCoordinates(a);
      const bCoords = extractCoordinates(b);
      
      if (aCoords && bCoords) {
        const distanceA = calculateDistance(latitude, longitude, aCoords.lat, aCoords.lng);
        const distanceB = calculateDistance(latitude, longitude, bCoords.lat, bCoords.lng);
        return distanceA - distanceB;
      }
    }
    
    // If one has location data and the other doesn't, prioritize the one with data
    if (a.location && !b.location) return -1;
    if (!a.location && b.location) return 1;
    
    // Fall back to the existing distance property if available
    if (typeof a.distance === 'number' && typeof b.distance === 'number') {
      return a.distance - b.distance;
    }
    
    return 0;
  });
}

// Helper to extract coordinates from user location data
// This is a mock function for demonstration - in a real app, you might use geocoding
function extractCoordinates(user: User): { lat: number, lng: number } | null {
  // For mock data, we'll use random coordinates near a base location
  // In a real app, you'd use the actual coordinates from the user's location
  const baseCoordinates = { lat: 37.7749, lng: -122.4194 }; // San Francisco
  
  // If user has a distance property, use that to simulate coordinates
  if (typeof user.distance === 'number') {
    // Generate coordinates that would be roughly the specified distance away
    // This is just a simplified approach for mock data
    const randomAngle = Math.random() * Math.PI * 2;
    const latOffset = (user.distance / 111) * Math.cos(randomAngle); // 111km per degree of latitude
    const lngOffset = (user.distance / (111 * Math.cos(baseCoordinates.lat * Math.PI / 180))) * Math.sin(randomAngle);
    
    return {
      lat: baseCoordinates.lat + latOffset,
      lng: baseCoordinates.lng + lngOffset
    };
  }
  
  return null;
}

// Sort users by activity (for "Most active" sorting option)
export function sortUsersByActivity(users: User[]): User[] {
  // This is a mock implementation - in a real app, you'd have actual activity metrics
  return [...users].sort((a, b) => {
    // Example activity score based on profile completeness
    const scoreA = (a.interests?.length || 0) + (a.bio?.length || 0) / 50;
    const scoreB = (b.interests?.length || 0) + (b.bio?.length || 0) / 50;
    return scoreB - scoreA; // Higher score first
  });
}

// Sort users by recency (for "Recently joined" sorting option)
export function sortUsersByRecency(users: User[]): User[] {
  // This is a mock implementation - in a real app, you'd have join dates
  // For demo purposes, we'll use the id to simulate a timestamp
  return [...users].sort((a, b) => {
    return parseInt(b.id, 36) - parseInt(a.id, 36);
  });
}

// Sort users by similarity (for "Similar hobbies" sorting option)
export function sortUsersBySimilarity(users: User[], currentUserInterests: string[]): User[] {
  return [...users].sort((a, b) => {
    const aMatches = a.interests.filter(interest => currentUserInterests.includes(interest)).length;
    const bMatches = b.interests.filter(interest => currentUserInterests.includes(interest)).length;
    return bMatches - aMatches; // More matches first
  });
}
