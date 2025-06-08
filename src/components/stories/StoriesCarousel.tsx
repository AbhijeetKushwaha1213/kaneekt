
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { CreateStoryDialog } from './CreateStoryDialog';
import { StoryViewDialog } from './StoryViewDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useStories } from '@/hooks/useStories';

interface StoriesCarouselProps {
  currentUserId?: string;
}

export function StoriesCarousel({ currentUserId }: StoriesCarouselProps) {
  const { user } = useAuth();
  const { stories, createStory, viewStory } = useStories();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const handleCreateStory = async (content: string, image?: File, video?: File) => {
    if (!user) return;

    const result = await createStory(content, image, video);
    if (result.data) {
      setCreateDialogOpen(false);
    }
  };

  const handleStoryClick = async (story: any) => {
    setSelectedStory(story);
    setViewDialogOpen(true);
    await viewStory(story.id);
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

      {stories.map(story => (
        <div 
          key={story.id} 
          className="flex flex-col items-center space-y-2 min-w-[70px] cursor-pointer"
          onClick={() => handleStoryClick(story)}
        >
          <Avatar className={`h-16 w-16 border-2 ${story.has_viewed ? 'border-gray-300' : 'border-primary'}`}>
            <AvatarImage src={story.author?.avatar} alt={story.author?.name} />
            <AvatarFallback>{story.author?.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-center truncate w-full">{story.author?.name || 'User'}</span>
        </div>
      ))}

      <CreateStoryDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateStory={handleCreateStory}
      />

      <StoryViewDialog
        story={selectedStory}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />
    </div>
  );
}
