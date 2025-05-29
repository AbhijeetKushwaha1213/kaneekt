
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MapPin, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useGeolocation } from '@/hooks/useGeolocation';
import { formatDistance } from '@/utils/distanceUtils';

export function LocationSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { latitude, longitude, accuracy, error, loading, getCurrentPosition } = useGeolocation();
  
  const [locationSharing, setLocationSharing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    // Since database doesn't have location fields yet, use localStorage for demo
    const storedLocationSharing = localStorage.getItem('locationSharing');
    if (storedLocationSharing) {
      setLocationSharing(JSON.parse(storedLocationSharing));
    }
    
    const storedLastUpdated = localStorage.getItem('locationLastUpdated');
    if (storedLastUpdated) {
      setLastUpdated(new Date(storedLastUpdated));
    }
  }, [user]);

  const updateLocationSharing = async (enabled: boolean) => {
    if (!user) return;

    setIsUpdating(true);
    try {
      // Store in localStorage since database columns don't exist yet
      localStorage.setItem('locationSharing', JSON.stringify(enabled));
      setLocationSharing(enabled);
      
      toast({
        title: 'Location sharing updated',
        description: `Location sharing has been ${enabled ? 'enabled' : 'disabled'}.`
      });
    } catch (error: any) {
      console.error('Error updating location sharing:', error);
      toast({
        title: 'Error updating settings',
        description: 'Failed to update location sharing settings',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const updateLocation = async () => {
    if (!user || !latitude || !longitude) return;

    setIsUpdating(true);
    try {
      // Store in localStorage since database columns don't exist yet
      const now = new Date();
      localStorage.setItem('locationLastUpdated', now.toISOString());
      setLastUpdated(now);
      
      toast({
        title: 'Location updated',
        description: 'Your location has been updated successfully.'
      });
    } catch (error: any) {
      console.error('Error updating location:', error);
      toast({
        title: 'Error updating location',
        description: 'Failed to update location',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGetLocation = () => {
    getCurrentPosition();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location Services
        </CardTitle>
        <CardDescription>
          Control how your location is used to find nearby people and calculate distances
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Location Sharing Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="location-sharing">Enable Location Sharing</Label>
            <p className="text-sm text-muted-foreground">
              Allow others to see your approximate distance and discover you nearby
            </p>
          </div>
          <Switch
            id="location-sharing"
            checked={locationSharing}
            onCheckedChange={updateLocationSharing}
            disabled={isUpdating}
          />
        </div>

        {/* Current Location Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Current Location</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGetLocation}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Getting Location...' : 'Update Location'}
            </Button>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </p>
          )}

          {latitude && longitude && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                <p>Latitude: {latitude.toFixed(6)}</p>
                <p>Longitude: {longitude.toFixed(6)}</p>
                {accuracy && <p>Accuracy: ±{formatDistance(accuracy / 1000)}</p>}
              </div>
              
              <Button
                onClick={updateLocation}
                disabled={isUpdating}
                size="sm"
                className="w-full"
              >
                {isUpdating ? 'Saving...' : 'Save Current Location'}
              </Button>
            </div>
          )}

          {lastUpdated && (
            <p className="text-xs text-muted-foreground">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
