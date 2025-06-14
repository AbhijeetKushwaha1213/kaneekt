
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Profile } from "@/types/supabase";
import { User } from "@/types";
import { UserCard } from "@/components/ui/user-card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { sortUsersByActivity, sortUsersByRecency, sortUsersBySimilarity } from "@/utils/userFilters";
import { fetchDiscoverProfiles, mapProfileToAppUser, DiscoverFeedCommonProps } from "@/utils/discoverFeedUtils";

interface DiscoverFeedGridProps extends DiscoverFeedCommonProps {}

export function DiscoverFeedGrid({ 
  searchQuery = "",
  selectedInterests = [],
  currentUserInterests = [],
  ageRange = [18, 50],
  sortBy = "trending" // Corresponds to 'distance' or 'active' for users
}: DiscoverFeedGridProps) {
  const { data: profiles, isLoading: isLoadingProfiles, error: profilesError } = useQuery<Profile[]>({
    queryKey: ['discoverProfilesGrid'], // Changed queryKey to avoid conflicts
    queryFn: fetchDiscoverProfiles,
  });

  if (isLoadingProfiles) {
    return <div className="col-span-full text-center py-8">Loading profiles...</div>;
  }
  if (profilesError) {
    return <div className="col-span-full text-center py-8 text-destructive">Error loading profiles.</div>;
  }

  const mappedUsers: User[] = (profiles || []).map(mapProfileToAppUser);

  let filteredUsers = mappedUsers.filter(user => {
    const nameMatch = user.name.toLowerCase().includes(searchQuery.toLowerCase());
    const bioMatch = (user.bio || '').toLowerCase().includes(searchQuery.toLowerCase());
    const usernameMatch = (user.username || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = nameMatch || bioMatch || usernameMatch;
    
    const matchesInterests = selectedInterests.length === 0 || 
                            selectedInterests.some(interest => (user.interests || []).includes(interest));
    
    const matchesAge = user.age >= ageRange[0] && user.age <= ageRange[1];
    
    return matchesSearch && matchesInterests && matchesAge;
  });
  
  switch (sortBy) {
    case 'active':
      filteredUsers = sortUsersByActivity(filteredUsers);
      break;
    case 'recent':
      filteredUsers = sortUsersByRecency(filteredUsers);
      break;
    case 'similar':
      if (currentUserInterests && currentUserInterests.length > 0) {
       filteredUsers = sortUsersBySimilarity(filteredUsers, currentUserInterests);
      }
      break;
    default:
      // Default sort (e.g., by relevance or ID) can be added if needed
      break;
  }
  
  if (filteredUsers.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-muted/20 rounded-lg border border-dashed">
        <div className="bg-muted/50 rounded-full p-4 mb-4">
          <Users className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No users found</h3>
        <p className="text-muted-foreground max-w-md mb-3">
          Try adjusting your filters or search terms to find more people.
        </p>
        {/* <Button variant="outline">Reset Filters</Button> */}
      </div>
    );
  }
  
  return (
    <>
      {filteredUsers.map((user) => (
        <UserCard 
          key={user.id} 
          user={user} 
          className="transform-gpu transition-all duration-200 hover:-translate-y-1"
        />
      ))}
    </>
  );
}
