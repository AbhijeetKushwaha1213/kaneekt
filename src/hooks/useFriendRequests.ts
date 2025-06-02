
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FriendRequest } from '@/types/supabase';

interface FriendRequestWithProfile extends FriendRequest {
  sender_profile?: {
    id: string;
    name: string | null;
    username: string | null;
    avatar: string | null;
  };
  receiver_profile?: {
    id: string;
    name: string | null;
    username: string | null;
    avatar: string | null;
  };
}

export function useFriendRequests() {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<FriendRequestWithProfile[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequestWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchFriendRequests();
    }
  }, [user]);

  const fetchFriendRequests = async () => {
    if (!user) return;

    try {
      // Fetch received requests
      const { data: received, error: receivedError } = await supabase
        .from('friend_requests')
        .select(`
          *,
          sender_profile:profiles!friend_requests_sender_id_fkey (
            id,
            name,
            username,
            avatar
          )
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      // Fetch sent requests
      const { data: sent, error: sentError } = await supabase
        .from('friend_requests')
        .select(`
          *,
          receiver_profile:profiles!friend_requests_receiver_id_fkey (
            id,
            name,
            username,
            avatar
          )
        `)
        .eq('sender_id', user.id)
        .eq('status', 'pending');

      if (receivedError || sentError) {
        throw receivedError || sentError;
      }

      setPendingRequests(received || []);
      setSentRequests(sent || []);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      toast({
        title: "Error",
        description: "Failed to load friend requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (receiverId: string) => {
    if (!user || user.id === receiverId) return false;

    try {
      const { error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId
        });

      if (error) throw error;

      await fetchFriendRequests();
      toast({
        title: "Success",
        description: "Friend request sent successfully"
      });

      return true;
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive"
      });
      return false;
    }
  };

  const respondToFriendRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status })
        .eq('id', requestId)
        .eq('receiver_id', user.id);

      if (error) throw error;

      await fetchFriendRequests();
      toast({
        title: "Success",
        description: `Friend request ${status} successfully`
      });
    } catch (error) {
      console.error('Error responding to friend request:', error);
      toast({
        title: "Error",
        description: "Failed to respond to friend request",
        variant: "destructive"
      });
    }
  };

  const cancelFriendRequest = async (requestId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('friend_requests')
        .delete()
        .eq('id', requestId)
        .eq('sender_id', user.id);

      if (error) throw error;

      await fetchFriendRequests();
      toast({
        title: "Success",
        description: "Friend request cancelled successfully"
      });
    } catch (error) {
      console.error('Error cancelling friend request:', error);
      toast({
        title: "Error",
        description: "Failed to cancel friend request",
        variant: "destructive"
      });
    }
  };

  return {
    pendingRequests,
    sentRequests,
    loading,
    sendFriendRequest,
    respondToFriendRequest,
    cancelFriendRequest,
    refetch: fetchFriendRequests
  };
}
