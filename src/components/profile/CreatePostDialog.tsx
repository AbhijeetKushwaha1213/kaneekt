
import { useState, useRef } from "react";
import { ImageIcon, X, Globe, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postContent: string;
  setPostContent: (content: string) => void;
  isPostPublic: boolean;
  setIsPostPublic: (isPublic: boolean) => void;
  postImageUrl: string | null;
  setPostImageUrl: (url: string | null) => void;
  setPostImage: (file: File | null) => void;
  handleCreatePost: () => void;
  isLoading?: boolean; // Add the isLoading prop to the interface
}

export function CreatePostDialog({
  open,
  onOpenChange,
  postContent,
  setPostContent,
  isPostPublic,
  setIsPostPublic,
  postImageUrl,
  setPostImageUrl,
  setPostImage,
  handleCreatePost,
  isLoading
}: CreatePostDialogProps) {
  const postFileInputRef = useRef<HTMLInputElement>(null);
  
  const handlePostImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPostImage(file);
      setPostImageUrl(URL.createObjectURL(file));
    }
  };
  
  const handleRemovePostImage = () => {
    setPostImage(null);
    setPostImageUrl(null);
    if (postFileInputRef.current) {
      postFileInputRef.current.value = '';
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
          <DialogDescription>
            Share your thoughts with your followers
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <Textarea 
            placeholder="What's on your mind?"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            className="min-h-[120px]"
            disabled={isLoading}
          />
          
          {postImageUrl ? (
            <div className="relative">
              <img 
                src={postImageUrl} 
                alt="Post preview" 
                className="rounded-md max-h-60 w-auto" 
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                onClick={handleRemovePostImage}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div>
              <Button
                variant="outline"
                className="w-full py-8 border-dashed flex flex-col items-center justify-center"
                onClick={() => postFileInputRef.current?.click()}
                disabled={isLoading}
              >
                <ImageIcon className="h-8 w-8 mb-2 text-muted-foreground" />
                <span className="text-muted-foreground">Add an image</span>
              </Button>
              <input 
                ref={postFileInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handlePostImageChange} 
                disabled={isLoading}
              />
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={isPostPublic ? "default" : "outline"}
                size="sm"
                onClick={() => setIsPostPublic(true)}
                disabled={isLoading}
              >
                <Globe className="h-4 w-4 mr-2" />
                Public
              </Button>
              <Button
                type="button"
                variant={!isPostPublic ? "default" : "outline"}
                size="sm"
                onClick={() => setIsPostPublic(false)}
                disabled={isLoading}
              >
                <Lock className="h-4 w-4 mr-2" />
                Private
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleCreatePost} disabled={isLoading}>
            Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
