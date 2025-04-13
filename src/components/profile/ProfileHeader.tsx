
import { useState, useRef } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage, ChannelAvatar } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AuthUser, User } from "@/types";

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
  </svg>
);

interface ProfileHeaderProps {
  avatarUrl: string | null;
  userData: AuthUser | null;
  profileData: User | null;
  user: any;
  handleProfilePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLoginPage: () => void;
}

export function ProfileHeader({
  avatarUrl,
  userData,
  user,
  handleProfilePhotoChange,
  handleLoginPage
}: ProfileHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  const handleProfilePhotoClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="relative rounded-xl overflow-hidden">
      <div className="h-48 md:h-64 bg-gradient-to-r from-primary/30 to-accent/30 relative">
        <Button 
          variant="secondary" 
          size="sm" 
          className="absolute bottom-4 right-4"
          aria-label="Edit cover photo"
        >
          <Camera className="h-4 w-4 mr-2" />
          Edit Cover
        </Button>
      </div>
      
      <div className="absolute left-8 md:left-10 -bottom-16 md:-bottom-20">
        <div className="relative">
          <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background">
            <AvatarImage src={avatarUrl || userData?.avatar || "/placeholder.svg"} alt="Profile" />
            <AvatarFallback className="text-4xl">{userData?.name?.charAt(0) || userData?.username?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <Button 
            variant="secondary" 
            size="icon" 
            className="absolute bottom-2 right-2 rounded-full shadow-md"
            aria-label="Change profile picture"
            onClick={handleProfilePhotoClick}
          >
            <Camera className="h-4 w-4" />
          </Button>
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*"
            className="hidden" 
            onChange={handleProfilePhotoChange}
          />
        </div>
      </div>
      
      <div className="absolute right-4 bottom-4 md:bottom-6 flex items-center gap-2">
        <ChannelAvatar className="h-8 w-8 border-2 border-background">
          <AvatarImage src="/placeholder.svg" alt="Channel" />
          <AvatarFallback>C</AvatarFallback>
        </ChannelAvatar>
        
        {!user && (
          <>
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleLoginPage}
              className="bg-background/80 backdrop-blur-sm"
            >
              Sign In
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLoginPage}
              className="bg-background/80 backdrop-blur-sm"
            >
              <GoogleIcon />
              Login with Google
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
