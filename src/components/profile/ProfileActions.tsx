
import { UserPlus, MessageSquare, Lock, Unlock, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface ProfileActionsProps {
  isFollowing: boolean;
  isPrivate: boolean;
  handleFollow: () => void;
  handleMessage: () => void;
  handleOpenEditProfile: () => void;
  handleTogglePrivacy: () => void;
  isLoading?: boolean;
}

export function ProfileActions({
  isFollowing,
  isPrivate,
  handleFollow,
  handleMessage,
  handleOpenEditProfile,
  handleTogglePrivacy,
  isLoading
}: ProfileActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={isFollowing ? "outline" : "default"}
        onClick={handleFollow}
        disabled={isLoading}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        {isFollowing ? "Following" : "Follow"}
      </Button>
      
      <Button 
        variant="secondary"
        onClick={handleMessage}
        disabled={isLoading}
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        Message
      </Button>
      
      <Button 
        variant="outline"
        onClick={handleOpenEditProfile}
        disabled={isLoading}
      >
        <Edit className="h-4 w-4 mr-2" />
        Edit Profile
      </Button>
      
      <div className="ml-auto flex items-center space-x-2">
        <Switch
          checked={isPrivate}
          onCheckedChange={handleTogglePrivacy}
          disabled={isLoading}
        />
        <div className="flex items-center">
          {isPrivate ? (
            <Lock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
          ) : (
            <Unlock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
          )}
          <span className="text-sm text-muted-foreground">
            {isPrivate ? "Private" : "Public"} Account
          </span>
        </div>
      </div>
    </div>
  );
}
