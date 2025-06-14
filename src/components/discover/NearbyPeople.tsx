
import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Profile } from '@/types/supabase';
import { User } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { filterUsersByInterests, sortUsersByLocation } from "@/utils/userFilters";
import { mapProfileToAppUserForNearby, fetchNearbyProfiles } from "@/utils/nearbyPeopleUtils";
import { LocationPermissionPrompt } from "./LocationPermissionPrompt";
import { NearbyPeopleHeader } from "./NearbyPeopleHeader";
import { NearbyPeopleList } from "./NearbyPeopleList";
import { InviteFriendsNearby } from "./InviteFriendsNearby";

interface NearbyPeopleProps {
  searchQuery?: string;
  selectedInterests?: string[];
  latitude: number | null;
  longitude: number | null;
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
    let mappedUsers = profiles.map(p => mapProfileToAppUserForNearby(p, latitude, longitude));

    if (searchQuery) {
      mappedUsers = mappedUsers.filter(user => {
        const nameMatch = user.name.toLowerCase().includes(searchQuery.toLowerCase());
        const bioMatch = (user.bio || '').toLowerCase().includes(searchQuery.toLowerCase());
        const usernameMatch = (user.username || '').toLowerCase().includes(searchQuery.toLowerCase());
        return nameMatch || bioMatch || usernameMatch;
      });
    }

    if (selectedInterests.length > 0) {
      mappedUsers = filterUsersByInterests(mappedUsers, selectedInterests);
    }
    
    if (latitude !== null && longitude !== null && mappedUsers.length > 0) {
      displayedUsers = sortUsersByLocation(mappedUsers, latitude, longitude);
    } else {
      displayedUsers = mappedUsers;
    }
  }
  
  const refreshLocation = async () => {
    setIsRefreshingLocation(true);
    onRequestLocation();
    
    setTimeout(() => {
      toast({
        title: "Location refreshed",
        description: "Showing people nearest to your current location (if available).",
      });
      setIsRefreshingLocation(false);
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
      {!latitude || !longitude ? (
        <LocationPermissionPrompt onRequestLocation={onRequestLocation} />
      ) : (
        <>
          <NearbyPeopleHeader 
            onRefreshLocation={refreshLocation} 
            isRefreshingLocation={isRefreshingLocation} 
          />
          <NearbyPeopleList 
            users={displayedUsers} 
            latitude={latitude} 
            longitude={longitude} 
          />
        </>
      )}
      <InviteFriendsNearby />
    </div>
  );
}
