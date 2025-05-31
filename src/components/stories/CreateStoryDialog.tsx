
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Video, Image as ImageIcon, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('video/')) {
        setMediaType('video');
      } else {
        setMediaType('image');
      }
    }
  };

  const createStory = async () => {
    if (!user || (!content.trim() && !selectedFile)) {
      toast({
        title: 'Error',
        description: 'Please add content or select a file for your story',
        variant: 'destructive'
      });
      return;
    }

    setIsCreating(true);
    try {
      // Get existing stories
      const existingStories = JSON.parse(localStorage.getItem('user_stories') || '[]');
      
      // Create new story
      const newStory = {
        id: `story-${Date.now()}`,
        user_id: user.id,
        content: content.trim(),
        media_type: mediaType,
        media_url: selectedFile ? URL.createObjectURL(selectedFile) : '/placeholder.svg',
        view_count: 0,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        profiles: {
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'You',
          avatar: user.user_metadata?.avatar_url || '/placeholder.svg'
        }
      };

      // Save to localStorage
      const updatedStories = [newStory, ...existingStories];
      localStorage.setItem('user_stories', JSON.stringify(updatedStories));

      toast({
        title: 'Story created! ✨',
        description: 'Your story has been shared successfully.',
      });

      setContent('');
      setSelectedFile(null);
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

          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
            {selectedFile ? (
              <div className="w-full h-full flex items-center justify-center">
                {mediaType === 'video' ? (
                  <video 
                    src={URL.createObjectURL(selectedFile)} 
                    className="max-w-full max-h-full"
                    controls
                  />
                ) : (
                  <img 
                    src={URL.createObjectURL(selectedFile)} 
                    alt="Selected" 
                    className="max-w-full max-h-full object-cover"
                  />
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <Camera className="h-12 w-12 mx-auto mb-2" />
                <p>Select a file to upload</p>
              </div>
            )}
            <input
              type="file"
              accept={mediaType === 'video' ? 'video/*' : 'image/*'}
              onChange={handleFileSelect}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
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
              disabled={(!content.trim() && !selectedFile) || isCreating}
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
