
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Settings, Trash2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Channel {
  id: string;
  name: string;
  role: 'owner' | 'admin' | 'member';
  members: number;
  avatar?: string;
  notifications: 'all' | 'mentions' | 'none';
}

export function ChannelSettings() {
  const { toast } = useToast();
  
  // Mock channel data - replace with real data from API in production
  const channels: Channel[] = [
    {
      id: "1",
      name: "Photography Enthusiasts",
      role: "owner",
      members: 120,
      notifications: "all"
    },
    {
      id: "2",
      name: "Local Events",
      role: "admin",
      members: 52,
      notifications: "mentions"
    },
    {
      id: "3",
      name: "Tech Discussions",
      role: "member",
      members: 245,
      notifications: "none"
    }
  ];
  
  const handleNotificationChange = (channelId: string, setting: 'all' | 'mentions' | 'none') => {
    toast({
      title: "Notification settings updated",
      description: `Channel notifications updated to "${setting}".`
    });
  };
  
  const handleLeaveChannel = (channelId: string) => {
    toast({
      title: "Leave channel",
      description: "This feature is coming soon."
    });
  };
  
  const handleDeleteChannel = (channelId: string) => {
    toast({
      title: "Delete channel",
      description: "This feature is coming soon."
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Channel Management</h2>
        <p className="text-muted-foreground">
          Manage your channels and community settings
        </p>
      </div>
      
      <div className="space-y-4">
        {channels.map(channel => (
          <Card key={channel.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-medium">
                    {channel.name.charAt(0)}
                  </div>
                  <div>
                    <CardTitle>{channel.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      {channel.members} members
                      <Badge variant="outline" className="ml-2">
                        {channel.role}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex-1 min-w-[200px]">
                  <p className="text-sm font-medium mb-1">Notifications</p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant={channel.notifications === "all" ? "default" : "outline"}
                      onClick={() => handleNotificationChange(channel.id, "all")}
                    >
                      All
                    </Button>
                    <Button 
                      size="sm" 
                      variant={channel.notifications === "mentions" ? "default" : "outline"}
                      onClick={() => handleNotificationChange(channel.id, "mentions")}
                    >
                      Mentions
                    </Button>
                    <Button 
                      size="sm" 
                      variant={channel.notifications === "none" ? "default" : "outline"}
                      onClick={() => handleNotificationChange(channel.id, "none")}
                    >
                      None
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {(channel.role === 'owner' || channel.role === 'admin') && (
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  )}
                  
                  {channel.role === 'member' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleLeaveChannel(channel.id)}
                    >
                      Leave
                    </Button>
                  )}
                  
                  {channel.role === 'owner' && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteChannel(channel.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {channels.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground mb-4">
                You haven't joined any channels yet.
              </p>
              <Button>
                <Users className="h-4 w-4 mr-2" />
                Explore Channels
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
