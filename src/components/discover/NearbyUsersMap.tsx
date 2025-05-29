
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, MessageCircle, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { formatDistance } from '@/utils/distanceUtils';
import { useToast } from '@/hooks/use-toast';

interface NearbyUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  distance?: number;
}

export function NearbyUsersMap() {
  const { user } = useAuth();
  const { latitude, longitude, getCurrentPosition } = useGeolocation();
  const { toast } = useToast();
  
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [radius, setRadius] = useState(25); // Default 25km radius

  useEffect(() => {
    if (latitude && longitude) {
      loadMockNearbyUsers();
    }
  }, [latitude, longitude, radius]);

  const loadMockNearbyUsers = () => {
    // Mock data since database location features aren't available
    const mockUsers = [
      {
        id: 'mock-1',
        name: 'Sarah Chen',
        username: 'sarahc',
        avatar: '/placeholder.svg',
        distance: 2.3
      },
      {
        id: 'mock-2',
        name: 'Marcus Johnson',
        username: 'marcusj',
        avatar: '/placeholder.svg',
        distance: 4.7
      },
      {
        id: 'mock-3',
        name: 'Elena Rodriguez',
        username: 'elenar',
        avatar: '/placeholder.svg',
        distance: radius > 10 ? 15.2 : undefined
      }
    ].filter(user => !user.distance || user.distance <= radius);

    setNearbyUsers(mockUsers);
  };

  const handleMessageUser = (userId: string) => {
    // Navigate to chat with this user
    window.location.href = `/chats/${userId}`;
  };

  const handleConnectUser = (userId: string) => {
    toast({
      title: 'Connection request sent',
      description: 'Your connection request has been sent to this user.'
    });
  };

  if (!latitude || !longitude) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Nearby People
          </CardTitle>
          <CardDescription>
            Enable location access to discover people near you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={getCurrentPosition} className="w-full">
            Enable Location Access
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          People Near You
        </CardTitle>
        <CardDescription>
          {nearbyUsers.length} people found within {radius}km
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Radius Controls */}
        <div className="flex gap-2">
          {[10, 25, 50, 100].map(r => (
            <Button
              key={r}
              variant={radius === r ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRadius(r)}
            >
              {r}km
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Finding nearby people...</p>
          </div>
        ) : nearbyUsers.length > 0 ? (
          <div className="space-y-3">
            {nearbyUsers.map(nearbyUser => (
              <div
                key={nearbyUser.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={nearbyUser.avatar} alt={nearbyUser.name} />
                    <AvatarFallback>{nearbyUser.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <p className="font-medium">{nearbyUser.name}</p>
                    <p className="text-sm text-muted-foreground">@{nearbyUser.username}</p>
                    {nearbyUser.distance && (
                      <Badge variant="secondary" className="text-xs">
                        {formatDistance(nearbyUser.distance)} away
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMessageUser(nearbyUser.id)}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleConnectUser(nearbyUser.id)}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No people found within {radius}km</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try increasing the search radius or check back later
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
