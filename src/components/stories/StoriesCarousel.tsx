
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { CreateStoryDialog } from './CreateStoryDialog';
import { StoryViewDialog } from './StoryViewDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface StoriesCarouselProps {
  currentUserId?: string;
}

export function StoriesCarousel({ currentUserId }: StoriesCarouselProps) {
  const { user } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const { toast } = useToast();

  // Temporarily disabled stories functionality until database tables are properly set up
  const stories: any[] = [];

  const handleCreateStory = async (content: string, image?: File, video?: File) => {
    if (!user) return;

    // Temporarily show a message that stories functionality is coming soon
    toast({
      title: "Coming soon!",
      description: "Stories functionality will be available after database setup is complete.",
    });
    
    setCreateDialogOpen(false);
  };

  const handleStoryClick = async (story: any) => {
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

      {/* Placeholder for when stories are implemented */}
      <div className="flex flex-col items-center space-y-2 min-w-[70px] opacity-50">
        <Avatar className="h-16 w-16 border-2 border-gray-300">
          <AvatarImage src="/placeholder.svg" alt="Coming soon" />
          <AvatarFallback>CS</AvatarFallback>
        </Avatar>
        <span className="text-xs text-center text-gray-500">Coming Soon</span>
      </div>

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
