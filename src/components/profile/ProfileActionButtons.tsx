
import { Settings, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CreatePostDialog } from "./CreatePostDialog";

interface ProfileActionButtonsProps {
  isOwnProfile: boolean;
  isFollowing: boolean;
  onFollow: () => void;
  onMessage: () => void;
  onCreatePost: (content: string, isPublic: boolean) => Promise<void>;
}

export function ProfileActionButtons({
  isOwnProfile,
  isFollowing,
  onFollow,
  onMessage,
  onCreatePost
}: ProfileActionButtonsProps) {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [isPostPublic, setIsPostPublic] = useState(true);

  const handleCreatePost = async () => {
    await onCreatePost(postContent, isPostPublic);
    setPostContent("");
    setIsCreatePostOpen(false);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        {isOwnProfile ? (
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setIsCreatePostOpen(true)}
            >
              Create Post
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              variant={isFollowing ? "outline" : "default"}
              onClick={onFollow}
              className="min-w-[100px]"
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
            
            <Button variant="outline" onClick={onMessage}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
          </div>
        )}
      </div>

      <CreatePostDialog
        open={isCreatePostOpen}
        onOpenChange={setIsCreatePostOpen}
        postContent={postContent}
        setPostContent={setPostContent}
        isPostPublic={isPostPublic}
        setIsPostPublic={setIsPostPublic}
        postImageUrl={null}
        setPostImageUrl={() => {}}
        setPostImage={() => {}}
        handleCreatePost={handleCreatePost}
      />
    </>
  );
}
