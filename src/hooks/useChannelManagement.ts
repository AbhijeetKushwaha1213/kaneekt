
import { useState, useEffect } from 'react';
import { Channel } from '@/types';

export function useChannelManagement() {
  const [joinedChannels, setJoinedChannels] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load joined channels from localStorage on mount
    const stored = localStorage.getItem('joinedChannels');
    if (stored) {
      try {
        const channelIds = JSON.parse(stored);
        setJoinedChannels(new Set(channelIds));
      } catch (error) {
        console.error('Failed to load joined channels:', error);
      }
    }
  }, []);

  const joinChannel = (channelId: string) => {
    const newJoinedChannels = new Set(joinedChannels);
    newJoinedChannels.add(channelId);
    setJoinedChannels(newJoinedChannels);
    localStorage.setItem('joinedChannels', JSON.stringify(Array.from(newJoinedChannels)));
  };

  const leaveChannel = (channelId: string) => {
    const newJoinedChannels = new Set(joinedChannels);
    newJoinedChannels.delete(channelId);
    setJoinedChannels(newJoinedChannels);
    localStorage.setItem('joinedChannels', JSON.stringify(Array.from(newJoinedChannels)));
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
