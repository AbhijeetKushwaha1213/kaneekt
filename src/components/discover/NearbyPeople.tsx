import React, { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from '@/types/supabase';
import { User } from '@/types'; // App's User type
import { UserCard } from "@/components/ui/user-card";
import { Button } from "@/components/ui/button";
import { MapPin, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { filterUsersByInterests, sortUsersByLocation, calculateDistance } from "@/utils/userFilters";

// It's recommended to move these helper functions to a utils file.
function calculateLocalAge(dob: string | null | undefined): number {
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

function mapProfileToAppUserForNearby(profile: Profile, currentLatitude: number | null, currentLongitude: number | null): User {
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
    location: profile.location || undefined, // Text location
    latitude: userLat,
    longitude: userLng,
    distance: distance,
    profileData: profile, // Added profileData
  };

  return mappedUser;
}

async function fetchNearbyProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*'); // In a real app, you'd paginate or filter by general region here
  if (error) {
    console.error("Error fetching profiles for nearby people:", error);
    throw new Error(error.message);
  }
  return data || [];
}

interface NearbyPeopleProps {
  searchQuery?: string;
  selectedInterests?: string[];
  latitude: number | null; // Current user's latitude
  longitude: number | null; // Current user's longitude
  onRequestLocation: () => void;
}

export function NearbyPeople({ 
  searchQuery = '', 
  selectedInterests = [],
  latitude,
  longitude,
  onRequestLocation
}: NearbyPeopleProps) {
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);
  const { toast } = useToast();

  const { data: profiles, isLoading: isLoadingProfiles, error: profilesError } = useQuery<Profile[]>({
    queryKey: ['nearbyProfiles'],
    queryFn: fetchNearbyProfiles,
  });
  
  let displayedUsers: User[] = [];

  if (profiles) {
    // Map profiles to User type
    let mappedUsers = profiles.map(p => mapProfileToAppUserForNearby(p, latitude, longitude));

    // Filter by search query
    if (searchQuery) {
      mappedUsers = mappedUsers.filter(user => {
        const nameMatch = user.name.toLowerCase().includes(searchQuery.toLowerCase());
        const bioMatch = (user.bio || '').toLowerCase().includes(searchQuery.toLowerCase());
        const usernameMatch = (user.username || '').toLowerCase().includes(searchQuery.toLowerCase());
        return nameMatch || bioMatch || usernameMatch;
      });
    }

    // Filter by selected interests
    if (selectedInterests.length > 0) {
      mappedUsers = filterUsersByInterests(mappedUsers, selectedInterests);
    }
    
    // Sort users by location if current user's location is available
    if (latitude !== null && longitude !== null && mappedUsers.length > 0) {
      // sortUsersByLocation will attempt to calculate distances and sort.
      // Effectiveness depends on mappedUsers having latitude/longitude or parsable location.
      // As noted, this will be limited with current Profile structure.
      displayedUsers = sortUsersByLocation(mappedUsers, latitude, longitude);
    } else {
      displayedUsers = mappedUsers; // No location or no users to sort
    }
  }
  
  const refreshLocation = async () => {
    setIsRefreshingLocation(true);
    onRequestLocation(); // This should trigger a re-fetch via Discover page's useGeolocation
    
    // Simulate a delay for the location refresh and show toast
    setTimeout(() => {
      toast({
        title: "Location refreshed",
        description: "Showing people nearest to your current location (if available).",
      });
      setIsRefreshingLocation(false);
      // Data re-fetch for profiles happens via TanStack Query's mechanisms if queryKey dependencies change,
      // or can be manually triggered if needed via queryClient.invalidateQueries(['nearbyProfiles'])
    }, 1500);
  };
  
  if (isLoadingProfiles) {
    return <div className="text-center py-8">Loading people nearby...</div>;
  }

  if (profilesError) {
    return <div className="text-center py-8 text-destructive">Error loading people. Please try again.</div>;
  }

  return (
    <div className="space-y-4">
      {(!latitude || !longitude) ? (
        <div className="text-center py-8 bg-muted/50 rounded-lg border border-dashed">
          {/* ... keep existing code for 'Enable location' prompt ... */}
          <MapPin className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium mb-2">Enable location</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            To see people nearby, we need your location permission.
          </p>
          <Button onClick={onRequestLocation}>
            Share my location
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">People Near You</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshLocation}
              disabled={isRefreshingLocation}
            >
              <MapPin className="mr-2 h-4 w-4" />
              {isRefreshingLocation ? "Updating..." : "Refresh location"}
            </Button>
          </div>
          
          {displayedUsers && displayedUsers.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayedUsers.map(user => user ? (
                <UserCard key={user.id} user={user} />
              ) : null)}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No people found matching your criteria.
                {latitude && longitude && " Current location based sorting might be limited without precise user locations."}
              </p>
            </div>
          )}
        </>
      )}
      
      {/* Invite friends section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-4 mt-8">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 dark:bg-blue-900/50 rounded-full p-3">
            <UserPlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-medium">Don't see your friends?</h3>
            <p className="text-sm text-muted-foreground">Invite them to join and see them nearby</p>
          </div>
        </div>
        <Button className="w-full mt-3" variant="outline">
          Invite Friends
        </Button>
      </div>
    </div>
  );
}
