
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, TrendingUp, Users } from "lucide-react";
import { InterestBadge } from "@/components/ui/interest-badge";
import { USERS } from "@/data/mock-data";

// Trending channels data
const TRENDING_CHANNELS = [
  {
    id: "channel1",
    name: "LocalFoodies",
    members: 128,
    tags: ["Food", "Local"]
  },
  {
    id: "channel2",
    name: "TechTalk",
    members: 96,
    tags: ["Technology", "Programming"]
  },
  {
    id: "channel3",
    name: "FilmBuffs",
    members: 64,
    tags: ["Movies", "Entertainment"]
  }
];

export function DiscoverSidebar() {
  // Get nearby users (with lowest distance values)
  const nearbyUsers = [...USERS]
    .filter(user => typeof user.distance === 'number')
    .sort((a, b) => (a.distance || 99) - (b.distance || 99))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Suggested People */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-md flex items-center">
            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
            People Near You
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {nearbyUsers.map(user => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {user.distance} km away
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full">
            Show More
          </Button>
        </CardContent>
      </Card>
      
      {/* Trending Channels */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-md flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-muted-foreground" />
            Trending Channels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {TRENDING_CHANNELS.map(channel => (
            <div key={channel.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">{channel.name}</div>
                <div className="text-xs text-muted-foreground">
                  {channel.members} members
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {channel.tags.map(tag => (
                  <InterestBadge key={tag} label={tag} className="text-xs py-0.5" />
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Join Channel
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
      
      {/* Explore Interests */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-md">
            Explore Interests
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {["Technology", "Music", "Sports", "Cooking", "Gaming", "Books", "Art", "Travel", "Fashion", "Fitness"].map(interest => (
              <InterestBadge key={interest} label={interest} onClick={() => {}} />
            ))}
          </div>
          <Button variant="ghost" className="w-full text-sm mt-2">
            See All Interests
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
