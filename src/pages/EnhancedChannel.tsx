
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CHANNELS } from "@/data/mock-data";
import { Channel as ChannelType } from "@/types";
import { 
  ArrowLeft, 
  Hash, 
  Users, 
  Settings, 
  PlusCircle, 
  ChevronRight, 
  Send, 
  Paperclip, 
  Smile,
  MessageSquare,
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
  ThumbsUp,
  Heart,
  Laugh,
  Reply,
  Archive,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "@/components/ui/chat-message";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function EnhancedChannel() {
  const { id: channelId } = useParams();
  const [channel, setChannel] = useState<ChannelType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");
  const [isTextChannelsOpen, setIsTextChannelsOpen] = useState(true);
  const [isVoiceChannelsOpen, setIsVoiceChannelsOpen] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState<any[]>([]);
  const [sharedMedia, setSharedMedia] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [activeSubChannel, setActiveSubChannel] = useState("general");
  
  const [isAddChannelDialogOpen, setIsAddChannelDialogOpen] = useState(false);
  const [newSubchannelName, setNewSubchannelName] = useState("");
  
  const [userChannels, setUserChannels] = useState<ChannelType[]>([]);
  const [voiceParticipants, setVoiceParticipants] = useState([
    { id: '1', name: 'Alice Johnson', avatar: '/placeholder.svg', isMuted: false, isSpeaking: true },
    { id: '2', name: 'Bob Wilson', avatar: '/placeholder.svg', isMuted: true, isSpeaking: false },
    { id: '3', name: 'Charlie Brown', avatar: '/placeholder.svg', isMuted: false, isSpeaking: false }
  ]);
  
  const [subChannels, setSubChannels] = useState<{id: string, name: string, type: 'text' | 'voice', emoji?: string}[]>([
    { id: 'general', name: 'general', type: 'text', emoji: '💬' },
    { id: 'announcements', name: 'announcements', type: 'text', emoji: '📢' },
    { id: 'resources', name: 'resources', type: 'text', emoji: '📚' },
    { id: 'general-voice', name: 'General Voice', type: 'voice', emoji: '🎤' },
    { id: 'music', name: 'Music Room', type: 'voice', emoji: '🎵' }
  ]);

  const navigationItems = [
    { id: 'home', name: 'Home', icon: Home, route: '/' },
    { id: 'events', name: 'Volunteering Events', icon: Calendar, route: '/events' },
    { id: 'issues', name: 'Reported Issues', icon: AlertTriangle, route: '/issues' },
    { id: 'settings', name: 'Settings', icon: Settings, route: '/settings' }
  ];

  useEffect(() => {
    if (!channelId) return;
    
    const mockChannel = CHANNELS.find(c => c.id === channelId);
    const userChannelsString = localStorage.getItem('userChannels');
    const storedUserChannels = userChannelsString ? JSON.parse(userChannelsString) : [];
    const userChannel = storedUserChannels.find((c: ChannelType) => c.id === channelId);
    
    if (mockChannel || userChannel) {
      setChannel(mockChannel || userChannel);
      setUserChannels([...CHANNELS, ...storedUserChannels]);
      
      // Load messages
      const channelMessagesKey = `channel_messages_${channelId}`;
      const storedMessages = localStorage.getItem(channelMessagesKey);
      if (storedMessages) {
        try {
          const parsedMessages = JSON.parse(storedMessages);
          setMessages(parsedMessages);
        } catch (error) {
          console.error("Failed to parse stored messages", error);
          setMessages([]);
        }
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
      
      // Load shared media
      const mediaKey = `shared_media_${channelId}`;
      const storedMedia = localStorage.getItem(mediaKey);
      if (storedMedia) {
        try {
          setSharedMedia(JSON.parse(storedMedia));
        } catch (error) {
          console.error("Failed to parse shared media", error);
        }
      }
    } else {
      toast({
        title: "Channel not found",
        description: "The requested channel could not be found.",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  }, [channelId, toast]);
  
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

  const handlePinMessage = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message && !pinnedMessages.find(p => p.id === messageId)) {
      const updatedPinned = [...pinnedMessages, { ...message, pinnedAt: new Date() }];
      setPinnedMessages(updatedPinned);
      const pinnedKey = `pinned_messages_${channelId}`;
      localStorage.setItem(pinnedKey, JSON.stringify(updatedPinned));
      toast({ title: "Message pinned", description: "Message has been pinned to the channel." });
    }
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
    toast({
      title: isMicOn ? "Microphone turned off" : "Microphone turned on",
      description: `Your microphone is now ${isMicOn ? 'muted' : 'unmuted'}.`
    });
  };

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
    toast({
      title: isCameraOn ? "Camera turned off" : "Camera turned on",
      description: `Your camera is now ${isCameraOn ? 'off' : 'on'}.`
    });
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    toast({
      title: isScreenSharing ? "Screen sharing stopped" : "Screen sharing started",
      description: `Screen sharing is now ${isScreenSharing ? 'off' : 'on'}.`
    });
  };

  const filteredMessages = messages.filter(msg => 
    !msg.subChannelId || msg.subChannelId === activeSubChannel
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <p>Loading channel...</p>
        </div>
      </MainLayout>
    );
  }

  if (!channel) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-screen">
          <h2 className="text-2xl font-bold mb-4">Channel not found</h2>
          <p className="mb-6 text-muted-foreground">The channel you're looking for doesn't exist or has been deleted.</p>
          <Link to="/channels">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Channels
            </Button>
          </Link>
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
                onClick={() => setIsAddChannelDialogOpen(true)}
              >
                <PlusCircle className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="space-y-1">
              {userChannels.slice(0, 8).map(ch => (
                <Link key={ch.id} to={`/channels/${ch.id}`}>
                  <div className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                    ch.id === channelId ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                  }`}>
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-semibold">{ch.name[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{ch.name}</p>
                      <p className="text-xs text-muted-foreground">{ch.members} members</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Text Channels */}
          <Collapsible 
            open={isTextChannelsOpen} 
            onOpenChange={setIsTextChannelsOpen}
            className="px-3"
          >
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

          {/* Voice Channels */}
          <Collapsible 
            open={isVoiceChannelsOpen} 
            onOpenChange={setIsVoiceChannelsOpen}
            className="px-3 mt-4"
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between p-1.5 text-sm hover:bg-accent rounded">
              <span className="font-medium text-muted-foreground">VOICE CHANNELS</span>
              <ChevronRight className="h-4 w-4 transition-transform duration-200" 
                style={{ transform: isVoiceChannelsOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-2 space-y-0.5 pt-1">
              {subChannels.filter(sc => sc.type === 'voice').map(subChannel => (
                <div 
                  key={subChannel.id}
                  className="group flex flex-col gap-1"
                >
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-accent/50">
                    <span className="text-sm">{subChannel.emoji}</span>
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{subChannel.name}</span>
                  </div>
                  {subChannel.id === 'general-voice' && (
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
            
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>YU</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Channel Content */}
        <div className="flex-1 flex">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Pinned Messages */}
            {pinnedMessages.length > 0 && (
              <div className="bg-muted/30 border-b p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Pin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Pinned Messages</span>
                </div>
                <div className="space-y-1">
                  {pinnedMessages.slice(0, 2).map(msg => (
                    <div key={msg.id} className="text-sm bg-background rounded p-2">
                      <span className="font-medium">{msg.sender.name}:</span> {msg.content}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video/Screen Share Area */}
            {(isCameraOn || isScreenSharing) && (
              <div className="bg-gray-900 p-4 border-b">
                <div className="bg-gray-800 rounded-lg aspect-video flex items-center justify-center text-white">
                  {isScreenSharing ? (
                    <div className="text-center">
                      <Share2 className="h-12 w-12 mx-auto mb-2" />
                      <p>Screen sharing active</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Camera className="h-12 w-12 mx-auto mb-2" />
                      <p>Camera active</p>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                      <ChatMessage 
                        message={message} 
                        onReply={(id) => console.log('Reply to:', id)}
                        onStar={(id) => console.log('Star:', id)}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handlePinMessage(message.id)}>
                            <Pin className="h-4 w-4 mr-2" />
                            Pin Message
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Reply className="h-4 w-4 mr-2" />
                            Reply
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            React
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Chat Input */}
            <div className="border-t p-4">
              <div className="flex items-end gap-2">
                <div className="flex gap-1">
                  <Button 
                    variant={isMicOn ? "default" : "ghost"} 
                    size="icon"
                    onClick={toggleMic}
                  >
                    {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </Button>
                  <Button 
                    variant={isCameraOn ? "default" : "ghost"} 
                    size="icon"
                    onClick={toggleCamera}
                  >
                    {isCameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </Button>
                  <Button 
                    variant={isScreenSharing ? "default" : "ghost"} 
                    size="icon"
                    onClick={toggleScreenShare}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                
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

          {/* Right Sidebar - Shared Media & Info */}
          <div className="w-80 border-l bg-background p-4">
            <Tabs defaultValue="members" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="pinned">Pinned</TabsTrigger>
              </TabsList>
              
              <TabsContent value="members" className="mt-4">
                <h3 className="font-medium mb-3">Voice Participants ({voiceParticipants.length})</h3>
                <div className="space-y-2 mb-6">
                  {voiceParticipants.map(participant => (
                    <div key={participant.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback>{participant.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{participant.name}</p>
                        <div className="flex items-center gap-1">
                          {participant.isMuted && <MicOff className="h-3 w-3 text-muted-foreground" />}
                          {participant.isSpeaking && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <h3 className="font-medium mb-3">All Members ({channel.members})</h3>
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
              
              <TabsContent value="media" className="mt-4">
                <h3 className="font-medium mb-3">Shared Media</h3>
                {sharedMedia.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No shared media yet</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {sharedMedia.map((media, i) => (
                      <div key={i} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                        <Download className="h-6 w-6 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="pinned" className="mt-4">
                <h3 className="font-medium mb-3">Pinned Messages</h3>
                {pinnedMessages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pinned messages</p>
                ) : (
                  <div className="space-y-3">
                    {pinnedMessages.map(msg => (
                      <div key={msg.id} className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={msg.sender.avatar} />
                            <AvatarFallback className="text-xs">{msg.sender.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium">{msg.sender.name}</span>
                        </div>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
