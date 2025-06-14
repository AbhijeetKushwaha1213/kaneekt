
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

// Type guard to check if the profile data is valid and not an error object
function isActualProfileData(profileData: any): profileData is { id: string; name: string; username?: string; avatar?: string } {
  if (profileData && typeof profileData === 'object' && !('message' in profileData && 'code' in profileData)) {
    // Check for essential profile properties
    return typeof profileData.id === 'string' && typeof profileData.name === 'string';
  }
  return false;
}

export function useChannelMembers(channelId?: string) {
  const { user: authUser } = useAuth(); // Renamed to avoid conflict with member.user
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
    const subscription = subscribeToMemberChanges();
    
    return () => {
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, [channelId, authUser]);

  const fetchMembers = async () => {
    if (!channelId) return;
    setLoading(true); // Set loading true at the start of fetch

    try {
      const { data, error } = await supabase
        .from('channel_members')
        .select(`
          id,
          user_id,
          channel_id,
          role,
          joined_at,
          profiles (
            id,
            name,
            username,
            avatar
          )
        `)
        .eq('channel_id', channelId);

      if (error) {
        console.error('Error fetching channel members:', error);
        toast({ title: "Error", description: "Failed to fetch members.", variant: "destructive" });
      } else {
        const transformedMembers = (data || []).map(member => {
          const profileData = member.profiles;
          return {
            id: member.id,
            user_id: member.user_id,
            channel_id: member.channel_id,
            role: member.role as 'admin' | 'moderator' | 'member',
            joined_at: member.joined_at,
            user: {
              id: isActualProfileData(profileData) ? profileData.id : member.user_id,
              name: isActualProfileData(profileData) ? profileData.name : 'Unknown User',
              username: isActualProfileData(profileData) ? profileData.username : undefined,
              avatar: isActualProfileData(profileData) ? profileData.avatar : undefined
            }
          };
        });
        
        setMembers(transformedMembers);
        
        if (authUser) {
          const userIsMember = transformedMembers.some(member => member.user_id === authUser.id);
          setIsJoined(!!userIsMember);
        }
      }
    } catch (err) {
      console.error('Error in fetchMembers:', err);
      toast({ title: "Error", description: "An unexpected error occurred while fetching members.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMemberChanges = () => {
    if (!channelId) return null;

    const channelSubscription = supabase
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
          fetchMembers(); 
        }
      )
      .subscribe();

    return channelSubscription;
  };

  const joinChannel = async () => {
    if (!channelId || !authUser) return;

    try {
      const { error } = await supabase
        .from('channel_members')
        .insert({
          channel_id: channelId,
          user_id: authUser.id,
          role: 'member'
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to join channel: " + error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "You've joined the channel!"
        });
        setIsJoined(true); // Optimistic update, fetchMembers will confirm
      }
    } catch (err: any) {
      console.error('Error joining channel:', err);
      toast({
        title: "Error",
        description: "Failed to join channel: " + err.message,
        variant: "destructive"
      });
    }
  };

  const leaveChannel = async () => {
    if (!channelId || !authUser) return;

    try {
      const { error } = await supabase
        .from('channel_members')
        .delete()
        .eq('channel_id', channelId)
        .eq('user_id', authUser.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to leave channel: " + error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "You've left the channel"
        });
        setIsJoined(false); // Optimistic update, fetchMembers will confirm
      }
    } catch (err: any) {
      console.error('Error leaving channel:', err);
      toast({
        title: "Error",
        description: "Failed to leave channel: " + err.message,
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
