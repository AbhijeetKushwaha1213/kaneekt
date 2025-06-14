
import React from 'react';
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface LocationPermissionPromptProps {
  onRequestLocation: () => void;
}

export function LocationPermissionPrompt({ onRequestLocation }: LocationPermissionPromptProps) {
  return (
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
  );
}
