
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Story, StoryInsert, StoryWithInteractions } from '@/types/supabase';

export function useStories() {
  const { user } = useAuth();
  const [stories, setStories] = useState<StoryWithInteractions[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStories();
  }, [user]);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          profiles!stories_user_id_fkey (
            id,
            name,
            username,
            avatar
          )
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enhance stories with interaction data
      const enhancedStories = await Promise.all(
        (data || []).map(async (story) => {
          const [viewsData, reactionsData, userViewData, userReactionData] = await Promise.all([
            supabase.from('story_views').select('id', { count: 'exact' }).eq('story_id', story.id),
            supabase.from('story_reactions').select('id', { count: 'exact' }).eq('story_id', story.id),
            user ? supabase.from('story_views').select('id').eq('story_id', story.id).eq('viewer_id', user.id).single() : null,
            user ? supabase.from('story_reactions').select('reaction').eq('story_id', story.id).eq('user_id', user.id).single() : null
          ]);

          return {
            ...story,
            views_count: viewsData.count || 0,
            reactions_count: reactionsData.count || 0,
            has_viewed: !!userViewData?.data,
            user_reaction: userReactionData?.data?.reaction,
            author: story.profiles
          };
        })
      );

      setStories(enhancedStories);
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

  const createStory = async (storyData: Omit<StoryInsert, 'user_id'>) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { data, error } = await supabase
        .from('stories')
        .insert({ ...storyData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      await fetchStories(); // Refresh stories
      toast({
        title: "Success",
        description: "Story created successfully"
      });

      return { data };
    } catch (error) {
      console.error('Error creating story:', error);
      toast({
        title: "Error",
        description: "Failed to create story",
        variant: "destructive"
      });
      return { error: 'Failed to create story' };
    }
  };

  const viewStory = async (storyId: string) => {
    if (!user) return;

    try {
      await supabase.from('story_views').upsert({
        story_id: storyId,
        viewer_id: user.id
      });

      // Update local state
      setStories(prev => prev.map(story => 
        story.id === storyId 
          ? { ...story, has_viewed: true, views_count: (story.views_count || 0) + (story.has_viewed ? 0 : 1) }
          : story
      ));
    } catch (error) {
      console.error('Error marking story as viewed:', error);
    }
  };

  const reactToStory = async (storyId: string, reaction: string) => {
    if (!user) return;

    try {
      await supabase.from('story_reactions').upsert({
        story_id: storyId,
        user_id: user.id,
        reaction
      });

      // Update local state
      setStories(prev => prev.map(story => 
        story.id === storyId 
          ? { 
              ...story, 
              user_reaction: reaction,
              reactions_count: story.user_reaction ? story.reactions_count : (story.reactions_count || 0) + 1
            }
          : story
      ));

      toast({
        title: "Success",
        description: "Reaction added to story"
      });
    } catch (error) {
      console.error('Error reacting to story:', error);
      toast({
        title: "Error",
        description: "Failed to react to story",
        variant: "destructive"
      });
    }
  };

  return {
    stories,
    loading,
    createStory,
    viewStory,
    reactToStory,
    refetch: fetchStories
  };
}
