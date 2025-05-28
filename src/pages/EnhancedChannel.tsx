
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { useChannelManagement } from "@/hooks/useChannelManagement";
import { CHANNELS } from "@/data/mock-data";
import { Channel as ChannelType } from "@/types";
import { 
  ArrowLeft, 
  Hash, 
  Users, 
  Settings, 
  ChevronRight, 
  Send, 
  Paperclip, 
  Smile,
  Phone,
  Video,
  Bell,
  Search,
  Home,
  Calendar,
  AlertTriangle,
  Mic,
  MicOff,
  VideoOff,
  Camera,
  Share2,
  Pin,
  MoreVertical,
  Reply,
  ThumbsUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "@/components/ui/chat-message";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

export default function EnhancedChannel() {
  const { id: channelId } = useParams();
  const [channel, setChannel] = useState<ChannelType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState<any[]>([]);
  const [activeSubChannel, setActiveSubChannel] = useState("general");
  const [isTextChannelsOpen, setIsTextChannelsOpen] = useState(true);
  const [isVoiceChannelsOpen, setIsVoiceChannelsOpen] = useState(true);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isChannelJoined, joinChannel, leaveChannel } = useChannelManagement();
  
  const [userChannels, setUserChannels] = useState<ChannelType[]>([]);
  const [voiceParticipants, setVoiceParticipants] = useState([
    { id: '1', name: 'Alice Johnson', avatar: '/placeholder.svg', isMuted: false, isSpeaking: true },
    { id: '2', name: 'Bob Wilson', avatar: '/placeholder.svg', isMuted: true, isSpeaking: false },
    { id: '3', name: 'Charlie Brown', avatar: '/placeholder.svg', isMuted: false, isSpeaking: false }
  ]);
  
  const [subChannels] = useState([
    { id: 'general', name: 'general', type: 'text' as const, emoji: '💬' },
    { id: 'announcements', name: 'announcements', type: 'text' as const, emoji: '📢' },
    { id: 'resources', name: 'resources', type: 'text' as const, emoji: '📚' },
    { id: 'general-voice', name: 'General Voice', type: 'voice' as const, emoji: '🎤' },
    { id: 'music', name: 'Music Room', type: 'voice' as const, emoji: '🎵' }
  ]);

  const navigationItems = [
    { id: 'home', name: 'Home', icon: Home, route: '/' },
    { id: 'events', name: 'Volunteering Events', icon: Calendar, route: '/events' },
    { id: 'issues', name: 'Reported Issues', icon: AlertTriangle, route: '/issues' },
    { id: 'settings', name: 'Settings', icon: Settings, route: '/settings' }
  ];

  useEffect(() => {
    const loadChannel = async () => {
      if (!channelId) {
        setError("No channel ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Try to find channel in mock data first
        let foundChannel = CHANNELS.find(c => c.id === channelId);
        
        // If not found, try user created channels
        if (!foundChannel) {
          const userChannelsString = localStorage.getItem('userChannels');
          const storedUserChannels = userChannelsString ? JSON.parse(userChannelsString) : [];
          foundChannel = storedUserChannels.find((c: ChannelType) => c.id === channelId);
        }
        
        if (foundChannel) {
          setChannel(foundChannel);
          
          // Load all channels for sidebar
          const userChannelsString = localStorage.getItem('userChannels');
          const storedUserChannels = userChannelsString ? JSON.parse(userChannelsString) : [];
          setUserChannels([...CHANNELS, ...storedUserChannels]);
          
          // Load messages for this channel
          const channelMessagesKey = `channel_messages_${channelId}`;
          const storedMessages = localStorage.getItem(channelMessagesKey);
          if (storedMessages) {
            try {
              setMessages(JSON.parse(storedMessages));
            } catch (error) {
              console.error("Failed to parse stored messages", error);
              setMessages([]);
            }
          } else {
            // Add some default welcome messages
            const welcomeMessages = [
              {
                id: 'welcome-1',
                content: `Welcome to ${foundChannel.name}! 🎉`,
                timestamp: new Date(Date.now() - 3600000),
                sender: {
                  id: 'system',
                  name: 'System',
                  avatar: '/placeholder.svg'
                },
                isCurrentUser: false,
                subChannelId: 'general'
              }
            ];
            setMessages(welcomeMessages);
          }
          
          // Load pinned messages
          const pinnedKey = `pinned_messages_${channelId}`;
          const storedPinned = localStorage.getItem(pinnedKey);
          if (storedPinned) {
            try {
              setPinnedMessages(JSON.parse(storedPinned));
            } catch (error) {
              console.error("Failed to parse pinned messages", error);
            }
          }
        } else {
          setError("Channel not found");
        }
      } catch (error) {
        console.error("Error loading channel:", error);
        setError("Failed to load channel");
      } finally {
        setLoading(false);
      }
    };

    loadChannel();
  }, [channelId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !channel) return;
    
    const currentUserString = localStorage.getItem("user");
    const currentUser = currentUserString ? JSON.parse(currentUserString) : {
      id: "user-1",
      name: "You",
      avatar: "/placeholder.svg"
    };
    
    const newMsg = {
      id: `msg-${Date.now()}`,
      content: newMessage,
      timestamp: new Date(),
      sender: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar || "/placeholder.svg",
      },
      isCurrentUser: true,
      subChannelId: activeSubChannel
    };
    
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    
    const channelMessagesKey = `channel_messages_${channelId}`;
    localStorage.setItem(channelMessagesKey, JSON.stringify(updatedMessages));
    
    setNewMessage("");
  };

  const handleJoinChannel = () => {
    if (channelId) {
      joinChannel(channelId);
      toast({
        title: "Joined channel",
        description: `You've successfully joined ${channel?.name}`,
      });
    }
  };

  const handleLeaveChannel = () => {
    if (channelId) {
      leaveChannel(channelId);
      toast({
        title: "Left channel",
        description: `You've left ${channel?.name}`,
      });
    }
  };

  const filteredMessages = messages.filter(msg => 
    !msg.subChannelId || msg.subChannelId === activeSubChannel
  );

  const isJoined = channelId ? isChannelJoined(channelId) : false;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg">Loading channel...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !channel) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-screen">
          <h2 className="text-2xl font-bold mb-4">
            {error || "Channel not found"}
          </h2>
          <p className="mb-6 text-muted-foreground">
            {error === "Channel not found" 
              ? "The channel you're looking for doesn't exist or has been deleted."
              : "There was an error loading the channel. Please try again."
            }
          </p>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/channels')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Channels
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <div className="w-64 border-r bg-background flex flex-col">
        {/* Logo/App Name */}
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-primary">Community Hub</h2>
        </div>

        {/* Navigation Shortcuts */}
        <div className="p-3 border-b">
          <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Navigation</h3>
          <div className="space-y-1">
            {navigationItems.map(item => (
              <Button
                key={item.id}
                variant="ghost"
                className="w-full justify-start h-8 px-2"
                onClick={() => navigate(item.route)}
              >
                <item.icon className="h-4 w-4 mr-2" />
                <span className="text-sm">{item.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Channels List */}
        <ScrollArea className="flex-1">
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">My Channels</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => navigate('/channels')}
              >
                <ArrowLeft className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="space-y-1">
              {userChannels.slice(0, 8).map(ch => (
                <Button
                  key={ch.id}
                  variant="ghost"
                  className={`w-full justify-start h-auto p-2 ${
                    ch.id === channelId ? 'bg-accent text-accent-foreground' : ''
                  }`}
                  onClick={() => navigate(`/channels/${ch.id}`)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold">{ch.name[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium truncate">{ch.name}</p>
                      <p className="text-xs text-muted-foreground">{ch.members} members</p>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Sub-channels for current channel */}
          <div className="px-3">
            <Collapsible open={isTextChannelsOpen} onOpenChange={setIsTextChannelsOpen}>
              <CollapsibleTrigger className="flex w-full items-center justify-between p-1.5 text-sm hover:bg-accent rounded">
                <span className="font-medium text-muted-foreground">TEXT CHANNELS</span>
                <ChevronRight className="h-4 w-4 transition-transform duration-200" 
                  style={{ transform: isTextChannelsOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-2 space-y-0.5 pt-1">
                {subChannels.filter(sc => sc.type === 'text').map(subChannel => (
                  <div 
                    key={subChannel.id}
                    className={`group flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer ${
                      activeSubChannel === subChannel.id ? 
                      'bg-accent/50 text-accent-foreground' : 
                      'hover:bg-accent/50 hover:text-accent-foreground'
                    }`}
                    onClick={() => setActiveSubChannel(subChannel.id)}
                  >
                    <span className="text-sm">{subChannel.emoji}</span>
                    <Hash className={`h-4 w-4 ${activeSubChannel === subChannel.id ? '' : 'text-muted-foreground'}`} />
                    <span className="text-sm">{subChannel.name}</span>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={isVoiceChannelsOpen} onOpenChange={setIsVoiceChannelsOpen} className="mt-4">
              <CollapsibleTrigger className="flex w-full items-center justify-between p-1.5 text-sm hover:bg-accent rounded">
                <span className="font-medium text-muted-foreground">VOICE CHANNELS</span>
                <ChevronRight className="h-4 w-4 transition-transform duration-200" 
                  style={{ transform: isVoiceChannelsOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-2 space-y-0.5 pt-1">
                {subChannels.filter(sc => sc.type === 'voice').map(subChannel => (
                  <div key={subChannel.id} className="group flex flex-col gap-1">
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-accent/50">
                      <span className="text-sm">{subChannel.emoji}</span>
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{subChannel.name}</span>
                    </div>
                    {subChannel.id === 'general-voice' && voiceParticipants.length > 0 && (
                      <div className="ml-6 space-y-1">
                        {voiceParticipants.map(participant => (
                          <div key={participant.id} className="flex items-center gap-2 px-2 py-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={participant.avatar} />
                              <AvatarFallback className="text-xs">{participant.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs">{participant.name}</span>
                            {participant.isMuted && <MicOff className="h-3 w-3 text-muted-foreground" />}
                            {participant.isSpeaking && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-16 border-b bg-background flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <h1 className="font-semibold">{channel.name}</h1>
              {channel.isPrivate && <Badge variant="outline">Private</Badge>}
              {!isJoined && <Badge variant="destructive">Not Joined</Badge>}
            </div>
            {activeSubChannel !== 'general' && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm text-muted-foreground">
                  {subChannels.find(sc => sc.id === activeSubChannel)?.name}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-9"
              />
            </div>
            
            {!isJoined ? (
              <Button onClick={handleJoinChannel} variant="default">
                Join Channel
              </Button>
            ) : (
              <Button onClick={handleLeaveChannel} variant="outline">
                Leave Channel
              </Button>
            )}
            
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Channel Content */}
        {!isJoined ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <Hash className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Join {channel.name}</h2>
              <p className="text-muted-foreground mb-6">
                You need to join this channel to view messages and participate in discussions.
              </p>
              <Button onClick={handleJoinChannel} size="lg">
                Join Channel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex">
            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {filteredMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Hash className="h-12 w-12 mb-2 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Welcome to #{activeSubChannel}!</h3>
                    <p className="text-muted-foreground max-w-sm mt-2">
                      This is the beginning of the {activeSubChannel} channel. Start the conversation!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredMessages.map((message) => (
                      <div key={message.id} className="group relative">
                        <ChatMessage message={message} />
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Chat Input */}
              <div className="border-t p-4">
                <div className="flex items-end gap-2">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  
                  <Textarea
                    placeholder={`Message #${subChannels.find(sc => sc.id === activeSubChannel)?.name || activeSubChannel}`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[40px] max-h-32 resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  
                  <Button variant="ghost" size="icon">
                    <Smile className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!newMessage.trim()}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Members */}
            <div className="w-80 border-l bg-background p-4">
              <Tabs defaultValue="members" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="members">Members</TabsTrigger>
                  <TabsTrigger value="info">Info</TabsTrigger>
                </TabsList>
                
                <TabsContent value="members" className="mt-4">
                  <h3 className="font-medium mb-3">Members ({channel.members})</h3>
                  <div className="space-y-2">
                    {Array.from({ length: Math.min(10, channel.members) }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>U{i+1}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">User {i+1}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="info" className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">About</h3>
                      <p className="text-sm text-muted-foreground">{channel.description}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-1">
                        {channel.tags?.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
