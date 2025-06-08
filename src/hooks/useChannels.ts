
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Channel {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  is_private: boolean;
  invite_only: boolean;
  category?: string;
  tags: string[];
  member_count: number;
  created_at: string;
  owner?: {
    id: string;
    name: string;
    avatar?: string;
  };
  user_role?: 'admin' | 'moderator' | 'member';
  is_member?: boolean;
}

export function useChannels() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [myChannels, setMyChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchChannels();
    if (user) {
      fetchMyChannels();
    }
    subscribeToChannels();
  }, [user]);

  const fetchChannels = async () => {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select(`
          *,
          owner:profiles!channels_owner_id_fkey (
            id,
            name,
            avatar
          )
        `)
        .eq('is_private', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChannels(data || []);
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

  const fetchMyChannels = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('channel_members')
        .select(`
          role,
          channel:channels (
            *,
            owner:profiles!channels_owner_id_fkey (
              id,
              name,
              avatar
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const channelsWithRole = data?.map(item => ({
        ...item.channel,
        user_role: item.role,
        is_member: true
      })) || [];

      setMyChannels(channelsWithRole);
    } catch (error) {
      console.error('Error fetching my channels:', error);
    }
  };

  const subscribeToChannels = () => {
    const channel = supabase
      .channel('channels-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'channels'
        },
        () => {
          fetchChannels();
          if (user) fetchMyChannels();
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const createChannel = async (channelData: {
    name: string;
    description?: string;
    is_private?: boolean;
    invite_only?: boolean;
    category?: string;
    tags?: string[];
  }) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('channels')
        .insert([{
          owner_id: user.id,
          tags: channelData.tags || [],
          is_private: channelData.is_private || false,
          invite_only: channelData.invite_only || false,
          ...channelData
        }])
        .select()
        .single();

      if (error) throw error;

      // Automatically join the creator as admin
      await supabase
        .from('channel_members')
        .insert([{
          channel_id: data.id,
          user_id: user.id,
          role: 'admin'
        }]);

      toast({
        title: "Channel created",
        description: `${channelData.name} has been created successfully`
      });

      return { data };
    } catch (error) {
      console.error('Error creating channel:', error);
      toast({
        title: "Error",
        description: "Failed to create channel",
        variant: "destructive"
      });
      return { error: error.message };
    }
  };

  const joinChannel = async (channelId: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('channel_members')
        .insert([{
          channel_id: channelId,
          user_id: user.id,
          role: 'member'
        }]);

      if (error) throw error;

      await fetchMyChannels();
      
      toast({
        title: "Joined channel",
        description: "You have successfully joined the channel"
      });

      return { success: true };
    } catch (error) {
      console.error('Error joining channel:', error);
      toast({
        title: "Error",
        description: "Failed to join channel",
        variant: "destructive"
      });
      return { error: error.message };
    }
  };

  const leaveChannel = async (channelId: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('channel_members')
        .delete()
        .eq('channel_id', channelId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchMyChannels();
      
      toast({
        title: "Left channel",
        description: "You have left the channel"
      });

      return { success: true };
    } catch (error) {
      console.error('Error leaving channel:', error);
      toast({
        title: "Error",
        description: "Failed to leave channel",
        variant: "destructive"
      });
      return { error: error.message };
    }
  };

  return {
    channels,
    myChannels,
    loading,
    createChannel,
    joinChannel,
    leaveChannel,
    refetch: fetchChannels
  };
}
