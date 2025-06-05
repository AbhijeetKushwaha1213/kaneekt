
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FriendRequest, FriendRequestInsert, BasicProfile } from '@/types/supabase';

interface FriendRequestWithProfile extends FriendRequest {
  sender_profile?: BasicProfile;
  receiver_profile?: BasicProfile;
}

export function useFriendRequests() {
  const { user } = useAuth();
  const [sentRequests, setSentRequests] = useState<FriendRequestWithProfile[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequestWithProfile[]>([]);
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
      // Fetch sent requests
      const { data: sentData, error: sentError } = await supabase
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
        .eq('sender_id', user.id);

      if (sentError) throw sentError;

      // Fetch received requests
      const { data: receivedData, error: receivedError } = await supabase
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

      if (receivedError) throw receivedError;

      setSentRequests(sentData || []);
      setReceivedRequests(receivedData || []);
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
    if (!user) return { error: 'Not authenticated' };

    try {
      const requestData: FriendRequestInsert = {
        sender_id: user.id,
        receiver_id: receiverId,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('friend_requests')
        .insert(requestData)
        .select()
        .single();

      if (error) throw error;

      await fetchFriendRequests(); // Refresh requests
      toast({
        title: "Success",
        description: "Friend request sent"
      });

      return { data };
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive"
      });
      return { error: 'Failed to send friend request' };
    }
  };

  const respondToFriendRequest = async (requestId: string, action: 'accept' | 'decline') => {
    if (!user) return;

    try {
      const status = action === 'accept' ? 'accepted' : 'declined';
      
      const { error } = await supabase
        .from('friend_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .eq('receiver_id', user.id);

      if (error) throw error;

      await fetchFriendRequests(); // Refresh requests
      toast({
        title: "Success",
        description: `Friend request ${action}ed`
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

      await fetchFriendRequests(); // Refresh requests
      toast({
        title: "Success",
        description: "Friend request cancelled"
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
    sentRequests,
    receivedRequests,
    loading,
    sendFriendRequest,
    respondToFriendRequest,
    cancelFriendRequest,
    refetch: fetchFriendRequests
  };
}
