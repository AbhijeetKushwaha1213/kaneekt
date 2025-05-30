
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Play, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  content?: string;
  view_count: number;
  created_at: string;
  expires_at: string;
  profiles?: {
    name: string;
    avatar: string;
  };
}

export function StoriesCarousel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          profiles:user_id (name, avatar)
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      console.error('Error loading stories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load stories',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const viewStory = async (story: Story) => {
    if (!user) return;
    
    setSelectedStory(story);
    
    // Record story view
    try {
      await supabase
        .from('story_views')
        .insert({
          story_id: story.id,
          viewer_id: user.id
        });

      // Update view count
      await supabase
        .from('stories')
        .update({ view_count: story.view_count + 1 })
        .eq('id', story.id);
    } catch (error) {
      console.error('Error recording story view:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-4 p-4 overflow-x-auto">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-4 p-4 overflow-x-auto">
      {/* Add Story Button */}
      <Dialog>
        <DialogTrigger asChild>
          <div className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer">
            <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center hover:border-primary transition-colors">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <span className="text-xs text-center">Add Story</span>
          </div>
        </DialogTrigger>
        <DialogContent>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Create Story</h3>
            <p className="text-muted-foreground">Story creation feature coming soon!</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stories */}
      {stories.map((story) => (
        <div
          key={story.id}
          className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer"
          onClick={() => viewStory(story)}
        >
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500 to-orange-500 p-1">
              <Avatar className="w-full h-full border-2 border-white">
                <AvatarImage src={story.profiles?.avatar} />
                <AvatarFallback>{story.profiles?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
            </div>
            {story.media_type === 'video' && (
              <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1">
                <Play className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
          </div>
          <span className="text-xs text-center truncate w-full">
            {story.profiles?.name || 'User'}
          </span>
        </div>
      ))}

      {/* Story View Dialog */}
      <Dialog open={!!selectedStory} onOpenChange={() => setSelectedStory(null)}>
        <DialogContent className="p-0 border-0 bg-black max-w-md">
          {selectedStory && (
            <div className="relative h-96 bg-black rounded-lg overflow-hidden">
              <div className="absolute top-4 left-4 right-4 flex items-center gap-3 z-10">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={selectedStory.profiles?.avatar} />
                  <AvatarFallback>{selectedStory.profiles?.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">
                    {selectedStory.profiles?.name || 'User'}
                  </p>
                  <p className="text-white/70 text-xs">
                    {new Date(selectedStory.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-white/70">
                  <Eye className="h-4 w-4" />
                  <span className="text-xs">{selectedStory.view_count}</span>
                </div>
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center p-8">
                  <div className="w-32 h-32 bg-gray-700 rounded-lg mb-4 mx-auto"></div>
                  <p>Story content placeholder</p>
                  {selectedStory.content && (
                    <p className="mt-2 text-sm text-white/80">{selectedStory.content}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
