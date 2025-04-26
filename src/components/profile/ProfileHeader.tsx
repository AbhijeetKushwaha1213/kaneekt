
import { Camera, LogIn } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthUser, User } from "@/types";
import { Button } from "@/components/ui/button";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { isImageUrlValid } from "@/utils/imageUtils";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
  const [displayAvatar, setDisplayAvatar] = useState<string>("/placeholder.svg");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const loadAvatar = async () => {
      const avatarToUse = avatarUrl || profileData?.avatar || userData?.avatar || "/placeholder.svg";
      
      // Verify if the avatar URL is valid
      if (avatarToUse !== "/placeholder.svg") {
        const isValid = await isImageUrlValid(avatarToUse);
        setDisplayAvatar(isValid ? avatarToUse : "/placeholder.svg");
      } else {
        setDisplayAvatar("/placeholder.svg");
      }
    };
    
    loadAvatar();
  }, [avatarUrl, profileData?.avatar, userData?.avatar]);
  
  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive"
        });
        return;
      }
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      // Show loading indicator
      setUploading(true);
      
      // Create a temporary preview
      const previewUrl = URL.createObjectURL(file);
      setDisplayAvatar(previewUrl);
      
      // Call the parent handler to actually process the upload
      handleProfilePhotoChange(e);
      
      // Clean up when done
      setTimeout(() => {
        setUploading(false);
      }, 1000);
    }
  };
  
  return (
    <div className="flex justify-between items-start">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative">
          <Avatar className="h-24 w-24 border-2 border-background">
            <AvatarImage 
              src={displayAvatar}
              alt={profileData?.name || userData?.name || "User"}
            />
            <AvatarFallback>
              {(profileData?.name?.[0] || userData?.name?.[0] || "U").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {isCurrentUser && (
            <label 
              htmlFor="avatar-upload"
              className={`absolute bottom-0 right-0 rounded-full ${uploading ? 'bg-gray-400' : 'bg-primary hover:bg-primary/90'} h-8 w-8 flex items-center justify-center cursor-pointer border-2 border-background`}
            >
              {uploading ? (
                <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin" />
              ) : (
                <Camera className="h-4 w-4 text-primary-foreground" />
              )}
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleProfileImageUpload}
                disabled={isLoading || uploading}
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
