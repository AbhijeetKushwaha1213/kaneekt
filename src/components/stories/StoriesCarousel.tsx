
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { StoryViewDialog } from './StoryViewDialog';
import { useAuth } from '@/contexts/AuthContext';
import { Plus } from 'lucide-react';

interface Story {
  id: string;
  user_id: string;
  content?: string;
  media_url: string;
  media_type: 'image' | 'video';
  view_count: number;
  created_at: string;
  expires_at: string;
  profiles: {
    name: string;
    avatar: string;
  };
  is_viewed?: boolean;
}

export function StoriesCarousel() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [storyDialogOpen, setStoryDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStories();
  }, [user]);

  const loadStories = async () => {
    try {
      // Load from localStorage first
      const storedStories = localStorage.getItem('user_stories');
      let allStories: Story[] = [];
      
      if (storedStories) {
        allStories = JSON.parse(storedStories);
      }

      // Add mock stories for demo
      const mockStories: Story[] = [
        {
          id: 'story-1',
          user_id: 'mock-1',
          content: 'Beautiful sunset today! 🌅',
          media_url: '/placeholder.svg',
          media_type: 'image',
          view_count: 45,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          expires_at: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
          profiles: {
            name: 'Sarah Chen',
            avatar: '/placeholder.svg'
          },
          is_viewed: false
        },
        {
          id: 'story-2',
          user_id: 'mock-2',
          content: 'Coffee time ☕',
          media_url: '/placeholder.svg',
          media_type: 'image',
          view_count: 23,
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          expires_at: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
          profiles: {
            name: 'Marcus Johnson',
            avatar: '/placeholder.svg'
          },
          is_viewed: true
        },
        {
          id: 'story-3',
          user_id: 'mock-3',
          content: 'Amazing food! 🍜',
          media_url: '/placeholder.svg',
          media_type: 'image',
          view_count: 67,
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          expires_at: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
          profiles: {
            name: 'Elena Rodriguez',
            avatar: '/placeholder.svg'
          },
          is_viewed: false
        }
      ];

      // Filter out expired stories
      const validStories = [...allStories, ...mockStories].filter(story => 
        new Date(story.expires_at) > new Date()
      );

      setStories(validStories);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStoryClick = (story: Story) => {
    setSelectedStory(story);
    setStoryDialogOpen(true);
    
    // Mark story as viewed
    if (!story.is_viewed) {
      const updatedStories = stories.map(s => 
        s.id === story.id ? { ...s, is_viewed: true, view_count: s.view_count + 1 } : s
      );
      setStories(updatedStories);
      
      // Update localStorage
      const userStories = updatedStories.filter(s => s.user_id === user?.id);
      if (userStories.length > 0) {
        localStorage.setItem('user_stories', JSON.stringify(userStories));
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex gap-4 p-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="w-12 h-2 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full mb-6">
        <h3 className="text-lg font-semibold mb-4">Stories</h3>
        <Carousel className="w-full">
          <CarouselContent className="-ml-2 md:-ml-4">
            {/* Add Story Button */}
            <CarouselItem className="pl-2 md:pl-4 basis-auto">
              <div className="flex flex-col items-center space-y-2 cursor-pointer group">
                <div className="relative">
                  <Avatar className="w-16 h-16 border-2 border-dashed border-gray-300 group-hover:border-primary transition-colors">
                    <AvatarImage src={user?.user_metadata?.avatar_url || '/placeholder.svg'} />
                    <AvatarFallback className="bg-gray-100">
                      <Plus className="w-6 h-6 text-gray-400" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-xs text-center font-medium text-gray-600 max-w-[60px] truncate">
                  Add Story
                </span>
              </div>
            </CarouselItem>

            {stories.map((story) => (
              <CarouselItem key={story.id} className="pl-2 md:pl-4 basis-auto">
                <div 
                  className="flex flex-col items-center space-y-2 cursor-pointer group"
                  onClick={() => handleStoryClick(story)}
                >
                  <div className="relative">
                    <Avatar className={`w-16 h-16 ring-2 ring-offset-2 ${
                      story.is_viewed 
                        ? 'ring-gray-300' 
                        : 'ring-gradient-to-tr from-purple-500 to-pink-500 ring-2'
                    } transition-all group-hover:scale-105`}>
                      <AvatarImage src={story.profiles.avatar} alt={story.profiles.name} />
                      <AvatarFallback>{story.profiles.name[0]}</AvatarFallback>
                    </Avatar>
                    {story.media_type === 'video' && (
                      <Badge variant="secondary" className="absolute -bottom-1 -right-1 text-xs">
                        Video
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-center font-medium max-w-[60px] truncate">
                    {story.profiles.name.split(' ')[0]}
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
      </div>

      <StoryViewDialog
        story={selectedStory}
        open={storyDialogOpen}
        onOpenChange={setStoryDialogOpen}
        onNext={() => {
          const currentIndex = stories.findIndex(s => s.id === selectedStory?.id);
          if (currentIndex < stories.length - 1) {
            setSelectedStory(stories[currentIndex + 1]);
          }
        }}
        onPrevious={() => {
          const currentIndex = stories.findIndex(s => s.id === selectedStory?.id);
          if (currentIndex > 0) {
            setSelectedStory(stories[currentIndex - 1]);
          }
        }}
      />
    </>
  );
}
