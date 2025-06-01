
import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface ProfileHeaderInfoProps {
  user: User;
  isOwnProfile: boolean;
}

export function ProfileHeaderInfo({ user, isOwnProfile }: ProfileHeaderInfoProps) {
  const { toast } = useToast();

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully.",
      });
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 p-6">
      {/* Profile Picture */}
      <div className="relative">
        <Avatar className="h-32 w-32 md:h-40 md:w-40">
          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
          <AvatarFallback className="text-2xl">
            {user.name?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        
        {isOwnProfile && (
          <label 
            htmlFor="avatar-upload"
            className="absolute bottom-2 right-2 rounded-full bg-primary hover:bg-primary/90 h-8 w-8 flex items-center justify-center cursor-pointer border-2 border-background transition-colors"
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

      {/* Profile Info */}
      <div className="flex-1 text-center md:text-left">
        <h1 className="text-2xl font-light mb-4">{user.username || user.name}</h1>

        {/* Bio */}
        <div className="mb-4">
          <h2 className="font-semibold">{user.name}</h2>
          {user.bio && <p className="text-gray-700 mt-1">{user.bio}</p>}
          {user.location && (
            <p className="text-gray-500 text-sm mt-1">{user.location}</p>
          )}
        </div>

        {/* Interests */}
        {user.interests && user.interests.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {user.interests.map((interest, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {interest}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
