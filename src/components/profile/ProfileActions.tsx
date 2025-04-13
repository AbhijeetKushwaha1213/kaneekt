
import { UserCheck, UserPlus, MessagesSquare, Settings, Lock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileActionsProps {
  isFollowing: boolean;
  isPrivate: boolean;
  handleFollow: () => void;
  handleMessage: () => void;
  handleOpenEditProfile: () => void;
  handleTogglePrivacy: () => void;
}

export function ProfileActions({
  isFollowing,
  isPrivate,
  handleFollow,
  handleMessage,
  handleOpenEditProfile,
  handleTogglePrivacy
}: ProfileActionsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button 
        variant={isFollowing ? "secondary" : "default"} 
        size="sm"
        onClick={handleFollow}
      >
        {isFollowing ? (
          <>
            <UserCheck className="h-4 w-4 mr-2" />
            Following
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4 mr-2" />
            Follow
          </>
        )}
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleMessage}
      >
        <MessagesSquare className="h-4 w-4 mr-2" />
        Message
      </Button>

      <Button 
        variant="outline" 
        size="sm"
        onClick={handleOpenEditProfile}
      >
        <Settings className="h-4 w-4 mr-2" />
        Edit Profile
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleTogglePrivacy}
      >
        {isPrivate ? (
          <>
            <Lock className="h-4 w-4 mr-2" />
            Private
          </>
        ) : (
          <>
            <Globe className="h-4 w-4 mr-2" />
            Public
          </>
        )}
      </Button>
    </div>
  );
}
