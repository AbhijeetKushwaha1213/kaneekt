
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { InstagramProfileHeader } from "@/components/profile/InstagramProfileHeader";
import { BackNavigation } from "@/components/ui/back-navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useFollows } from "@/hooks/useFollows";
import { usePosts } from "@/hooks/usePosts";
import { supabase } from "@/integrations/supabase/client";
import { Profile as ProfileType } from "@/types/supabase";
import { User as UserType } from "@/types";

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const { profile: currentProfile } = useProfile();
  const [otherProfile, setOtherProfile] = useState<ProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isOwnProfile = !id || id === currentUser?.id;
  const profileToShow = isOwnProfile ? currentProfile : otherProfile;
  
  const { posts } = usePosts(profileToShow?.id);
  const { isFollowing, followersCount, followingCount, toggleFollow } = useFollows(profileToShow?.id);

  useEffect(() => {
    const loadProfile = async () => {
      if (isOwnProfile) {
        setIsLoading(false);
        return;
      }

      if (id) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
          } else {
            setOtherProfile(data);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }
      setIsLoading(false);
    };

    loadProfile();
  }, [id, isOwnProfile]);

  const handleFollow = () => {
    toggleFollow();
  };

  const handleMessage = () => {
    if (profileToShow) {
      window.location.href = `/chats/${profileToShow.id}`;
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!profileToShow) {
    return (
      <MainLayout>
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold mb-2">Profile not found</h2>
          <p className="text-muted-foreground">The profile you're looking for doesn't exist.</p>
        </div>
      </MainLayout>
    );
  }

  // Convert database profile to User type for compatibility
  const userForDisplay: UserType = {
    id: profileToShow.id,
    name: profileToShow.name || "User",
    age: 25, // Default age since it's not in profiles table
    location: profileToShow.location || "",
    avatar: profileToShow.avatar || "/placeholder.svg",
    bio: profileToShow.bio || "",
    interests: profileToShow.interests || [],
    email: currentUser?.email || "",
    username: profileToShow.username || "user",
    followers: followersCount,
    following: followingCount,
    isPrivate: profileToShow.is_private || false
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        {/* Header with Navigation */}
        {!isOwnProfile && (
          <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="flex items-center justify-between p-4">
              <BackNavigation />
              <h1 className="text-xl font-semibold">{userForDisplay.username}</h1>
              <div className="w-10" />
            </div>
          </div>
        )}

        <InstagramProfileHeader 
          user={userForDisplay} 
          isOwnProfile={isOwnProfile}
          onFollow={handleFollow}
          onMessage={handleMessage}
          posts={posts}
          isFollowing={isFollowing}
        />
      </div>
      
      <div className="md:hidden h-16"></div>
    </MainLayout>
  );
}
