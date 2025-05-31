
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus, MessageSquare, MapPin } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useAuth } from '@/contexts/AuthContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { calculateDistance, formatDistance } from '@/utils/distanceUtils';
import { useToast } from '@/hooks/use-toast';

interface NearbyUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  interests: string[];
  distance?: number;
  isFriend?: boolean;
}

export function NearbyPeople() {
  const { user } = useAuth();
  const { latitude, longitude, getCurrentPosition } = useGeolocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadMockUsers();
    loadFriends();
  }, [latitude, longitude, user]);

  const loadFriends = () => {
    const stored = localStorage.getItem('user_friends');
    if (stored) {
      setFriends(new Set(JSON.parse(stored)));
    }
  };

  const handleLocationRequest = async () => {
    try {
      getCurrentPosition();
      toast({
        title: "Location enabled",
        description: "Now showing people near you!",
      });
      loadMockUsers();
    } catch (error) {
      toast({
        title: "Location access denied",
        description: "Please enable location to see nearby people",
        variant: "destructive"
      });
    }
  };

  const loadMockUsers = () => {
    const mockUsers = [
      {
        id: 'mock-1',
        name: 'Sarah Chen',
        username: 'sarahc',
        avatar: '/placeholder.svg',
        interests: ['Technology', 'Photography'],
        distance: latitude && longitude ? 2.3 : undefined,
        isFriend: false
      },
      {
        id: 'mock-2',
        name: 'Marcus Johnson',
        username: 'marcusj',
        avatar: '/placeholder.svg',
        interests: ['Music', 'Art'],
        distance: latitude && longitude ? 4.7 : undefined,
        isFriend: false
      },
      {
        id: 'mock-3',
        name: 'Elena Rodriguez',
        username: 'elenar',
        avatar: '/placeholder.svg',
        interests: ['Travel', 'Food'],
        distance: latitude && longitude ? 6.1 : undefined,
        isFriend: false
      },
      {
        id: 'mock-4',
        name: 'David Kim',
        username: 'davidk',
        avatar: '/placeholder.svg',
        interests: ['Sports', 'Gaming'],
        distance: latitude && longitude ? 8.5 : undefined,
        isFriend: false
      }
    ];

    setNearbyUsers(mockUsers);
    setLoading(false);
  };

  const handleProfileClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleAddFriend = (userId: string, userName: string) => {
    const newFriends = new Set(friends);
    
    if (friends.has(userId)) {
      newFriends.delete(userId);
      toast({
        title: "Friend removed",
        description: `You are no longer friends with ${userName}`,
      });
    } else {
      newFriends.add(userId);
      toast({
        title: "Friend request sent! 👥",
        description: `Friend request sent to ${userName}`,
      });
    }
    
    setFriends(newFriends);
    localStorage.setItem('user_friends', JSON.stringify(Array.from(newFriends)));
    
    // Update the local state
    setNearbyUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, isFriend: !u.isFriend } : u
    ));
  };

  if (loading) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-3 flex items-center">
          <span className="mr-2">👥</span> People Near You
        </h2>
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!latitude || !longitude) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-3 flex items-center">
          <span className="mr-2">👥</span> People Near You
        </h2>
        <Card className="p-6 text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Enable Location</h3>
          <p className="text-muted-foreground mb-4">
            Allow location access to discover people nearby
          </p>
          <Button onClick={handleLocationRequest}>
            Enable Location
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium mb-3 flex items-center">
        <span className="mr-2">👥</span> People Near You
      </h2>
      
      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {nearbyUsers.map((nearbyUser) => (
            <CarouselItem key={nearbyUser.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
              <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                <div className="relative">
                  <div className={`absolute top-2 right-2 h-3 w-3 rounded-full ${
                    nearbyUser.id.charCodeAt(0) % 2 === 0 ? 'bg-green-500' : 'bg-amber-500'
                  } ring-2 ring-white`}></div>
                  
                  <div 
                    className="aspect-[3/2] bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 cursor-pointer"
                    onClick={() => handleProfileClick(nearbyUser.id)}
                  ></div>
                  
                  <div className="absolute -bottom-6 left-4">
                    <Avatar className="h-12 w-12 border-2 border-background">
                      <AvatarImage src={nearbyUser.avatar} alt={nearbyUser.name} />
                      <AvatarFallback>{nearbyUser.name[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                
                <CardContent className="pt-8 pb-4">
                  <div className="flex justify-between items-start">
                    <div 
                      className="cursor-pointer flex-1"
                      onClick={() => handleProfileClick(nearbyUser.id)}
                    >
                      <h3 className="font-medium">{nearbyUser.name}</h3>
                      <div className="text-xs text-muted-foreground flex flex-col">
                        <span>
                          {nearbyUser.distance ? formatDistance(nearbyUser.distance) : 'Nearby'}
                        </span>
                        <span className="mt-1 text-xs">
                          {nearbyUser.interests.slice(0, 2).join(' • ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-blue-100 hover:text-blue-600"
                        onClick={() => handleAddFriend(nearbyUser.id, nearbyUser.name)}
                      >
                        <UserPlus 
                          className={`h-4 w-4 ${
                            friends.has(nearbyUser.id) 
                              ? 'fill-blue-500 text-blue-500' 
                              : ''
                          }`} 
                        />
                        <span className="sr-only">Add Friend</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-slate-100 hover:text-indigo-600"
                        onClick={() => handleProfileClick(nearbyUser.id)}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span className="sr-only">Message</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden sm:block">
          <CarouselPrevious className="left-0" />
          <CarouselNext className="right-0" />
        </div>
      </Carousel>
    </div>
  );
}
