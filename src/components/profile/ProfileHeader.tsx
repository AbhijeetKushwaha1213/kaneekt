
import { Camera, LogIn } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthUser, User } from "@/types";
import { Button } from "@/components/ui/button";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface ProfileHeaderProps {
  avatarUrl: string | null;
  userData: AuthUser | null;
  profileData: User | null;
  user: SupabaseUser | null;
  handleProfilePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLoginPage: () => void;
  isLoading?: boolean;
}

export function ProfileHeader({
  avatarUrl,
  userData,
  profileData,
  user,
  handleProfilePhotoChange,
  handleLoginPage,
  isLoading
}: ProfileHeaderProps) {
  const isCurrentUser = !!user;
  
  return (
    <div className="flex justify-between items-start">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative">
          <Avatar className="h-24 w-24 border-2 border-background">
            <AvatarImage 
              src={avatarUrl || profileData?.avatar || "/placeholder.svg"}
              alt={profileData?.name || userData?.name || "User"}
            />
            <AvatarFallback>
              {(profileData?.name?.[0] || userData?.name?.[0] || "U").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {isCurrentUser && (
            <label 
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 rounded-full bg-primary hover:bg-primary/90 h-8 w-8 flex items-center justify-center cursor-pointer border-2 border-background"
            >
              <Camera className="h-4 w-4 text-primary-foreground" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleProfilePhotoChange}
                disabled={isLoading}
                className="hidden"
              />
            </label>
          )}
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-center sm:text-left">
            {profileData?.name || userData?.name || "User"}
          </h1>
          <p className="text-muted-foreground text-center sm:text-left">
            @{profileData?.username || userData?.username || "user"}
          </p>
        </div>
      </div>
      
      {!isCurrentUser && (
        <Button onClick={handleLoginPage} disabled={isLoading}>
          <LogIn className="h-4 w-4 mr-2" />
          Login to interact
        </Button>
      )}
    </div>
  );
}
