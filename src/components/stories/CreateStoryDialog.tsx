
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Video, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateStoryDialogProps {
  trigger: React.ReactNode;
  onStoryCreated?: () => void;
}

export function CreateStoryDialog({ trigger, onStoryCreated }: CreateStoryDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [isCreating, setIsCreating] = useState(false);
  const [open, setOpen] = useState(false);

  const createStory = async () => {
    if (!user || !content.trim()) return;

    setIsCreating(true);
    try {
      const { error } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          content: content.trim(),
          media_type: mediaType,
          media_url: '/placeholder.svg', // Placeholder until file upload is implemented
        });

      if (error) throw error;

      toast({
        title: 'Story created!',
        description: 'Your story has been shared successfully.',
      });

      setContent('');
      setOpen(false);
      onStoryCreated?.();
    } catch (error) {
      console.error('Error creating story:', error);
      toast({
        title: 'Error',
        description: 'Failed to create story. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Story</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={mediaType === 'image' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMediaType('image')}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Image
            </Button>
            <Button
              variant={mediaType === 'video' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMediaType('video')}
            >
              <Video className="h-4 w-4 mr-2" />
              Video
            </Button>
          </div>

          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Camera className="h-12 w-12 mx-auto mb-2" />
              <p>Media upload coming soon</p>
            </div>
          </div>

          <Textarea
            placeholder="Add a caption to your story..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={createStory}
              disabled={!content.trim() || isCreating}
              className="flex-1"
            >
              {isCreating ? 'Creating...' : 'Share Story'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
