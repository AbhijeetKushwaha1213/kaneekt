
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
  updated_at: string;
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
        .eq('is_private', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const enhancedChannels = (data || []).map(channel => ({
        ...channel,
        owner: channel.profiles
      }));

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
          role,
          channels (
            *,
            profiles!channels_owner_id_fkey (
              id,
              name,
              avatar
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const enhancedUserChannels = (data || []).map(member => ({
        ...member.channels,
        owner: member.channels.profiles,
        user_role: member.role,
        is_member: true
      }));

      setUserChannels(enhancedUserChannels);
    } catch (error) {
      console.error('Error fetching user channels:', error);
    }
  };

  const createChannel = async (channelData: Omit<Channel, 'id' | 'owner_id' | 'member_count' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { data, error } = await supabase
        .from('channels')
        .insert({
          ...channelData,
          owner_id: user.id,
          member_count: 1
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join the creator as admin
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
