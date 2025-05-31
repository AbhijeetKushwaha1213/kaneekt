
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { ActivityTabs } from "@/components/profile/ActivityTabs";
import { BackNavigation } from "@/components/ui/back-navigation";
import { useAuth } from "@/contexts/AuthContext";
import { User as UserType } from "@/types";

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isOwnProfile = !id || id === currentUser?.id;

  useEffect(() => {
    const loadUserProfile = async () => {
      setIsLoading(true);

      if (isOwnProfile && currentUser) {
        // Load current user's profile
        const profile: UserType = {
          id: currentUser.id,
          name: currentUser.name || "User",
          age: 25,
          location: currentUser.location || "Location not set",
          avatar: currentUser.avatar || "/placeholder.svg",
          bio: "Bio not set",
          interests: [],
          email: currentUser.email || "",
          username: currentUser.username || currentUser.email?.split('@')[0] || "user",
          followers: 156,
          following: 89,
          isPrivate: false
        };
        setUser(profile);
      } else if (id) {
        // Load other user's profile (mock data for demo)
        const mockUser: UserType = {
          id: id,
          name: "Emma Wilson",
          age: 24,
          location: "New York, NY",
          avatar: "/placeholder.svg",
          bio: "Photography enthusiast and travel lover 📸✈️",
          interests: ["Photography", "Travel", "Art", "Coffee"],
          email: "emma@example.com",
          username: "emmawilson",
          followers: 324,
          following: 156,
          isPrivate: false
        };
        setUser(mockUser);
      }

      setIsLoading(false);
    };

    loadUserProfile();
  }, [id, currentUser, isOwnProfile]);

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

  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold mb-2">Profile not found</h2>
          <p className="text-muted-foreground">The profile you're looking for doesn't exist.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* Header with Navigation */}
        {!isOwnProfile && (
          <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="flex items-center justify-between p-4">
              <BackNavigation />
              <h1 className="text-xl font-semibold">{user?.name}</h1>
              <div className="w-10" />
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <ProfileHeader user={user} isOwnProfile={isOwnProfile} />
          <ProfileInfo 
            userData={user ? { name: user.name, username: user.username } : null}
            profileData={user}
            isPrivate={user?.isPrivate || false}
            getAge={() => user?.age || null}
          />
          <ActivityTabs 
            posts={[]}
            userData={currentUser}
            avatarUrl={user?.avatar || null}
            handleCreatePostClick={() => {}}
          />
        </div>
      </div>
      
      <div className="md:hidden h-16"></div>
    </MainLayout>
  );
}
