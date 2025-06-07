
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { MapPin, Users, Clock, Wifi } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useToast } from '@/hooks/use-toast';
import { formatDistance } from '@/utils/distanceUtils';

interface LiveUser {
  id: string;
  name: string;
  avatar?: string;
  location: string;
  distance: number;
  status: 'looking-to-chat' | 'open-to-meetup' | 'studying' | 'exploring';
  lastSeen: Date;
  interests: string[];
}

export function LiveLocationSharing() {
  const [isLiveLocationEnabled, setIsLiveLocationEnabled] = useState(false);
  const [liveUsers, setLiveUsers] = useState<LiveUser[]>([]);
  const [userStatus, setUserStatus] = useState<LiveUser['status']>('looking-to-chat');
  const { latitude, longitude, getCurrentPosition } = useGeolocation();
  const { toast } = useToast();

  useEffect(() => {
    // Check if live location is already enabled
    const savedPreference = localStorage.getItem('liveLocationEnabled');
    if (savedPreference === 'true') {
      setIsLiveLocationEnabled(true);
      if (!latitude || !longitude) {
        getCurrentPosition();
      }
    }
  }, []);

  useEffect(() => {
    if (isLiveLocationEnabled && latitude && longitude) {
      loadLiveUsers();
      
      // Simulate real-time updates
      const interval = setInterval(loadLiveUsers, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isLiveLocationEnabled, latitude, longitude]);

  const loadLiveUsers = () => {
    // Mock live users data
    const mockLiveUsers: LiveUser[] = [
      {
        id: '1',
        name: 'Sarah Chen',
        avatar: '/placeholder.svg',
        location: 'Central Park',
        distance: 0.5,
        status: 'looking-to-chat',
        lastSeen: new Date(Date.now() - 120000), // 2 minutes ago
        interests: ['Photography', 'Travel']
      },
      {
        id: '2',
        name: 'Alex Rodriguez',
        location: 'Coffee Bean Café',
        distance: 1.2,
        status: 'studying',
        lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
        interests: ['Programming', 'Music']
      },
      {
        id: '3',
        name: 'Jordan Kim',
        location: 'Library Downtown',
        distance: 2.8,
        status: 'open-to-meetup',
        lastSeen: new Date(Date.now() - 600000), // 10 minutes ago
        interests: ['Reading', 'Philosophy']
      }
    ];

    setLiveUsers(mockLiveUsers);
  };

  const toggleLiveLocation = async (enabled: boolean) => {
    if (enabled) {
      if (!latitude || !longitude) {
        getCurrentPosition();
      }
      
      localStorage.setItem('liveLocationEnabled', 'true');
      setIsLiveLocationEnabled(true);
      
      toast({
        title: "Live location enabled",
        description: "You're now visible to nearby users looking to connect"
      });
    } else {
      localStorage.setItem('liveLocationEnabled', 'false');
      setIsLiveLocationEnabled(false);
      setLiveUsers([]);
      
      toast({
        title: "Live location disabled",
        description: "You're no longer sharing your location"
      });
    }
  };

  const getStatusColor = (status: LiveUser['status']) => {
    switch (status) {
      case 'looking-to-chat':
        return 'bg-green-500';
      case 'open-to-meetup':
        return 'bg-blue-500';
      case 'studying':
        return 'bg-yellow-500';
      case 'exploring':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: LiveUser['status']) => {
    switch (status) {
      case 'looking-to-chat':
        return 'Looking to chat';
      case 'open-to-meetup':
        return 'Open to meetup';
      case 'studying':
        return 'Studying';
      case 'exploring':
        return 'Exploring';
      default:
        return status;
    }
  };

  const connectWithUser = (user: LiveUser) => {
    toast({
      title: "Connection request sent!",
      description: `We've notified ${user.name} that you'd like to connect`
    });
  };

  return (
    <div className="space-y-4">
      {/* Live Location Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Live Location Sharing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Share your location live</h4>
              <p className="text-sm text-muted-foreground">
                Let nearby users know you're available to connect
              </p>
            </div>
            <Switch
              checked={isLiveLocationEnabled}
              onCheckedChange={toggleLiveLocation}
            />
          </div>
          
          {isLiveLocationEnabled && (
            <div className="space-y-3 pt-3 border-t">
              <div>
                <label className="text-sm font-medium">Your status</label>
                <div className="flex gap-2 mt-2">
                  {(['looking-to-chat', 'open-to-meetup', 'studying', 'exploring'] as const).map((status) => (
                    <Button
                      key={status}
                      variant={userStatus === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setUserStatus(status)}
                      className="text-xs"
                    >
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(status)} mr-2`} />
                      {getStatusLabel(status)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Users */}
      {isLiveLocationEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              People Nearby ({liveUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {liveUsers.length > 0 ? (
              <div className="space-y-4">
                {liveUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(user.status)} border-2 border-white rounded-full`} />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium">{user.name}</h4>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {formatDistance(user.distance)} away
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {Math.round((Date.now() - user.lastSeen.getTime()) / 60000)}m ago
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Badge variant="outline" className={`text-xs ${getStatusColor(user.status)} text-white border-0`}>
                            {getStatusLabel(user.status)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">at {user.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      onClick={() => connectWithUser(user)}
                    >
                      Connect
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No one nearby right now</h3>
                <p className="text-sm text-muted-foreground">
                  Check back later or try moving to a busier area
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
