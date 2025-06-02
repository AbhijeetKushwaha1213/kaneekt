
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useLikes(postId?: string, commentId?: string) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if ((postId || commentId) && user) {
      checkLikeStatus();
      fetchLikesCount();
    }
  }, [postId, commentId, user]);

  const checkLikeStatus = async () => {
    if (!user) return;

    try {
      const query = supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id);

      if (postId) {
        query.eq('post_id', postId);
      } else if (commentId) {
        query.eq('comment_id', commentId);
      }

      const { data } = await query.single();
      setIsLiked(!!data);
    } catch (error) {
      // No like found, that's fine
      setIsLiked(false);
    }
  };

  const fetchLikesCount = async () => {
    try {
      const query = supabase
        .from('likes')
        .select('id', { count: 'exact' });

      if (postId) {
        query.eq('post_id', postId);
      } else if (commentId) {
        query.eq('comment_id', commentId);
      }

      const { count } = await query;
      setLikesCount(count || 0);
    } catch (error) {
      console.error('Error fetching likes count:', error);
    }
  };

  const toggleLike = async () => {
    if (!user || loading) return;

    setLoading(true);
    try {
      if (isLiked) {
        // Unlike
        const query = supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id);

        if (postId) {
          query.eq('post_id', postId);
        } else if (commentId) {
          query.eq('comment_id', commentId);
        }

        await query;
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        // Like
        const likeData: any = {
          user_id: user.id,
        };

        if (postId) {
          likeData.post_id = postId;
        } else if (commentId) {
          likeData.comment_id = commentId;
        }

        await supabase.from('likes').insert(likeData);
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    isLiked,
    likesCount,
    loading,
    toggleLike
  };
}
