
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChatInput } from "@/components/ui/chat-input";
import { ChatMessage } from "@/components/ui/chat-message";
import { useChannelManagement } from "@/hooks/useChannelManagement";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CHANNELS } from "@/data/mock-data";
import { Channel } from "@/types";
import { 
  Users, 
  Hash, 
  Bell, 
  Settings, 
  UserPlus, 
  Volume2,
  VolumeX,
  Heart,
  MessageSquare,
  Share2
} from "lucide-react";

export default function EnhancedChannel() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const { joinChannel, leaveChannel, isChannelJoined } = useChannelManagement();
  
  const [channel, setChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadChannel = async () => {
      setIsLoading(true);
      
      try {
        // Load from mock data first
        const mockChannel = CHANNELS.find(c => c.id === id);
        
        // Load from user created channels
        const userChannelsString = localStorage.getItem("userChannels");
        const userChannels = userChannelsString ? JSON.parse(userChannelsString) : [];
        const userChannel = userChannels.find((c: Channel) => c.id === id);
        
        const foundChannel = mockChannel || userChannel;
        
        if (foundChannel) {
          setChannel(foundChannel);
          setHasJoined(isChannelJoined(id));
          
          // Load messages for this channel
          const storedMessages = JSON.parse(localStorage.getItem(`channel_messages_${id}`) || "[]");
          setMessages(storedMessages);
        } else {
          toast({
            title: "Channel not found",
            description: "The channel you're looking for doesn't exist.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error loading channel:", error);
        toast({
          title: "Error loading channel",
          description: "Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadChannel();
  }, [id, isChannelJoined, toast]);

  const handleJoinChannel = async () => {
    if (!channel) return;
    
    try {
      joinChannel(channel.id);
      setHasJoined(true);
      toast({
        title: "Joined channel",
        description: `Welcome to ${channel.name}!`,
      });
    } catch (error) {
      toast({
        title: "Failed to join",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const handleLeaveChannel = async () => {
    if (!channel) return;
    
    try {
      leaveChannel(channel.id);
      setHasJoined(false);
      toast({
        title: "Left channel",
        description: `You've left ${channel.name}`,
      });
    } catch (error) {
      toast({
        title: "Failed to leave",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const handleMessageSent = () => {
    // Reload messages after sending
    const storedMessages = JSON.parse(localStorage.getItem(`channel_messages_${id}`) || "[]");
    setMessages(storedMessages);
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

  const getPrivacyBadge = () => {
    if (channel.inviteOnly) {
      return <Badge variant="outline" className="bg-amber-100 text-amber-800">Invite Only</Badge>;
    }
    if (channel.isPrivate) {
      return <Badge variant="outline" className="bg-blue-100 text-blue-800">Private</Badge>;
    }
    return <Badge variant="outline" className="bg-green-100 text-green-800">Public</Badge>;
  };

  return (
    <MainLayout>
      <div className="h-[calc(100vh-7.5rem)] md:h-[calc(100vh-3.5rem)] flex flex-col">
        {/* Enhanced page header */}
        <PageHeader
          title={`# ${channel.name}`}
          subtitle={channel.description}
          showBack={true}
          fallbackRoute="/channels"
          actions={
            <div className="flex items-center gap-2">
              {getPrivacyBadge()}
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-1" />
                {channel.members}
              </div>
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          }
        />

        {!hasJoined ? (
          // Join channel prompt
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <Hash className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-2">Welcome to #{channel.name}</h2>
              <p className="text-muted-foreground mb-6">{channel.description}</p>
              <div className="flex items-center justify-center gap-4 mb-6">
                {getPrivacyBadge()}
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-1" />
                  {channel.members} members
                </div>
              </div>
              <Button onClick={handleJoinChannel} className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Join Channel
              </Button>
            </div>
          </div>
        ) : (
          // Channel content
          <div className="flex-1 flex flex-col">
            {/* Channel toolbar */}
            <div className="border-b p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleLeaveChannel}>
                  Leave Channel
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Heart className="h-4 w-4 mr-1" />
                  {Math.floor(Math.random() * 50) + 10}
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  {messages.length}
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                        name: message.sender_id === user?.id ? "You" : "User",
                        avatar: "/placeholder.svg"
                      },
                      isCurrentUser: message.sender_id === user?.id
                    }}
                  />
                ))
              ) : (
                <div className="text-center py-10">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No messages yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Be the first to start the conversation!
                  </p>
                </div>
              )}
            </div>

            {/* Message input */}
            <div className="border-t p-4">
              <ChatInput 
                conversationId={`channel_${id}`}
                userId={user?.id || "anonymous"}
                onMessageSent={handleMessageSent}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Add padding at the bottom to account for mobile navigation */}
      <div className="md:hidden h-16"></div>
    </MainLayout>
  );
}
