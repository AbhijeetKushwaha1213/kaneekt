
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { CreateStoryDialog } from './CreateStoryDialog';
import { StoryViewDialog } from './StoryViewDialog';

interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  image?: string;
  video?: string;
  timestamp: Date;
  viewed: boolean;
}

interface StoriesCarouselProps {
  currentUserId?: string;
}

export function StoriesCarousel({ currentUserId = "current-user" }: StoriesCarouselProps) {
  const [stories, setStories] = useState<Story[]>([
    {
      id: '1',
      userId: '1',
      userName: 'Emma Wilson',
      userAvatar: '/placeholder.svg',
      content: 'Beautiful sunset today! 🌅',
      image: '/placeholder.svg',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      viewed: false
    },
    {
      id: '2',
      userId: '2',
      userName: 'Alex Chen',
      userAvatar: '/placeholder.svg',
      content: 'Coffee time ☕',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      viewed: true
    },
    {
      id: '3',
      userId: '3',
      userName: 'Sarah Johnson',
      userAvatar: '/placeholder.svg',
      content: 'New workout routine! 💪',
      video: '/placeholder.svg',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      viewed: false
    }
  ]);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const handleCreateStory = (content: string, image?: File, video?: File) => {
    const newStory: Story = {
      id: Date.now().toString(),
      userId: currentUserId,
      userName: 'You',
      userAvatar: '/placeholder.svg',
      content,
      image: image ? URL.createObjectURL(image) : undefined,
      video: video ? URL.createObjectURL(video) : undefined,
      timestamp: new Date(),
      viewed: false
    };

    setStories(prev => [newStory, ...prev]);
    setCreateDialogOpen(false);
  };

  const handleStoryClick = (story: Story) => {
    setStories(prev => prev.map(s => 
      s.id === story.id ? { ...s, viewed: true } : s
    ));
    
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
              <AvatarImage src={story.userAvatar} alt={story.userName} />
              <AvatarFallback>{story.userName[0]}</AvatarFallback>
            </Avatar>
          </div>
          <span className="text-xs text-center truncate w-16">
            {story.userName}
          </span>
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
