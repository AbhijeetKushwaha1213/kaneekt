
import React from 'react';
import { User } from '@/types';
import { UserCard } from "@/components/ui/user-card";

interface NearbyPeopleListProps {
  users: User[];
  latitude: number | null;
  longitude: number | null;
}

export function NearbyPeopleList({ users, latitude, longitude }: NearbyPeopleListProps) {
  if (users.length > 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {users.map(user => user ? (
          <UserCard key={user.id} user={user} />
        ) : null)}
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">
        No people found matching your criteria.
        {latitude && longitude && " Current location based sorting might be limited without precise user locations."}
      </p>
    </div>
  );
}
