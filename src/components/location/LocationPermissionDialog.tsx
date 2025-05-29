
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Shield, Users } from 'lucide-react';

interface LocationPermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  onDecline: () => void;
}

export function LocationPermissionDialog({ 
  open, 
  onOpenChange, 
  onAccept, 
  onDecline 
}: LocationPermissionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <DialogTitle>Enable Location Services</DialogTitle>
          </div>
          <DialogDescription className="space-y-4 pt-2">
            <p>
              To show nearby people and calculate distances, we need access to your location.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Users className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Discover Nearby People</p>
                  <p className="text-xs text-muted-foreground">
                    Find and connect with people in your area
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Privacy Protected</p>
                  <p className="text-xs text-muted-foreground">
                    Your exact location is never shared, only approximate distances
                  </p>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onDecline} className="w-full sm:w-auto">
            Not Now
          </Button>
          <Button onClick={onAccept} className="w-full sm:w-auto">
            Enable Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
