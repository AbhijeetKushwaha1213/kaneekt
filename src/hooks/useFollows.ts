
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
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      checkFollowStatus();
      getFollowCounts();
    }
  }, [userId, user]);

  const checkFollowStatus = async () => {
    if (!user || !userId || user.id === userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking follow status:', error);
      } else {
        setIsFollowing(!!data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFollowCounts = async () => {
    if (!userId) return;

    try {
      const [followersResult, followingResult] = await Promise.all([
        supabase
          .from('follows')
          .select('id', { count: 'exact' })
          .eq('following_id', userId),
        supabase
          .from('follows')
          .select('id', { count: 'exact' })
          .eq('follower_id', userId)
      ]);

      setFollowersCount(followersResult.count || 0);
      setFollowingCount(followingResult.count || 0);
    } catch (error) {
      console.error('Error getting follow counts:', error);
    }
  };

  const toggleFollow = async () => {
    if (!user || !userId || user.id === userId) return;

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);

        if (error) {
          toast({
            title: "Error",
            description: "Failed to unfollow user",
            variant: "destructive"
          });
          return;
        }

        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
        toast({
          title: "Unfollowed",
          description: "You are no longer following this user"
        });
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert([{
            follower_id: user.id,
            following_id: userId
          }]);

        if (error) {
          toast({
            title: "Error",
            description: "Failed to follow user",
            variant: "destructive"
          });
          return;
        }

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
        description: "Something went wrong",
        variant: "destructive"
      });
    }
  };

  return {
    isFollowing,
    followersCount,
    followingCount,
    loading,
    toggleFollow
  };
}
