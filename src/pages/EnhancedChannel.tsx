import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChatInput } from "@/components/ui/chat-input";
import { ChatMessage } from "@/components/ui/chat-message";
import { BackNavigation } from "@/components/ui/back-navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useChannels } from "@/hooks/useChannels";
import { useRealTimeMessages } from "@/hooks/useRealTimeMessages";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Hash, 
  Bell, 
  Settings, 
  UserPlus, 
  Volume2,
  VolumeX,
  Share2,
  Search,
  MoreVertical,
  Home,
  ChevronDown,
  Crown,
  Shield
} from "lucide-react";

export default function EnhancedChannel() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const { myChannels, joinChannel, leaveChannel } = useChannels();
  const { messages, loading: messagesLoading, sendMessage } = useRealTimeMessages(`channel_${id}`);
  
  const [channel, setChannel] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [onlineMembers, setOnlineMembers] = useState(0);
  const [showMemberList, setShowMemberList] = useState(true);
  const [showChannelList, setShowChannelList] = useState(true);

  useEffect(() => {
    if (id) {
      loadChannel();
      loadMembers();
    }
  }, [id, user]);

  useEffect(() => {
    if (channel && user) {
      const userChannel = myChannels.find(c => c.id === channel.id);
      setHasJoined(!!userChannel);
    }
  }, [channel, myChannels, user]);

  const loadChannel = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('channels')
        .select(`
          *,
          owner:profiles!channels_owner_id_fkey (
            id,
            name,
            avatar
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error loading channel:', error);
        toast({
          title: "Channel not found",
          description: "The channel you're looking for doesn't exist.",
          variant: "destructive"
        });
        return;
      }

      setChannel(data);
    } catch (error) {
      console.error('Error loading channel:', error);
      toast({
        title: "Error loading channel",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMembers = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('channel_members')
        .select(`
          role,
          joined_at,
          user:profiles!channel_members_user_id_fkey (
            id,
            name,
            avatar
          )
        `)
        .eq('channel_id', id);

      if (error) {
        console.error('Error loading members:', error);
        return;
      }

      setMembers(data || []);
      setOnlineMembers(Math.floor((data?.length || 0) * 0.6)); // Mock online status
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const handleJoinChannel = async () => {
    if (!channel) return;
    
    const result = await joinChannel(channel.id);
    if (result.success) {
      setHasJoined(true);
      await loadMembers(); // Refresh member list
    }
  };

  const handleLeaveChannel = async () => {
    if (!channel) return;
    
    const result = await leaveChannel(channel.id);
    if (result.success) {
      setHasJoined(false);
      await loadMembers(); // Refresh member list
    }
  };

  const handleMessageSent = async (content: string) => {
    if (!user || !id) return;

    // Send message to channel
    const result = await sendMessage(content, 'text');
    if (result.error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const getPrivacyBadge = () => {
    if (!channel) return null;
    
    if (channel.invite_only) {
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Invite Only</Badge>;
    }
    if (channel.is_private) {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Private</Badge>;
    }
    return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Public</Badge>;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case 'moderator':
        return <Shield className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-7.5rem)] md:h-[calc(100vh-3.5rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading channel...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!channel) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-7.5rem)] md:h-[calc(100vh-3.5rem)]">
          <div className="text-center">
            <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Channel not found</h2>
            <p className="text-muted-foreground">The channel you're looking for doesn't exist.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="h-[calc(100vh-7.5rem)] md:h-[calc(100vh-3.5rem)] flex bg-gray-50 dark:bg-gray-900">
        {/* Left Sidebar - Navigation */}
        <div className="w-16 bg-gray-900 flex flex-col items-center py-3 space-y-2">
          <BackNavigation customBackPath="/channels" showHome={false} />
          <Button variant="ghost" size="icon" className="h-12 w-12 text-gray-400 hover:text-white hover:bg-gray-700 rounded-xl">
            <Home className="h-5 w-5" />
          </Button>
        </div>

        {/* Channel List Sidebar */}
        <div className={`${showChannelList ? 'w-60' : 'w-0'} transition-all duration-300 bg-gray-800 text-white overflow-hidden`}>
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Channels</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-gray-400 hover:text-white"
                onClick={() => setShowChannelList(!showChannelList)}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="p-2">
            <div className="mb-2">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 mb-1">
                Your Channels
              </h4>
              <div className="space-y-1">
                <div className="flex items-center px-2 py-1 rounded bg-gray-700 text-white">
                  <Hash className="h-4 w-4 mr-2" />
                  <span className="text-sm">{channel.name}</span>
                </div>
                {myChannels.filter(c => c.id !== channel.id).slice(0, 5).map((ch) => (
                  <div key={ch.id} className="flex items-center px-2 py-1 rounded text-gray-400 hover:bg-gray-700 hover:text-gray-200 cursor-pointer">
                    <Hash className="h-4 w-4 mr-2" />
                    <span className="text-sm">{ch.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
          {/* Channel Header */}
          <div className="border-b bg-background/95 backdrop-blur">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <Hash className="h-5 w-5 text-muted-foreground" />
                <h1 className="text-lg font-semibold">{channel.name}</h1>
                {getPrivacyBadge()}
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-1" />
                  {channel.member_count} members
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Search className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setShowMemberList(!showMemberList)}
                >
                  <Users className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Channel description */}
            {channel.description && (
              <div className="px-4 pb-2">
                <p className="text-sm text-muted-foreground">{channel.description}</p>
              </div>
            )}
          </div>

          {!hasJoined ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <Hash className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                <h2 className="text-2xl font-bold mb-2">Welcome to #{channel.name}</h2>
                <p className="text-muted-foreground mb-6">
                  {channel.description || "Join this channel to start participating in the conversation."}
                </p>
                <div className="flex items-center justify-center gap-4 mb-6">
                  {getPrivacyBadge()}
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-1" />
                    {channel.member_count} members
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    {onlineMembers} online
                  </div>
                </div>
                <Button onClick={handleJoinChannel} className="w-full bg-green-600 hover:bg-green-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Join Channel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex">
              {/* Messages Area */}
              <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
                  {messages.length > 0 ? (
                    messages.map((message, index) => (
                      <ChatMessage 
                        key={message.id || index}
                        message={{
                          id: message.id || `msg-${index}`,
                          content: message.content,
                          timestamp: new Date(message.created_at || Date.now()),
                          sender: {
                            id: message.sender_id || "user",
                            name: message.sender?.name || "User",
                            avatar: message.sender?.avatar || "/placeholder.svg"
                          },
                          isCurrentUser: message.sender_id === user?.id
                        }}
                      />
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">No messages yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Be the first to start the conversation!
                      </p>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="border-t bg-background p-4">
                  <ChatInput 
                    conversationId={`channel_${id}`}
                    userId={user?.id || "anonymous"}
                    onMessageSent={() => {}} // Messages are handled by real-time subscription
                  />
                </div>
              </div>

              {/* Member List (Right Panel) */}
              {showMemberList && (
                <div className="w-60 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                      Members — {channel.member_count}
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Online Members */}
                      <div>
                        <h4 className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                          Online — {onlineMembers}
                        </h4>
                        <div className="space-y-2">
                          {members.slice(0, onlineMembers).map((member) => (
                            <div key={member.user.id} className="flex items-center gap-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                              <div className="relative">
                                <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                                  {member.user.name?.[0] || 'U'}
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                              </div>
                              <div className="flex items-center gap-1 flex-1 min-w-0">
                                {getRoleIcon(member.role)}
                                <span className="text-sm text-gray-900 dark:text-white truncate">{member.user.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Offline Members */}
                      {members.length > onlineMembers && (
                        <div>
                          <h4 className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                            Offline — {members.length - onlineMembers}
                          </h4>
                          <div className="space-y-2">
                            {members.slice(onlineMembers).map((member) => (
                              <div key={member.user.id} className="flex items-center gap-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                                <div className="relative">
                                  <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium opacity-60">
                                    {member.user.name?.[0] || 'U'}
                                  </div>
                                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gray-400 border-2 border-white rounded-full"></div>
                                </div>
                                <div className="flex items-center gap-1 flex-1 min-w-0">
                                  {getRoleIcon(member.role)}
                                  <span className="text-sm text-gray-500 truncate">{member.user.name}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="md:hidden h-16"></div>
    </MainLayout>
  );
}
