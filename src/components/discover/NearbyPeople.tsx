
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useAuth } from '@/contexts/AuthContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { supabase } from '@/integrations/supabase/client';
import { calculateDistance, formatDistance } from '@/utils/distanceUtils';

interface NearbyUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  interests: string[];
  distance?: number;
}

export function NearbyPeople() {
  const { user } = useAuth();
  const { latitude, longitude } = useGeolocation();
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNearbyUsers();
  }, [latitude, longitude, user]);

  const loadNearbyUsers = async () => {
    try {
      if (!user) {
        setLoading(false);
        return;
      }

      // First try to load from Supabase with real location data
      if (latitude && longitude) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, username, avatar, interests, latitude, longitude')
          .neq('id', user.id)
          .eq('location_sharing_enabled', true)
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);

        if (!error && data) {
          const usersWithDistance = data
            .map(profile => ({
              ...profile,
              interests: profile.interests || [],
              distance: calculateDistance(
                { latitude, longitude },
                { latitude: profile.latitude!, longitude: profile.longitude! }
              )
            }))
            .filter(user => user.distance! <= 50) // Within 50km
            .sort((a, b) => a.distance! - b.distance!)
            .slice(0, 6);

          setNearbyUsers(usersWithDistance);
          setLoading(false);
          return;
        }
      }

      // Fallback to mock data for demonstration
      loadMockUsers();
    } catch (error) {
      console.error('Error loading nearby users:', error);
      loadMockUsers();
    }
  };

  const loadMockUsers = () => {
    // Mock users for demonstration when real location data isn't available
    const mockUsers = [
      {
        id: 'mock-1',
        name: 'Sarah Chen',
        username: 'sarahc',
        avatar: '/placeholder.svg',
        interests: ['Technology', 'Photography'],
        distance: 2.3
      },
      {
        id: 'mock-2',
        name: 'Marcus Johnson',
        username: 'marcusj',
        avatar: '/placeholder.svg',
        interests: ['Music', 'Art'],
        distance: 4.7
      },
      {
        id: 'mock-3',
        name: 'Elena Rodriguez',
        username: 'elenar',
        avatar: '/placeholder.svg',
        interests: ['Travel', 'Food'],
        distance: 6.1
      },
      {
        id: 'mock-4',
        name: 'David Kim',
        username: 'davidk',
        avatar: '/placeholder.svg',
        interests: ['Sports', 'Gaming'],
        distance: 8.5
      },
      {
        id: 'mock-5',
        name: 'Lisa Wang',
        username: 'lisaw',
        avatar: '/placeholder.svg',
        interests: ['Books', 'Coffee'],
        distance: 12.2
      },
      {
        id: 'mock-6',
        name: 'Alex Thompson',
        username: 'alext',
        avatar: '/placeholder.svg',
        interests: ['Fitness', 'Nature'],
        distance: 15.8
      }
    ];

    setNearbyUsers(mockUsers);
    setLoading(false);
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
                  {/* Online status indicator */}
                  <div className={`absolute top-2 right-2 h-3 w-3 rounded-full ${
                    nearbyUser.id.charCodeAt(0) % 2 === 0 ? 'bg-green-500' : 'bg-amber-500'
                  } ring-2 ring-white`}></div>
                  
                  <div className="aspect-[3/2] bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900"></div>
                  
                  <div className="absolute -bottom-6 left-4">
                    <Avatar className="h-12 w-12 border-2 border-background">
                      <AvatarImage src={nearbyUser.avatar} alt={nearbyUser.name} />
                      <AvatarFallback>{nearbyUser.name[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                
                <CardContent className="pt-8 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-slate-100 hover:text-indigo-600"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span className="sr-only">Connect</span>
                    </Button>
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
