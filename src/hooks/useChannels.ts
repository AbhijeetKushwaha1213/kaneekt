
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Channel {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  is_private: boolean;
  invite_only: boolean;
  category?: string;
  tags: string[];
  member_count: number;
  created_at: string;
  updated_at: string;
  owner?: {
    id: string;
    name: string;
    avatar?: string;
  };
  is_member?: boolean;
  user_role?: string;
}

export function useChannels() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [userChannels, setUserChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchChannels();
    if (user) {
      fetchUserChannels();
    }
  }, [user]);

  const fetchChannels = async () => {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select(`
          *,
          profiles!channels_owner_id_fkey (
            id,
            name,
            avatar
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching channels:', error);
        // Fallback query without profile relationship
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('channels')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (fallbackError) throw fallbackError;
        
        const channelsWithFallback = (fallbackData || []).map(channel => ({
          ...channel,
          description: channel.description || '',
          category: channel.category || undefined,
          tags: channel.tags || [],
          member_count: channel.member_count || 0,
          owner: undefined
        })) as Channel[];
        
        setChannels(channelsWithFallback);
        return;
      }

      const enhancedChannels = (data || []).map(channel => {
        const profileData = channel.profiles;
        
        // Handle profile data more safely with proper type checking
        let owner = undefined;
        if (profileData) {
          if (Array.isArray(profileData) && profileData.length > 0) {
            // If it's an array, take the first element
            const firstProfile = profileData[0];
            if (firstProfile && typeof firstProfile === 'object' && 'id' in firstProfile) {
              owner = {
                id: firstProfile.id,
                name: firstProfile.name || 'Unknown',
                avatar: firstProfile.avatar || undefined
              };
            }
          } else if (profileData && typeof profileData === 'object' && 'id' in profileData) {
            // If it's a single object
            owner = {
              id: profileData.id,
              name: profileData.name || 'Unknown',
              avatar: profileData.avatar || undefined
            };
          }
        }
          
        return {
          ...channel,
          description: channel.description || '',
          category: channel.category || undefined,
          tags: channel.tags || [],
          member_count: channel.member_count || 0,
          owner
        };
      }) as Channel[];

      setChannels(enhancedChannels);
    } catch (error) {
      console.error('Error fetching channels:', error);
      toast({
        title: "Error",
        description: "Failed to load channels",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserChannels = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('channel_members')
        .select(`
          *,
          channels!channel_members_channel_id_fkey (
            *,
            profiles!channels_owner_id_fkey (
              id,
              name,
              avatar
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user channels:', error);
        // Fallback query without relationships
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('channel_members')
          .select(`
            *,
            channels!channel_members_channel_id_fkey (*)
          `)
          .eq('user_id', user.id);
          
        if (fallbackError) throw fallbackError;
        
        const userChannelsWithFallback = (fallbackData || []).map(membership => {
          const channel = membership.channels;
          if (!channel) return null;
          
          return {
            ...channel,
            description: channel.description || '',
            category: channel.category || undefined,
            tags: channel.tags || [],
            member_count: channel.member_count || 0,
            is_member: true,
            user_role: membership.role || 'member',
            owner: undefined
          };
        }).filter(Boolean) as Channel[];
        
        setUserChannels(userChannelsWithFallback);
        return;
      }

      const enhancedUserChannels = (data || []).map(membership => {
        const channel = membership.channels;
        if (!channel) return null;
        
        const profileData = channel.profiles;
        
        // Handle profile data more safely with proper type checking
        let owner = undefined;
        if (profileData) {
          if (Array.isArray(profileData) && profileData.length > 0) {
            // If it's an array, take the first element
            const firstProfile = profileData[0];
            if (firstProfile && typeof firstProfile === 'object' && 'id' in firstProfile) {
              owner = {
                id: firstProfile.id,
                name: firstProfile.name || 'Unknown',
                avatar: firstProfile.avatar || undefined
              };
            }
          } else if (profileData && typeof profileData === 'object' && 'id' in profileData) {
            // If it's a single object
            owner = {
              id: profileData.id,
              name: profileData.name || 'Unknown',
              avatar: profileData.avatar || undefined
            };
          }
        }

        return {
          ...channel,
          description: channel.description || '',
          category: channel.category || undefined,
          tags: channel.tags || [],
          member_count: channel.member_count || 0,
          is_member: true,
          user_role: membership.role || 'member',
          owner
        };
      }).filter(Boolean) as Channel[];

      setUserChannels(enhancedUserChannels);
    } catch (error) {
      console.error('Error fetching user channels:', error);
    }
  };

  const createChannel = async (channelData: Omit<Channel, 'id' | 'owner_id' | 'created_at' | 'updated_at' | 'owner'>) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { data, error } = await supabase
        .from('channels')
        .insert({
          ...channelData,
          owner_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join the creator
      await supabase.from('channel_members').insert({
        channel_id: data.id,
        user_id: user.id,
        role: 'admin'
      });

      await fetchChannels();
      await fetchUserChannels();
      
      toast({
        title: "Success",
        description: "Channel created successfully"
      });

      return { data };
    } catch (error) {
      console.error('Error creating channel:', error);
      toast({
        title: "Error",
        description: "Failed to create channel",
        variant: "destructive"
      });
      return { error: 'Failed to create channel' };
    }
  };

  const joinChannel = async (channelId: string) => {
    if (!user) return;

    try {
      await supabase.from('channel_members').insert({
        channel_id: channelId,
        user_id: user.id,
        role: 'member'
      });

      await fetchChannels();
      await fetchUserChannels();
      
      toast({
        title: "Success",
        description: "Joined channel successfully"
      });
    } catch (error) {
      console.error('Error joining channel:', error);
      toast({
        title: "Error",
        description: "Failed to join channel",
        variant: "destructive"
      });
    }
  };

  const leaveChannel = async (channelId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('channel_members')
        .delete()
        .eq('channel_id', channelId)
        .eq('user_id', user.id);

      await fetchChannels();
      await fetchUserChannels();
      
      toast({
        title: "Success",
        description: "Left channel successfully"
      });
    } catch (error) {
      console.error('Error leaving channel:', error);
      toast({
        title: "Error",
        description: "Failed to leave channel",
        variant: "destructive"
      });
    }
  };

  return {
    channels,
    userChannels,
    loading,
    createChannel,
    joinChannel,
    leaveChannel,
    refetch: fetchChannels
  };
}
