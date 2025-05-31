
import { Camera, LogIn } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types";
import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
  user: User;
  isOwnProfile: boolean;
}

export function ProfileHeader({
  user,
  isOwnProfile
}: ProfileHeaderProps) {
  
  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle profile image upload
    console.log("Profile image upload:", e.target.files);
  };
  
  const handleLoginPage = () => {
    // Handle navigation to login page
    console.log("Navigate to login");
  };
  
  return (
    <div className="flex justify-between items-start p-4">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative">
          <Avatar className="h-24 w-24 border-2 border-background">
            <AvatarImage 
              src={user.avatar || "/placeholder.svg"}
              alt={user.name}
            />
            <AvatarFallback>
              {user.name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          
          {isOwnProfile && (
            <label 
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 rounded-full bg-primary hover:bg-primary/90 h-8 w-8 flex items-center justify-center cursor-pointer border-2 border-background transition-colors"
            >
              <Camera className="h-4 w-4 text-primary-foreground" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleProfileImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-center sm:text-left">
            {user.name}
          </h1>
          <p className="text-muted-foreground text-center sm:text-left">
            @{user.username}
          </p>
        </div>
      </div>
      
      {!isOwnProfile && (
        <Button onClick={handleLoginPage}>
          <LogIn className="h-4 w-4 mr-2" />
          Login to interact
        </Button>
      )}
    </div>
  );
}
