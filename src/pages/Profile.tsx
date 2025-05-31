
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { InstagramProfileHeader } from "@/components/profile/InstagramProfileHeader";
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
        // Load current user's profile - create a UserType from Supabase User
        const profile: UserType = {
          id: currentUser.id,
          name: currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || "User",
          age: 25,
          location: currentUser.user_metadata?.location || "San Francisco, CA",
          avatar: currentUser.user_metadata?.avatar_url || "/placeholder.svg",
          bio: "Living life to the fullest 🌟 | Coffee lover ☕ | Travel enthusiast ✈️",
          interests: ["Photography", "Travel", "Coffee", "Technology", "Fitness"],
          email: currentUser.email || "",
          username: currentUser.user_metadata?.username || currentUser.email?.split('@')[0] || "user",
          followers: 256,
          following: 189,
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
          bio: "Photography enthusiast and travel lover 📸✈️ | Creating memories around the world",
          interests: ["Photography", "Travel", "Art", "Coffee", "Music"],
          email: "emma@example.com",
          username: "emmawilson",
          followers: 1024,
          following: 256,
          isPrivate: false
        };
        setUser(mockUser);
      }

      setIsLoading(false);
    };

    loadUserProfile();
  }, [id, currentUser, isOwnProfile]);

  const handleFollow = () => {
    // Implementation for follow functionality
    console.log("Follow user:", user?.name);
  };

  const handleMessage = () => {
    // Navigate to chat with this user
    if (user) {
      window.location.href = `/chats/${user.id}`;
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
      <div className="min-h-screen bg-white">
        {/* Header with Navigation */}
        {!isOwnProfile && (
          <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="flex items-center justify-between p-4">
              <BackNavigation />
              <h1 className="text-xl font-semibold">{user?.username}</h1>
              <div className="w-10" />
            </div>
          </div>
        )}

        <InstagramProfileHeader 
          user={user} 
          isOwnProfile={isOwnProfile}
          onFollow={handleFollow}
          onMessage={handleMessage}
        />
      </div>
      
      <div className="md:hidden h-16"></div>
    </MainLayout>
  );
}
