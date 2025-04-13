
import React from 'react';
import { MapPin, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface DiscoverHeroProps {
  timeOfDay: string;
  location: string;
  onLocationClick: () => void;
}

export function DiscoverHero({ timeOfDay, location, onLocationClick }: DiscoverHeroProps) {
  // Mock user data - in a real app this would come from auth context
  const user = {
    name: "Alex",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80"
  };
  
  // Get current date
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', options);
  
  return (
    <div className="relative overflow-hidden">
      {/* Background gradient with subtle animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 opacity-80">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzMjMyMzIiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0aDR2MWgtNHYtMXptMC0yaC00djFoNHYtMXptMC00aC00djFoNHYtMXptLTIgLTJoLTJ2MWgyek00MiAyOGgtNHYxaDR2LTF6bTAgNGg0djFoLTR2LTF6TTM2IDM0aDR2MWgtNHYtMXptMC0yaC00djFoNHYtMXptMC00aC00djFoNHYtMXptMi0yaC0ydjFoMnYtMXptMTAgOGgtNHYxaDR2LTF6bTAgNGg0djFoLTR2LTF6bTIgNGgtMnYxaDJ2LTF6bTAgNC0yIDBoLTR2MWg0djFoMnYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')]"></div>
      </div>
      
      {/* Content */}
      <div className="relative px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <HoverCard>
              <HoverCardTrigger asChild>
                <Avatar className="h-12 w-12 border-2 border-white shadow-sm cursor-pointer">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="flex justify-between space-x-4">
                  <Avatar>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">@{user.name.toLowerCase()}</h4>
                    <p className="text-sm">
                      View your full profile to update your status and see who's viewed your profile.
                    </p>
                    <div className="flex items-center pt-2">
                      <Button variant="outline" size="sm" className="text-xs">View Profile</Button>
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
            
            <div>
              <h1 className="text-2xl font-bold mb-1">
                Good {timeOfDay}, {user.name} 👋
              </h1>
              <p className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
              </p>
            </div>
          </div>
          
          <p className="mt-3 text-lg">Here's what's happening near you</p>
        </div>
        
        <Button 
          variant="outline"
          size="sm"
          className="flex items-center gap-1 border border-gray-300 bg-white/80 backdrop-blur-sm shadow-sm hover:bg-gray-100"
          onClick={onLocationClick}
        >
          <MapPin className="h-4 w-4 text-rose-500" />
          <span>{location}</span>
        </Button>
      </div>
    </div>
  );
}
