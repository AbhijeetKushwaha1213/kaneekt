
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { MapPin, Heart, MessageCircle, UserPlus } from 'lucide-react';
import { ProfileView } from "@/components/ui/profile-view";
import { User } from "@/types";

interface NearbyPeopleProps {
  searchQuery?: string;
  selectedInterests?: string[];
}

export function NearbyPeople({ searchQuery, selectedInterests }: NearbyPeopleProps) {
  const [people, setPeople] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [profileViewOpen, setProfileViewOpen] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const mockNearbyPeople: User[] = [
    {
      id: '1',
      name: 'Emma Wilson',
      age: 24,
      location: 'Downtown, 2.1 km away',
      avatar: '/placeholder.svg',
      bio: 'Love hiking and photography 📸',
      interests: ['Photography', 'Hiking', 'Travel'],
      distance: 2.1
    },
    {
      id: '2',
      name: 'Alex Chen',
      age: 27,
      location: 'Central Park, 1.5 km away',
      avatar: '/placeholder.svg',
      bio: 'Coffee enthusiast and book lover ☕📚',
      interests: ['Coffee', 'Reading', 'Music'],
      distance: 1.5
    },
    {
      id: '3',
      name: 'Sarah Johnson',
      age: 26,
      location: 'Midtown, 3.2 km away',
      avatar: '/placeholder.svg',
      bio: 'Fitness trainer and yoga instructor 🧘‍♀️',
      interests: ['Fitness', 'Yoga', 'Wellness'],
      distance: 3.2
    },
    {
      id: '4',
      name: 'Michael Brown',
      age: 29,
      location: 'East Side, 4.1 km away',
      avatar: '/placeholder.svg',
      bio: 'Tech enthusiast and gamer 🎮',
      interests: ['Technology', 'Gaming', 'Programming'],
      distance: 4.1
    }
  ];

  useEffect(() => {
    let filteredPeople = mockNearbyPeople;

    if (searchQuery) {
      filteredPeople = filteredPeople.filter(person =>
        person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.bio.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedInterests && selectedInterests.length > 0) {
      filteredPeople = filteredPeople.filter(person =>
        person.interests.some(interest =>
          selectedInterests.includes(interest)
        )
      );
    }

    setPeople(filteredPeople);
  }, [searchQuery, selectedInterests]);

  const requestLocationPermission = async () => {
    setLoading(true);
    
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      setLocationEnabled(true);
      toast({
        title: "Location enabled!",
        description: "Now showing people near your location",
      });

      console.log('Location obtained:', position.coords);
      
    } catch (error) {
      console.error('Location error:', error);
      
      let errorMessage = "Unable to get your location";
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
      }
      
      toast({
        title: "Location Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (personId: string) => {
    toast({
      title: "Profile liked!",
      description: "They'll be notified if they like you back",
    });
  };

  const handleMessage = (person: User) => {
    // Create conversation and navigate to chat
    const newConversation = {
      id: `conv-${person.id}`,
      user: {
        id: person.id,
        name: person.name,
        avatar: person.avatar || '/placeholder.svg'
      },
      lastMessage: {
        id: 'initial',
        content: '',
        timestamp: new Date(),
        unread: false
      },
      isApproved: true
    };

    const conversations = JSON.parse(localStorage.getItem("conversations") || "[]");
    const existingIndex = conversations.findIndex((c: any) => c.id === newConversation.id);
    
    if (existingIndex === -1) {
      conversations.unshift(newConversation);
      localStorage.setItem("conversations", JSON.stringify(conversations));
    }

    window.location.href = `/chats/${person.id}`;
  };

  const handleConnect = (personId: string) => {
    toast({
      title: "Connection request sent!",
      description: "You'll be notified when they respond",
    });
  };

  const handleProfileClick = (person: User) => {
    setSelectedUser(person);
    setProfileViewOpen(true);
  };

  if (!locationEnabled) {
    return (
      <Card className="text-center p-8">
        <CardContent>
          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Discover People Nearby</h3>
          <p className="text-muted-foreground mb-4">
            Enable location to find interesting people around you
          </p>
          <Button 
            onClick={requestLocationPermission} 
            disabled={loading}
            className="w-full max-w-xs"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Getting Location...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Enable Location
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Your location is used only to show nearby people and is not stored
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">People Nearby</h2>
        <Badge variant="secondary" className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {people.length} nearby
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {people.map((person) => (
          <Card key={person.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={person.avatar || '/placeholder.svg'}
                  alt={person.name}
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => handleProfileClick(person)}
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs">
                    {person.distance} km
                  </Badge>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 
                    className="font-semibold text-lg cursor-pointer hover:text-primary"
                    onClick={() => handleProfileClick(person)}
                  >
                    {person.name}, {person.age}
                  </h3>
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {person.location}
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {person.bio}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {person.interests.slice(0, 3).map((interest, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                  {person.interests.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{person.interests.length - 3}
                    </Badge>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLike(person.id)}
                    className="flex-1"
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    Like
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMessage(person)}
                    className="flex-1"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Chat
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleConnect(person.id)}
                    className="flex-1"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Connect
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ProfileView
        user={selectedUser}
        open={profileViewOpen}
        onOpenChange={setProfileViewOpen}
      />
    </div>
  );
}
