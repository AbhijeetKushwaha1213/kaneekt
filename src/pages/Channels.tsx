
import { useState } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useChannels } from "@/hooks/useChannels";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Plus, Users, Hash, Lock, Globe, User } from "lucide-react";

function ChannelsContent() {
  const { user } = useAuth();
  const { channels, myChannels, loading, createChannel, joinChannel, leaveChannel } = useChannels();
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newChannel, setNewChannel] = useState({
    name: "",
    description: "",
    is_private: false,
    invite_only: false,
    category: "",
    tags: ""
  });

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    channel.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await createChannel({
      ...newChannel,
      tags: newChannel.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    });

    if (result.data) {
      setCreateDialogOpen(false);
      setNewChannel({
        name: "",
        description: "",
        is_private: false,
        invite_only: false,
        category: "",
        tags: ""
      });
    }
  };

  const getPrivacyBadge = (channel: any) => {
    if (channel.invite_only) {
      return (
        <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
          <User className="h-3 w-3 mr-1" />
          Invite Only
        </Badge>
      );
    }
    
    if (channel.is_private) {
      return (
        <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
          <Lock className="h-3 w-3 mr-1" />
          Private
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
        <Globe className="h-3 w-3 mr-1" />
        Public
      </Badge>
    );
  };

  const ChannelCard = ({ channel, isMember = false }: { channel: any; isMember?: boolean }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
          {channel.name.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg truncate">{channel.name}</h3>
            {getPrivacyBadge(channel)}
          </div>
          
          {channel.description && (
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {channel.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {channel.member_count}
              </div>
              {channel.category && (
                <Badge variant="secondary" className="text-xs">
                  {channel.category}
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              {isMember ? (
                <>
                  <Link to={`/channels/${channel.id}`}>
                    <Button size="sm">
                      <Hash className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => leaveChannel(channel.id)}
                  >
                    Leave
                  </Button>
                </>
              ) : (
                <Button 
                  size="sm"
                  onClick={() => joinChannel(channel.id)}
                >
                  Join
                </Button>
              )}
            </div>
          </div>
          
          {channel.tags && channel.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {channel.tags.slice(0, 3).map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {channel.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{channel.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-7.5rem)] md:h-[calc(100vh-3.5rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading channels...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Channels</h1>
            <p className="text-muted-foreground">Discover and join communities</p>
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Channel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Channel</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateChannel} className="space-y-4">
                <div>
                  <Label htmlFor="name">Channel Name</Label>
                  <Input
                    id="name"
                    value={newChannel.name}
                    onChange={(e) => setNewChannel(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter channel name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newChannel.description}
                    onChange={(e) => setNewChannel(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your channel"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={newChannel.category}
                    onChange={(e) => setNewChannel(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., Technology, Sports, Art"
                  />
                </div>
                
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={newChannel.tags}
                    onChange={(e) => setNewChannel(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="e.g., programming, react, javascript"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="private"
                    checked={newChannel.is_private}
                    onCheckedChange={(checked) => setNewChannel(prev => ({ ...prev, is_private: checked }))}
                  />
                  <Label htmlFor="private">Private Channel</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="invite-only"
                    checked={newChannel.invite_only}
                    onCheckedChange={(checked) => setNewChannel(prev => ({ ...prev, invite_only: checked }))}
                  />
                  <Label htmlFor="invite-only">Invite Only</Label>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">Create Channel</Button>
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search channels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="discover" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="my-channels">My Channels ({myChannels.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="discover">
            <div className="grid gap-4">
              {filteredChannels.length > 0 ? (
                filteredChannels.map((channel) => (
                  <ChannelCard key={channel.id} channel={channel} />
                ))
              ) : (
                <div className="text-center py-12">
                  <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No channels found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? "Try adjusting your search" : "Be the first to create a channel"}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="my-channels">
            <div className="grid gap-4">
              {myChannels.length > 0 ? (
                myChannels.map((channel) => (
                  <ChannelCard key={channel.id} channel={channel} isMember={true} />
                ))
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No channels joined</h3>
                  <p className="text-muted-foreground">
                    Join some channels to get started
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Mobile bottom padding */}
      <div className="md:hidden h-16"></div>
    </MainLayout>
  );
}

export default function Channels() {
  return (
    <ProtectedRoute>
      <ChannelsContent />
    </ProtectedRoute>
  );
}
