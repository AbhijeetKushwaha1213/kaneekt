
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

interface StoryViewDialogProps {
  story: Story | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function StoryViewDialog({ story, open, onOpenChange, onNext, onPrevious }: StoryViewDialogProps) {
  if (!story) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 bg-black text-white border-none">
        <div className="relative h-[600px] flex flex-col">
          {/* Progress bar */}
          <div className="absolute top-2 left-2 right-2 h-1 bg-white/30 rounded-full overflow-hidden z-10">
            <div className="h-full bg-white rounded-full animate-pulse"></div>
          </div>

          {/* Header */}
          <div className="absolute top-6 left-4 right-4 flex items-center space-x-3 z-10">
            <Avatar className="h-8 w-8">
              <AvatarImage src={story.profiles.avatar} alt={story.profiles.name} />
              <AvatarFallback>{story.profiles.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{story.profiles.name}</p>
              <p className="text-xs text-white/70">
                {formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Navigation buttons */}
          {onPrevious && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20"
              onClick={onPrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}
          
          {onNext && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20"
              onClick={onNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}

          {/* Content */}
          <div className="flex-1 flex items-center justify-center p-6">
            {story.media_type === 'image' ? (
              <img 
                src={story.media_url} 
                alt="Story content" 
                className="max-w-full max-h-full object-contain"
              />
            ) : story.media_type === 'video' ? (
              <video 
                src={story.media_url} 
                className="max-w-full max-h-full object-contain"
                controls
                autoPlay
                muted
              />
            ) : (
              <div className="text-center">
                <p className="text-lg font-medium">{story.content}</p>
              </div>
            )}
          </div>

          {/* Story content text overlay */}
          {story.content && (
            <div className="absolute bottom-20 left-4 right-4 z-10">
              <p className="text-white text-sm bg-black/50 p-2 rounded">{story.content}</p>
            </div>
          )}

          {/* View count */}
          <div className="absolute bottom-4 left-4 z-10">
            <p className="text-xs text-white/70">{story.view_count} views</p>
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none"></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
