
import { useState } from "react";
import { User } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { usePosts } from "@/hooks/usePosts";
import { ProfileHeaderInfo } from "./ProfileHeaderInfo";
import { ProfileActionButtons } from "./ProfileActionButtons";
import { ProfileStatsRow } from "./ProfileStatsRow";
import { ProfileTabs } from "./ProfileTabs";

interface InstagramProfileHeaderProps {
  user: User;
  isOwnProfile: boolean;
  onFollow?: () => void;
  onMessage?: () => void;
  posts?: any[];
  isFollowing?: boolean;
}

export function InstagramProfileHeader({
  user,
  isOwnProfile,
  onFollow,
  onMessage,
  posts = [],
  isFollowing = false
}: InstagramProfileHeaderProps) {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const { createPost } = usePosts(user.id);
  const { toast } = useToast();

  const handleFollow = () => {
    onFollow?.();
  };

  const handleMessage = () => {
    onMessage?.();
  };

  const handleCreatePost = async (content: string, isPublic: boolean) => {
    if (!content.trim()) {
      toast({
        title: "Empty post",
        description: "Please add some content to your post",
        variant: "destructive"
      });
      return;
    }

    const result = await createPost({
      content: content,
      is_public: isPublic
    });

    if (!result.data) {
      // Error was already handled in the hook
      return;
    }
  };

  const handleOpenCreatePost = () => {
    setIsCreatePostOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <ProfileHeaderInfo user={user} isOwnProfile={isOwnProfile} />
      
      {/* Action Buttons and Stats */}
      <div className="px-6">
        <ProfileActionButtons
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          onFollow={handleFollow}
          onMessage={handleMessage}
          onCreatePost={handleCreatePost}
        />

        <ProfileStatsRow
          postsCount={posts.length}
          followersCount={user.followers || 0}
          followingCount={user.following || 0}
        />
      </div>

      {/* Content Tabs */}
      <ProfileTabs
        posts={posts}
        isOwnProfile={isOwnProfile}
        onCreatePost={handleOpenCreatePost}
      />
    </div>
  );
}
