
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define a proper Post type based on the existing database structure
interface DatabasePost {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  likes: number;
  comments: number;
  is_public: boolean;
  type: string;
  event_date: string | null;
  event_location: string | null;
  profiles?: {
    id: string;
    name: string | null;
    username: string | null;
    avatar: string | null;
  };
}

export function usePosts(userId?: string) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<DatabasePost[]>([]);
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
