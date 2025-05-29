
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';

interface CreateStoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateStory: (content: string, image?: File) => void;
}

export function CreateStoryDialog({ open, onOpenChange, onCreateStory }: CreateStoryDialogProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please add some content to your story",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      onCreateStory(content);
      setContent('');
      toast({
        title: "Story created!",
        description: "Your story has been shared with your connections"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create story",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Story</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] resize-none"
            maxLength={200}
          />
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {content.length}/200
            </span>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !content.trim()}
              >
                {isLoading ? 'Sharing...' : 'Share Story'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
