import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ChannelMember {
  id: string;
  user_id: string;
  channel_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  user: {
    id: string;
    name: string;
    username?: string;
    avatar?: string;
  };
}

export function useChannelMembers(channelId?: string) {
  const { user } = useAuth();
  const [members, setMembers] = useState<ChannelMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!channelId) {
      setLoading(false);
      return;
    }

    fetchMembers();
    subscribeToMemberChanges();
  }, [channelId, user]);

  const fetchMembers = async () => {
    if (!channelId) return;

    try {
      const { data, error } = await supabase
        .from('channel_members')
        .select(`
          *,
          user:profiles!channel_members_user_id_fkey (
            id,
            name,
            username,
            avatar
          )
        `)
        .eq('channel_id', channelId);

      if (error) {
        console.error('Error fetching channel members:', error);
      } else {
        setMembers(data || []);
        
        // Check if current user is a member
        if (user) {
          const userIsMember = data?.some(member => member.user_id === user.id);
          setIsJoined(!!userIsMember);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMemberChanges = () => {
    if (!channelId) return;

    const channel = supabase
      .channel(`channel-members-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'channel_members',
          filter: `channel_id=eq.${channelId}`
        },
        () => {
          fetchMembers(); // Refetch when members change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const joinChannel = async () => {
    if (!channelId || !user) return;

    try {
      const { error } = await supabase
        .from('channel_members')
        .insert({
          channel_id: channelId,
          user_id: user.id,
          role: 'member'
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to join channel",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "You've joined the channel!"
        });
        setIsJoined(true);
      }
    } catch (error) {
      console.error('Error joining channel:', error);
      toast({
        title: "Error",
        description: "Failed to join channel",
        variant: "destructive"
      });
    }
  };

  const leaveChannel = async () => {
    if (!channelId || !user) return;

    try {
      const { error } = await supabase
        .from('channel_members')
        .delete()
        .eq('channel_id', channelId)
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to leave channel",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "You've left the channel"
        });
        setIsJoined(false);
      }
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
    members,
    loading,
    isJoined,
    joinChannel,
    leaveChannel,
    refetch: fetchMembers
  };
}
