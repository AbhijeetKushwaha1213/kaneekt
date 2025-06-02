
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useFollows(userId?: string) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      checkFollowStatus();
      fetchFollowCounts();
    }
  }, [userId, user]);

  const checkFollowStatus = async () => {
    if (!user || !userId || user.id === userId) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single();

      setIsFollowing(!!data);
    } catch (error) {
      // No follow relationship found
      setIsFollowing(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowCounts = async () => {
    if (!userId) return;

    try {
      const [followersData, followingData] = await Promise.all([
        supabase.from('follows').select('id', { count: 'exact' }).eq('following_id', userId),
        supabase.from('follows').select('id', { count: 'exact' }).eq('follower_id', userId)
      ]);

      setFollowersCount(followersData.count || 0);
      setFollowingCount(followingData.count || 0);
    } catch (error) {
      console.error('Error fetching follow counts:', error);
    }
  };

  const toggleFollow = async () => {
    if (!user || !userId || user.id === userId || actionLoading) return;

    setActionLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);

        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));

        toast({
          title: "Unfollowed",
          description: "You are no longer following this user"
        });
      } else {
        // Follow
        await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: userId
          });

        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);

        toast({
          title: "Following",
          description: "You are now following this user"
        });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  return {
    isFollowing,
    followersCount,
    followingCount,
    loading,
    actionLoading,
    toggleFollow
  };
}
