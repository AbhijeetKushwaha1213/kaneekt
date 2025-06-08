
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  distance?: number;
}

export function useLocationSharing() {
  const { user } = useAuth();
  const [isSharing, setIsSharing] = useState(false);
  const [nearbyUsers, setNearbyUsers] = useState<UserLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      checkSharingStatus();
      fetchNearbyUsers();
    }
  }, [user]);

  const checkSharingStatus = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_locations')
        .select('is_sharing')
        .eq('user_id', user.id)
        .single();

      setIsSharing(data?.is_sharing || false);
    } catch (error) {
      console.error('Error checking sharing status:', error);
    }
  };

  const fetchNearbyUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_locations')
        .select(`
          *,
          profiles!user_locations_user_id_fkey (
            id,
            name,
            avatar
          )
        `)
        .eq('is_sharing', true)
        .gt('expires_at', new Date().toISOString())
        .neq('user_id', user?.id || '');

      if (error) {
        console.error('Error fetching nearby users:', error);
        // Fallback query without profile relationship
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('user_locations')
          .select('*')
          .eq('is_sharing', true)
          .gt('expires_at', new Date().toISOString())
          .neq('user_id', user?.id || '');
          
        if (fallbackError) throw fallbackError;
        
        const enhancedFallbackUsers = (fallbackData || []).map(location => ({
          ...location,
          latitude: Number(location.latitude),
          longitude: Number(location.longitude),
          accuracy: location.accuracy ? Number(location.accuracy) : undefined,
          status: (location.status || 'looking-to-chat') as UserLocation['status'],
          location_name: location.location_name || undefined,
          user: undefined
        })) as UserLocation[];
        
        setNearbyUsers(enhancedFallbackUsers);
        return;
      }

      const enhancedUsers = (data || []).map(location => {
        const profileData = location.profiles;
        let user = undefined;
        
        // Safe profile data handling
        if (profileData) {
          try {
            if (Array.isArray(profileData) && profileData.length > 0) {
              const firstProfile = profileData[0];
              if (firstProfile && typeof firstProfile === 'object' && firstProfile !== null) {
                const profile = firstProfile as { id: string; name?: string; avatar?: string };
                user = {
                  id: profile.id,
                  name: profile.name || 'Unknown User',
                  avatar: profile.avatar || undefined
                };
              }
            } else if (profileData && typeof profileData === 'object' && profileData !== null && !Array.isArray(profileData)) {
              const profile = profileData as { id: string; name?: string; avatar?: string };
              user = {
                id: profile.id,
                name: profile.name || 'Unknown User',
                avatar: profile.avatar || undefined
              };
            }
          } catch (err) {
            console.warn('Error processing profile data:', err);
          }
        }
          
        return {
          ...location,
          latitude: Number(location.latitude),
          longitude: Number(location.longitude),
          accuracy: location.accuracy ? Number(location.accuracy) : undefined,
          status: (location.status || 'looking-to-chat') as UserLocation['status'],
          location_name: location.location_name || undefined,
          user
        };
      }) as UserLocation[];

      setNearbyUsers(enhancedUsers);
    } catch (error) {
      console.error('Error fetching nearby users:', error);
      toast({
        title: "Error",
        description: "Failed to load nearby users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startSharing = async (
    latitude: number,
    longitude: number,
    status: UserLocation['status'] = 'looking-to-chat',
    accuracy?: number,
    locationName?: string
  ) => {
    if (!user) return;

    try {
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      await supabase.from('user_locations').upsert({
        user_id: user.id,
        latitude,
        longitude,
        accuracy,
        status,
        is_sharing: true,
        location_name: locationName,
        expires_at: expiresAt.toISOString()
      });

      setIsSharing(true);
      await fetchNearbyUsers();

      toast({
        title: "Location sharing started",
        description: "You're now visible to nearby users"
      });
    } catch (error) {
      console.error('Error starting location sharing:', error);
      toast({
        title: "Error",
        description: "Failed to start location sharing",
        variant: "destructive"
      });
    }
  };

  const stopSharing = async () => {
    if (!user) return;

    try {
      await supabase
        .from('user_locations')
        .update({ is_sharing: false })
        .eq('user_id', user.id);

      setIsSharing(false);
      await fetchNearbyUsers();

      toast({
        title: "Location sharing stopped",
        description: "You're no longer visible to nearby users"
      });
    } catch (error) {
      console.error('Error stopping location sharing:', error);
      toast({
        title: "Error",
        description: "Failed to stop location sharing",
        variant: "destructive"
      });
    }
  };

  const updateStatus = async (status: UserLocation['status']) => {
    if (!user) return;

    try {
      await supabase
        .from('user_locations')
        .update({ status })
        .eq('user_id', user.id);

      toast({
        title: "Status updated",
        description: `Your status is now "${status}"`
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  return {
    isSharing,
    nearbyUsers,
    loading,
    startSharing,
    stopSharing,
    updateStatus,
    refetch: fetchNearbyUsers
  };
}
