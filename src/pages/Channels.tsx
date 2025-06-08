
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Search, Plus, Hash, Lock, Globe } from 'lucide-react';
import { useChannels } from '@/hooks/useChannels';
import { GroupCreation } from '@/components/groups/GroupCreation';

const Channels = () => {
  const { channels, myChannels, loading, joinChannel, leaveChannel } = useChannels();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    channel.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleJoinChannel = async (channelId: string) => {
    await joinChannel(channelId);
  };

  const handleLeaveChannel = async (channelId: string) => {
    await leaveChannel(channelId);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">Loading channels...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Channels</h1>
          <p className="text-gray-600">Discover and join conversations</p>
        </div>
        <GroupCreation />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search channels..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="my-channels">My Channels ({myChannels.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChannels.map((channel) => (
              <Card key={channel.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {channel.is_private ? (
                        <Lock className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Globe className="w-4 h-4 text-green-500" />
                      )}
                      <CardTitle className="text-lg">{channel.name}</CardTitle>
                    </div>
                  </div>
                  {channel.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{channel.description}</p>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{channel.member_count} members</span>
                    </div>
                    
                    {channel.tags && channel.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {channel.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
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

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {channel.owner?.name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-sm text-gray-600">{channel.owner?.name || 'Unknown'}</span>
                      </div>
                      
                      <Button 
                        size="sm" 
                        onClick={() => handleJoinChannel(channel.id)}
                        disabled={channel.invite_only}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        {channel.invite_only ? 'Invite Only' : 'Join'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredChannels.length === 0 && (
            <div className="text-center py-12">
              <Hash className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No channels found</h3>
              <p className="text-gray-600">Try adjusting your search or create a new channel</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-channels" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myChannels.map((channel) => (
              <Card key={channel.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {channel.is_private ? (
                        <Lock className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Globe className="w-4 h-4 text-green-500" />
                      )}
                      <CardTitle className="text-lg">{channel.name}</CardTitle>
                    </div>
                    <Badge variant={channel.user_role === 'admin' ? 'default' : 'secondary'}>
                      {channel.user_role}
                    </Badge>
                  </div>
                  {channel.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{channel.description}</p>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{channel.member_count} members</span>
                    </div>
                    
                    {channel.tags && channel.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {channel.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
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

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        View
                      </Button>
                      {channel.user_role !== 'admin' && (
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleLeaveChannel(channel.id)}
                        >
                          Leave
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {myChannels.length === 0 && (
            <div className="text-center py-12">
              <Hash className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No channels joined</h3>
              <p className="text-gray-600 mb-4">Join channels to start conversations</p>
              <Button onClick={() => setSearchTerm('')}>
                <Plus className="w-4 h-4 mr-2" />
                Discover Channels
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Channels;
