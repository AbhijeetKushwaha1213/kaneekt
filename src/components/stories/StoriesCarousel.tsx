
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { StoryViewDialog } from './StoryViewDialog';
import { CreateStoryDialog } from './CreateStoryDialog';

interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  image?: string;
  timestamp: Date;
  viewed: boolean;
}

export function StoriesCarousel() {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [createStoryOpen, setCreateStoryOpen] = useState(false);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = () => {
    const mockStories: Story[] = [
      {
        id: 'story-1',
        userId: 'user-1',
        userName: 'Sarah Chen',
        userAvatar: '/placeholder.svg',
        content: 'Beautiful sunset at the beach! 🌅',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        viewed: false
      },
      {
        id: 'story-2',
        userId: 'user-2',
        userName: 'Marcus Johnson',
        userAvatar: '/placeholder.svg',
        content: 'New art piece finished! What do you think?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        viewed: true
      },
      {
        id: 'story-3',
        userId: 'user-3',
        userName: 'Elena Rodriguez',
        userAvatar: '/placeholder.svg',
        content: 'Trying this new coffee place ☕',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        viewed: false
      }
    ];

    const stored = localStorage.getItem('userStories');
    if (stored) {
      const userStories = JSON.parse(stored);
      setStories([...userStories, ...mockStories]);
    } else {
      setStories(mockStories);
    }
  };

  const handleCreateStory = (content: string, image?: File) => {
    const newStory: Story = {
      id: `story-${Date.now()}`,
      userId: 'current-user',
      userName: 'You',
      userAvatar: '/placeholder.svg',
      content,
      timestamp: new Date(),
      viewed: false
    };

    const userStories = JSON.parse(localStorage.getItem('userStories') || '[]');
    userStories.unshift(newStory);
    localStorage.setItem('userStories', JSON.stringify(userStories));
    
    setStories(prev => [newStory, ...prev]);
    setCreateStoryOpen(false);
  };

  const handleStoryClick = (story: Story) => {
    setSelectedStory(story);
    
    // Mark as viewed
    if (!story.viewed) {
      setStories(prev => 
        prev.map(s => 
          s.id === story.id ? { ...s, viewed: true } : s
        )
      );
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium mb-3 flex items-center">
        <span className="mr-2">📖</span> Stories
      </h2>
      
      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {/* Add Story Button */}
          <CarouselItem className="pl-2 md:pl-4 basis-auto">
            <div className="flex flex-col items-center space-y-2">
              <Button
                variant="outline"
                size="icon"
                className="h-16 w-16 rounded-full border-2 border-dashed border-muted-foreground/50 hover:border-primary"
                onClick={() => setCreateStoryOpen(true)}
              >
                <Plus className="h-6 w-6" />
              </Button>
              <span className="text-xs text-muted-foreground">Add Story</span>
            </div>
          </CarouselItem>

          {/* Story Items */}
          {stories.map((story) => (
            <CarouselItem key={story.id} className="pl-2 md:pl-4 basis-auto">
              <div 
                className="flex flex-col items-center space-y-2 cursor-pointer"
                onClick={() => handleStoryClick(story)}
              >
                <div className={`p-0.5 rounded-full ${
                  story.viewed 
                    ? 'bg-gray-300' 
                    : 'bg-gradient-to-tr from-yellow-400 to-pink-600'
                }`}>
                  <Avatar className="h-14 w-14 border-2 border-background">
                    <AvatarImage src={story.userAvatar} alt={story.userName} />
                    <AvatarFallback>{story.userName[0]}</AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-xs text-center max-w-[70px] truncate">
                  {story.userName}
                </span>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden sm:block">
          <CarouselPrevious className="left-0" />
          <CarouselNext className="right-0" />
        </div>
      </Carousel>

      <StoryViewDialog
        story={selectedStory}
        open={selectedStory !== null}
        onOpenChange={(open) => !open && setSelectedStory(null)}
      />

      <CreateStoryDialog
        open={createStoryOpen}
        onOpenChange={setCreateStoryOpen}
        onCreateStory={handleCreateStory}
      />
    </div>
  );
}
