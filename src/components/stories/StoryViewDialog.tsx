
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';

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

interface StoryViewDialogProps {
  story: Story | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StoryViewDialog({ story, open, onOpenChange }: StoryViewDialogProps) {
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
              <AvatarImage src={story.userAvatar} alt={story.userName} />
              <AvatarFallback>{story.userName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{story.userName}</p>
              <p className="text-xs text-white/70">
                {formatDistanceToNow(story.timestamp, { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex items-center justify-center p-6">
            {story.image ? (
              <img 
                src={story.image} 
                alt="Story content" 
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-center">
                <p className="text-lg font-medium">{story.content}</p>
              </div>
            )}
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none"></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
