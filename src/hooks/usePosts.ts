
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Post } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';

export function usePosts(userId?: string) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, [userId, user]);

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            id,
            name,
            username,
            avatar
          )
        `)
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.eq('is_public', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching posts:', error);
        toast({
          title: "Error",
          description: "Failed to load posts",
          variant: "destructive"
        });
      } else {
        setPosts(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: {
    content: string;
    media_url?: string;
    media_type?: 'image' | 'video';
    is_public?: boolean;
    type?: 'post' | 'event' | 'announcement';
    event_date?: string;
    event_location?: string;
  }) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([{
          ...postData,
          user_id: user.id
        }])
        .select(`
          *,
          profiles!posts_user_id_fkey (
            id,
            name,
            username,
            avatar
          )
        `)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create post",
          variant: "destructive"
        });
        return { error: error.message };
      }

      setPosts(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Post created successfully"
      });
      return { data };
    } catch (error) {
      console.error('Error creating post:', error);
      return { error: 'Failed to create post' };
    }
  };

  return {
    posts,
    loading,
    createPost,
    refetch: fetchPosts
  };
}
