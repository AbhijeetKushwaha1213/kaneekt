
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, TrendingUp, Users, Flame, Star } from "lucide-react";
import { InterestBadge } from "@/components/ui/interest-badge";
import { USERS } from "@/data/mock-data";
import { Badge } from "@/components/ui/badge";

// Enhanced trending channels data
const TRENDING_CHANNELS = [
  {
    id: "channel1",
    name: "LocalFoodies",
    members: 128,
    tags: ["Food", "Local"],
    description: "Discover local food spots and share your favorites",
    isActive: true,
    bannerColor: "from-orange-400 to-amber-300"
  },
  {
    id: "channel2",
    name: "TechTalk",
    members: 96,
    tags: ["Technology", "Programming"],
    description: "Discuss the latest in tech and programming",
    isActive: false,
    isPopular: true,
    bannerColor: "from-blue-400 to-indigo-400"
  },
  {
    id: "channel3",
    name: "FilmBuffs",
    members: 64,
    tags: ["Movies", "Entertainment"],
    description: "For movie enthusiasts and film discussions",
    isActive: false,
    bannerColor: "from-red-400 to-rose-300"
  }
];

// Function to get online status label
const getOnlineStatus = (user: any) => {
  // This would be dynamic in a real app
  const isOnline = user.id.charCodeAt(0) % 2 === 0;
  const wasRecentlyActive = user.id.charCodeAt(0) % 3 === 0;
  
  if (isOnline) {
    return <Badge className="bg-green-500 hover:bg-green-600 text-[10px] px-1">Online</Badge>;
  } else if (wasRecentlyActive) {
    return <Badge className="bg-amber-500 hover:bg-amber-600 text-[10px] px-1">Active Recently</Badge>;
  }
  return null;
};

export function DiscoverSidebar() {
  // Get nearby users (with lowest distance values)
  const nearbyUsers = [...USERS]
    .filter(user => typeof user.distance === 'number')
    .sort((a, b) => (a.distance || 99) - (b.distance || 99))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* People Near You */}
      <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-md flex items-center">
            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
            People Near You
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {nearbyUsers.map(user => (
            <div key={user.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center">
                    <span className="font-medium">{user.name}</span>
                    <div className="ml-2">
                      {getOnlineStatus(user)}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user.distance} km away
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-indigo-100 hover:text-indigo-700">
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="p-3 border-t">
            <Button variant="outline" size="sm" className="w-full">
              Show More
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Trending Channels */}
      <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-md flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-muted-foreground" />
            Trending Channels
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {TRENDING_CHANNELS.map(channel => (
            <div key={channel.id} className="p-4 border-b last:border-0">
              {/* Channel banner/header */}
              <div className={`h-12 rounded-md mb-3 bg-gradient-to-r ${channel.bannerColor} flex items-center justify-center relative overflow-hidden`}>
                <h3 className="text-white font-bold text-lg z-10">{channel.name}</h3>
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                {/* Status indicator */}
                {channel.isActive && (
                  <div className="absolute top-2 right-2 flex items-center bg-black/30 backdrop-blur-sm rounded-full px-1.5 py-0.5">
                    <Flame className="h-3 w-3 text-orange-500 mr-1" />
                    <span className="text-[10px] text-white">Active Now</span>
                  </div>
                )}
                {channel.isPopular && (
                  <div className="absolute top-2 right-2 flex items-center bg-black/30 backdrop-blur-sm rounded-full px-1.5 py-0.5">
                    <Star className="h-3 w-3 text-yellow-400 mr-1" />
                    <span className="text-[10px] text-white">Popular</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {channel.members} members
                  </div>
                </div>
                
                <p className="text-sm">{channel.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-2">
                  {channel.tags.map(tag => (
                    <InterestBadge key={tag} label={tag} className="text-xs py-0.5" />
                  ))}
                </div>
                
                <Button variant="outline" size="sm" className="w-full hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200">
                  Join Channel
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      
      {/* Explore Interests */}
      <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-md">
            Explore Interests
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {["Technology", "Music", "Sports", "Cooking", "Gaming", "Books", "Art", "Travel", "Fashion", "Fitness"].map(interest => (
              <InterestBadge 
                key={interest} 
                label={interest} 
                onClick={() => {}} 
                className="hover:scale-105 transition-transform duration-200"
              />
            ))}
          </div>
          <Button variant="ghost" className="w-full text-sm mt-4 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700">
            See All Interests
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
