
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Story {
  id: string;
  user_id: string;
  content?: string;
  media_url?: string;
  media_type?: string;
  background_color?: string;
  text_color?: string;
  created_at: string;
  expires_at: string;
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  views_count?: number;
  has_viewed?: boolean;
}

export function useStories() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchStories();
      subscribeToStories();
    }
  }, [user]);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          author:profiles!stories_user_id_fkey (
            id,
            name,
            avatar
          )
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast({
        title: "Error",
        description: "Failed to load stories",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToStories = () => {
    const channel = supabase
      .channel('stories-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stories'
        },
        () => fetchStories()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const createStory = async (storyData: {
    content?: string;
    media_url?: string;
    media_type?: string;
    background_color?: string;
    text_color?: string;
  }) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('stories')
        .insert([{
          user_id: user.id,
          ...storyData
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Story created",
        description: "Your story has been shared successfully"
      });

      return { data };
    } catch (error) {
      console.error('Error creating story:', error);
      toast({
        title: "Error",
        description: "Failed to create story",
        variant: "destructive"
      });
      return { error: error.message };
    }
  };

  const viewStory = async (storyId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('story_views')
        .upsert({
          story_id: storyId,
          viewer_id: user.id
        });
    } catch (error) {
      console.error('Error marking story as viewed:', error);
    }
  };

  return {
    stories,
    loading,
    createStory,
    viewStory,
    refetch: fetchStories
  };
}
