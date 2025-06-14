
import React from 'react';
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface NearbyPeopleHeaderProps {
  onRefreshLocation: () => void;
  isRefreshingLocation: boolean;
}

export function NearbyPeopleHeader({ onRefreshLocation, isRefreshingLocation }: NearbyPeopleHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-medium">People Near You</h2>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefreshLocation}
        disabled={isRefreshingLocation}
      >
        <MapPin className="mr-2 h-4 w-4" />
        {isRefreshingLocation ? "Updating..." : "Refresh location"}
      </Button>
    </div>
  );
}
