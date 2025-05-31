
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Image, Video, X, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateStoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateStory: (content: string, image?: File, video?: File) => void;
}

export function CreateStoryDialog({ open, onOpenChange, onCreateStory }: CreateStoryDialogProps) {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select an image under 10MB",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedImage(file);
      setSelectedVideo(null);
      setMediaType('image');
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit for videos
        toast({
          title: "File too large",
          description: "Please select a video under 50MB",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedVideo(file);
      setSelectedImage(null);
      setMediaType('video');
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveMedia = () => {
    setSelectedImage(null);
    setSelectedVideo(null);
    setMediaType(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    
    // Reset file inputs
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleSubmit = () => {
    if (!content.trim() && !selectedImage && !selectedVideo) {
      toast({
        title: "Empty story",
        description: "Please add some content or media to your story",
        variant: "destructive"
      });
      return;
    }

    onCreateStory(content, selectedImage || undefined, selectedVideo || undefined);
    
    // Reset form
    setContent('');
    handleRemoveMedia();
    onOpenChange(false);
  };

  const handleClose = () => {
    setContent('');
    handleRemoveMedia();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Your Story</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Media Preview */}
          {previewUrl && (
            <div className="relative rounded-lg overflow-hidden bg-gray-100">
              {mediaType === 'image' ? (
                <img 
                  src={previewUrl} 
                  alt="Story preview" 
                  className="w-full h-48 object-cover"
                />
              ) : (
                <video 
                  src={previewUrl} 
                  controls 
                  className="w-full h-48 object-cover"
                />
              )}
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={handleRemoveMedia}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Media Upload Buttons */}
          {!previewUrl && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors">
                    <Image className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Add Photo</span>
                  </div>
                </Label>
                <Input
                  id="image-upload"
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
              
              <div>
                <Label htmlFor="video-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors">
                    <Video className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Add Video</span>
                  </div>
                </Label>
                <Input
                  id="video-upload"
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Text Content */}
          <div>
            <Label htmlFor="story-content">Story Text (Optional)</Label>
            <Textarea
              id="story-content"
              placeholder="Share what's on your mind..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Share Story
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
