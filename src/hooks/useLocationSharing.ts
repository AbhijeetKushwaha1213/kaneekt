
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useGeolocation } from './useGeolocation';

export interface UserLocation {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  status: 'looking-to-chat' | 'open-to-meetup' | 'studying' | 'exploring';
  is_sharing: boolean;
  location_name?: string;
  last_updated: string;
  expires_at: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export function useLocationSharing() {
  const { user } = useAuth();
  const [nearbyUsers, setNearbyUsers] = useState<UserLocation[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { latitude, longitude, getCurrentPosition, accuracy } = useGeolocation();

  useEffect(() => {
    if (user) {
      checkSharingStatus();
      fetchNearbyUsers();
      subscribeToLocationUpdates();
    }
  }, [user]);

  const checkSharingStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_locations')
        .select('is_sharing')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setIsSharing(data.is_sharing);
      }
    } catch (error) {
      console.error('Error checking sharing status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_locations')
        .select(`
          *,
          user:profiles!user_locations_user_id_fkey (
            id,
            name,
            avatar
          )
        `)
        .eq('is_sharing', true)
        .gt('expires_at', new Date().toISOString());

      if (error) throw error;
      
      const locationsWithUsers = data?.map(location => ({
        ...location,
        status: location.status as 'looking-to-chat' | 'open-to-meetup' | 'studying' | 'exploring',
        user: Array.isArray(location.user) ? location.user[0] : location.user
      })) || [];
      
      setNearbyUsers(locationsWithUsers);
    } catch (error) {
      console.error('Error fetching nearby users:', error);
    }
  };

  const subscribeToLocationUpdates = () => {
    const channel = supabase
      .channel('location-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_locations'
        },
        () => fetchNearbyUsers()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const startSharing = async (status: UserLocation['status'] = 'looking-to-chat', locationName?: string) => {
    if (!user) return { error: 'User not authenticated' };

    if (!latitude || !longitude) {
      getCurrentPosition();
      toast({
        title: "Location required",
        description: "Please enable location access to share your location",
        variant: "destructive"
      });
      return { error: 'Location not available' };
    }

    try {
      const { error } = await supabase
        .from('user_locations')
        .upsert({
          user_id: user.id,
          latitude,
          longitude,
          accuracy,
          status,
          is_sharing: true,
          location_name: locationName,
          last_updated: new Date().toISOString(),
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour from now
        });

      if (error) throw error;

      setIsSharing(true);
      toast({
        title: "Location sharing started",
        description: "You're now visible to nearby users"
      });

      return { success: true };
    } catch (error) {
      console.error('Error starting location sharing:', error);
      toast({
        title: "Error",
        description: "Failed to start location sharing",
        variant: "destructive"
      });
      return { error: error.message };
    }
  };

  const stopSharing = async () => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('user_locations')
        .update({ is_sharing: false })
        .eq('user_id', user.id);

      if (error) throw error;

      setIsSharing(false);
      toast({
        title: "Location sharing stopped",
        description: "You're no longer visible to nearby users"
      });

      return { success: true };
    } catch (error) {
      console.error('Error stopping location sharing:', error);
      toast({
        title: "Error",
        description: "Failed to stop location sharing",
        variant: "destructive"
      });
      return { error: error.message };
    }
  };

  return {
    nearbyUsers,
    isSharing,
    loading,
    startSharing,
    stopSharing,
    refetch: fetchNearbyUsers
  };
}
