
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { MapPin, Users, Clock, Wifi } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useLocationSharing } from '@/hooks/useLocationSharing';
import { useToast } from '@/hooks/use-toast';

export function LiveLocationSharing() {
  const { latitude, longitude, getCurrentPosition } = useGeolocation();
  const { isSharing, nearbyUsers, loading, startSharing, stopSharing, updateStatus } = useLocationSharing();
  const [userStatus, setUserStatus] = useState<'looking-to-chat' | 'open-to-meetup' | 'studying' | 'exploring'>('looking-to-chat');
  const { toast } = useToast();

  const toggleLiveLocation = async (enabled: boolean) => {
    if (enabled) {
      if (!latitude || !longitude) {
        getCurrentPosition();
        return;
      }
      
      await startSharing(latitude, longitude, userStatus);
    } else {
      await stopSharing();
    }
  };

  const getStatusColor = (status: string) => {
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

  const getStatusLabel = (status: string) => {
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

  const connectWithUser = (user: any) => {
    toast({
      title: "Connection request sent!",
      description: `We've notified ${user.user?.name} that you'd like to connect`
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
              checked={isSharing}
              onCheckedChange={toggleLiveLocation}
            />
          </div>
          
          {isSharing && (
            <div className="space-y-3 pt-3 border-t">
              <div>
                <label className="text-sm font-medium">Your status</label>
                <div className="flex gap-2 mt-2">
                  {(['looking-to-chat', 'open-to-meetup', 'studying', 'exploring'] as const).map((status) => (
                    <Button
                      key={status}
                      variant={userStatus === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={async () => {
                        setUserStatus(status);
                        await updateStatus(status);
                      }}
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
      {isSharing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              People Nearby ({nearbyUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Finding nearby users...</p>
              </div>
            ) : nearbyUsers.length > 0 ? (
              <div className="space-y-4">
                {nearbyUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.user?.avatar} alt={user.user?.name} />
                          <AvatarFallback>{user.user?.name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(user.status)} border-2 border-white rounded-full`} />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium">{user.user?.name || 'User'}</h4>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {user.distance ? `${user.distance.toFixed(1)}km away` : 'Nearby'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {Math.round((Date.now() - new Date(user.last_updated).getTime()) / 60000)}m ago
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Badge variant="outline" className={`text-xs ${getStatusColor(user.status)} text-white border-0`}>
                            {getStatusLabel(user.status)}
                          </Badge>
                          {user.location_name && (
                            <span className="text-xs text-muted-foreground">at {user.location_name}</span>
                          )}
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
