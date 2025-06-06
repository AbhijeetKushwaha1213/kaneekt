
import React, { useState } from 'react';
import { UserCard } from "@/components/ui/user-card";
import { Button } from "@/components/ui/button";
import { USERS } from "@/data/mock-data";
import { MapPin, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { filterUsersByInterests, sortUsersByLocation } from "@/utils/userFilters";

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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Filter users by search query and interests
  let filteredUsers = USERS.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.bio.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Filter by selected interests if any are selected
  if (selectedInterests.length > 0) {
    filteredUsers = filterUsersByInterests(filteredUsers, selectedInterests);
  }
  
  // Sort users by location when we have coordinates
  if (latitude && longitude) {
    filteredUsers = sortUsersByLocation(filteredUsers, latitude, longitude);
  }
  
  const refreshLocation = async () => {
    setIsLoading(true);
    onRequestLocation();
    
    // Simulate a delay for the location refresh
    setTimeout(() => {
      toast({
        title: "Location refreshed",
        description: "Showing people nearest to your current location",
      });
      setIsLoading(false);
    }, 1500);
  };
  
  return (
    <div className="space-y-4">
      {(!latitude || !longitude) ? (
        <div className="text-center py-8 bg-muted/50 rounded-lg border border-dashed">
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
              disabled={isLoading}
            >
              <MapPin className="mr-2 h-4 w-4" />
              {isLoading ? "Updating..." : "Refresh location"}
            </Button>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredUsers.map(user => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
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
