
import { supabase } from "@/integrations/supabase/client";
import { Profile } from '@/types/supabase';
import { User } from '@/types';
import { calculateDistance } from "@/utils/userFilters";

export function calculateLocalAge(dob: string | null | undefined): number {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function mapProfileToAppUserForNearby(profile: Profile, currentLatitude: number | null, currentLongitude: number | null): User {
  const userLat = (profile as any).latitude as number | undefined;
  const userLng = (profile as any).longitude as number | undefined;
  let distance: number | undefined = undefined;

  if (typeof userLat === 'number' && typeof userLng === 'number' && currentLatitude !== null && currentLongitude !== null) {
    distance = calculateDistance(currentLatitude, currentLongitude, userLat, userLng);
  }

  const mappedUser: User = {
    id: profile.id,
    name: profile.name || profile.username || 'Unnamed User',
    username: profile.username || undefined,
    avatar: profile.avatar || undefined,
    bio: profile.bio || '',
    interests: profile.interests || [],
    age: calculateLocalAge(profile.dob),
    location: profile.location || undefined,
    latitude: userLat,
    longitude: userLng,
    distance: distance,
    profileData: profile,
  };

  return mappedUser;
}

export async function fetchNearbyProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*'); // In a real app, you'd paginate or filter by general region here
  if (error) {
    console.error("Error fetching profiles for nearby people:", error);
    throw new Error(error.message);
  }
  return data || [];
}
