
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { CreateStoryDialog } from './CreateStoryDialog';
import { StoryViewDialog } from './StoryViewDialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Story {
  id: string;
  user_id: string;
  content: string;
  media_url?: string;
  media_type?: 'image' | 'video';
  expires_at: string;
  created_at: string;
  profiles: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  viewed?: boolean;
}

interface StoriesCarouselProps {
  currentUserId?: string;
}

export function StoriesCarousel({ currentUserId }: StoriesCarouselProps) {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
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

      if (error) {
        console.error('Error fetching stories:', error);
      } else {
        // Check which stories the current user has viewed
        if (user && data) {
          const { data: viewData } = await supabase
            .from('story_views')
            .select('story_id')
            .eq('viewer_id', user.id);

          const viewedStoryIds = new Set(viewData?.map(v => v.story_id) || []);
          
          const storiesWithViewStatus = data.map(story => ({
            ...story,
            viewed: viewedStoryIds.has(story.id) || story.user_id === user.id
          }));

          setStories(storiesWithViewStatus);
        } else {
          setStories(data || []);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCreateStory = async (content: string, image?: File, video?: File) => {
    if (!user) return;

    try {
      let media_url = null;
      let media_type = null;

      if (image) {
        media_url = URL.createObjectURL(image);
        media_type = 'image';
      } else if (video) {
        media_url = URL.createObjectURL(video);
        media_type = 'video';
      }

      const { data, error } = await supabase
        .from('stories')
        .insert([{
          user_id: user.id,
          content,
          media_url,
          media_type
        }])
        .select(`
          *,
          profiles!stories_user_id_fkey (
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
          description: "Failed to create story",
          variant: "destructive"
        });
        return;
      }

      setStories(prev => [{ ...data, viewed: false }, ...prev]);
      setCreateDialogOpen(false);
      
      toast({
        title: "Story created!",
        description: "Your story has been shared successfully.",
      });
    } catch (error) {
      console.error('Error creating story:', error);
      toast({
        title: "Error",
        description: "Failed to create story",
        variant: "destructive"
      });
    }
  };

  const handleStoryClick = async (story: Story) => {
    if (user && story.user_id !== user.id && !story.viewed) {
      // Mark story as viewed
      await supabase
        .from('story_views')
        .insert([{
          story_id: story.id,
          viewer_id: user.id
        }]);
      
      setStories(prev => prev.map(s => 
        s.id === story.id ? { ...s, viewed: true } : s
      ));
    }
    
    setSelectedStory(story);
    setViewDialogOpen(true);
  };

  return (
    <div className="flex space-x-4 p-4 overflow-x-auto">
      <div className="flex flex-col items-center space-y-2 min-w-[70px]">
        <Button
          variant="outline"
          size="icon"
          className="h-16 w-16 rounded-full border-2 border-dashed border-gray-300 hover:border-primary"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
        <span className="text-xs text-center">Your Story</span>
      </div>

      {stories.map((story) => (
        <div
          key={story.id}
          className="flex flex-col items-center space-y-2 min-w-[70px] cursor-pointer"
          onClick={() => handleStoryClick(story)}
        >
          <div className={`p-0.5 rounded-full ${
            story.viewed 
              ? 'bg-gray-300' 
              : 'bg-gradient-to-tr from-yellow-400 to-pink-600'
          }`}>
            <Avatar className="h-16 w-16 border-2 border-white">
              <AvatarImage 
                src={story.profiles?.avatar || "/placeholder.svg"} 
                alt={story.profiles?.name || "User"} 
              />
              <AvatarFallback>
                {story.profiles?.name?.[0] || story.profiles?.username?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
          <span className="text-xs text-center truncate w-16">
            {story.profiles?.name || story.profiles?.username || "User"}
          </span>
        </div>
      ))}

      <CreateStoryDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateStory={handleCreateStory}
      />

      <StoryViewDialog
        story={selectedStory ? {
          id: selectedStory.id,
          userId: selectedStory.user_id,
          userName: selectedStory.profiles?.name || selectedStory.profiles?.username || "User",
          userAvatar: selectedStory.profiles?.avatar || "/placeholder.svg",
          content: selectedStory.content || "",
          image: selectedStory.media_type === 'image' ? selectedStory.media_url : undefined,
          video: selectedStory.media_type === 'video' ? selectedStory.media_url : undefined,
          timestamp: new Date(selectedStory.created_at),
          viewed: selectedStory.viewed || false
        } : null}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />
    </div>
  );
}
