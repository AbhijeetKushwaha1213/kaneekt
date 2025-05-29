
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MapPin, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useGeolocation } from '@/hooks/useGeolocation';
import { supabase } from '@/integrations/supabase/client';
import { formatDistance } from '@/utils/distanceUtils';

export function LocationSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { latitude, longitude, accuracy, error, loading, getCurrentPosition } = useGeolocation();
  
  const [locationSharing, setLocationSharing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadLocationSettings();
  }, [user]);

  const loadLocationSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('location_sharing_enabled, latitude, longitude, location_updated_at')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading location settings:', error);
        return;
      }

      if (data) {
        setLocationSharing(data.location_sharing_enabled || false);
        if (data.location_updated_at) {
          setLastUpdated(new Date(data.location_updated_at));
        }
      }
    } catch (error) {
      console.error('Error loading location settings:', error);
    }
  };

  const updateLocationSharing = async (enabled: boolean) => {
    if (!user) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          location_sharing_enabled: enabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      setLocationSharing(enabled);
      
      toast({
        title: 'Location sharing updated',
        description: `Location sharing has been ${enabled ? 'enabled' : 'disabled'}.`
      });
    } catch (error: any) {
      console.error('Error updating location sharing:', error);
      toast({
        title: 'Error updating settings',
        description: error.message || 'Failed to update location sharing settings',
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
      const { error } = await supabase
        .from('profiles')
        .update({
          latitude: latitude,
          longitude: longitude,
          location_updated_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      setLastUpdated(new Date());
      
      toast({
        title: 'Location updated',
        description: 'Your location has been updated successfully.'
      });
    } catch (error: any) {
      console.error('Error updating location:', error);
      toast({
        title: 'Error updating location',
        description: error.message || 'Failed to update location',
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
