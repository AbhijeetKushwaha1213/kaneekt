
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, UserPlus, Settings, Share2 } from "lucide-react";

interface ProfileActionButtonsProps {
  profileId: string;
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  isLiked?: boolean;
  onFollow?: () => void;
  onMessage?: () => void;
  onEditProfile?: () => void;
}

export function ProfileActionButtons({
  profileId,
  isOwnProfile = false,
  isFollowing = false,
  isLiked = false,
  onFollow,
  onMessage,
  onEditProfile
}: ProfileActionButtonsProps) {
  const [liked, setLiked] = useState(isLiked);
  const [following, setFollowing] = useState(isFollowing);
  const { toast } = useToast();

  const handleLike = () => {
    setLiked(!liked);
    toast({
      description: liked ? "Removed from favorites" : "Added to favorites",
    });
  };

  const handleFollow = () => {
    setFollowing(!following);
    onFollow?.();
    toast({
      description: following ? "Unfollowed user" : "Following user",
    });
  };

  const handleMessage = () => {
    onMessage?.();
    toast({
      description: "Opening chat...",
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      description: "Profile link copied to clipboard",
    });
  };

  if (isOwnProfile) {
    return (
      <div className="flex gap-2">
        <Button onClick={onEditProfile} className="flex-1">
          <Settings className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
        <Button variant="outline" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        variant={liked ? "default" : "outline"}
        onClick={handleLike}
        className={liked ? "bg-red-500 hover:bg-red-600" : ""}
      >
        <Heart className={`h-4 w-4 mr-2 ${liked ? "fill-current" : ""}`} />
        {liked ? "Liked" : "Like"}
      </Button>
      
      <Button
        variant={following ? "outline" : "default"}
        onClick={handleFollow}
        className="flex-1"
      >
        <UserPlus className="h-4 w-4 mr-2" />
        {following ? "Following" : "Follow"}
      </Button>
      
      <Button variant="outline" onClick={handleMessage}>
        <MessageCircle className="h-4 w-4" />
      </Button>
      
      <Button variant="outline" onClick={handleShare}>
        <Share2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
