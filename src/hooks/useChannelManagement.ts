
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Channel } from '@/types';

export function useChannelManagement() {
  const { user } = useAuth();
  const [joinedChannels, setJoinedChannels] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      loadJoinedChannels();
    }
  }, [user]);

  const loadJoinedChannels = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('channel_members')
        .select('channel_id')
        .eq('user_id', user.id);

      if (!error && data) {
        const channelIds = data.map(member => member.channel_id);
        setJoinedChannels(new Set(channelIds));
      }
    } catch (error) {
      console.error('Failed to load joined channels:', error);
    }
  };

  const joinChannel = async (channelId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('channel_members')
        .insert({
          channel_id: channelId,
          user_id: user.id,
          role: 'member'
        });

      if (!error) {
        const newJoinedChannels = new Set(joinedChannels);
        newJoinedChannels.add(channelId);
        setJoinedChannels(newJoinedChannels);
      }
    } catch (error) {
      console.error('Failed to join channel:', error);
    }
  };

  const leaveChannel = async (channelId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('channel_members')
        .delete()
        .eq('channel_id', channelId)
        .eq('user_id', user.id);

      if (!error) {
        const newJoinedChannels = new Set(joinedChannels);
        newJoinedChannels.delete(channelId);
        setJoinedChannels(newJoinedChannels);
      }
    } catch (error) {
      console.error('Failed to leave channel:', error);
    }
  };

  const isChannelJoined = (channelId: string) => {
    return joinedChannels.has(channelId);
  };

  const getChannelsWithJoinedStatus = (channels: Channel[]) => {
    return channels.map(channel => ({
      ...channel,
      isJoined: joinedChannels.has(channel.id)
    }));
  };

  return {
    joinChannel,
    leaveChannel,
    isChannelJoined,
    getChannelsWithJoinedStatus,
    joinedChannels: Array.from(joinedChannels)
  };
}
