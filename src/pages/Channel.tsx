
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
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
  User,
  UserPlus,
  Crown,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "@/components/ui/chat-message";

export default function Channel() {
  const { channelId } = useParams();
  const [channel, setChannel] = useState<ChannelType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");
  const [isTextChannelsOpen, setIsTextChannelsOpen] = useState(true);
  const [isVoiceChannelsOpen, setIsVoiceChannelsOpen] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    if (!channelId) return;
    
    // Find the channel in mock data or localStorage
    const mockChannel = CHANNELS.find(c => c.id === channelId);
    
    // Check localStorage for user-created channels
    const userChannelsString = localStorage.getItem('userChannels');
    const userChannels = userChannelsString ? JSON.parse(userChannelsString) : [];
    const userChannel = userChannels.find((c: ChannelType) => c.id === channelId);
    
    if (mockChannel || userChannel) {
      setChannel(mockChannel || userChannel);
      
      // Try to load messages for this channel
      const channelMessagesKey = `channel_messages_${channelId}`;
      const storedMessages = localStorage.getItem(channelMessagesKey);
      if (storedMessages) {
        try {
          const parsedMessages = JSON.parse(storedMessages);
          setMessages(parsedMessages);
        } catch (error) {
          console.error("Failed to parse stored messages", error);
          // Initialize with mock messages
          setMessages([]);
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
      isCurrentUser: true
    };
    
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    
    // Store messages in localStorage
    const channelMessagesKey = `channel_messages_${channelId}`;
    localStorage.setItem(channelMessagesKey, JSON.stringify(updatedMessages));
    
    setNewMessage("");
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
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
    <MainLayout>
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Channel sidebar */}
        <div className="w-60 border-r bg-background flex flex-col">
          <div className="p-3 border-b">
            <h3 className="font-semibold truncate">{channel.name}</h3>
          </div>
          
          {/* Sub-channels */}
          <div className="flex-1 overflow-y-auto">
            <Collapsible 
              open={isTextChannelsOpen} 
              onOpenChange={setIsTextChannelsOpen}
              className="px-2 py-1"
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between p-1.5 text-sm hover:bg-accent rounded">
                <span className="font-medium text-muted-foreground">TEXT CHANNELS</span>
                <ChevronRight className="h-4 w-4 transition-transform duration-200" 
                  style={{ transform: isTextChannelsOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-2 space-y-0.5 pt-1">
                <div className="group flex items-center gap-2 px-2 py-1.5 rounded bg-accent/50 text-accent-foreground">
                  <Hash className="h-4 w-4" />
                  <span className="text-sm font-medium">general</span>
                </div>
                <div className="group flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent/50 hover:text-accent-foreground">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">announcements</span>
                </div>
                <div className="group flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent/50 hover:text-accent-foreground">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">welcome</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1 opacity-70 hover:opacity-100 cursor-pointer">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="text-xs">Add Channel</span>
                </div>
              </CollapsibleContent>
            </Collapsible>
            
            <Collapsible 
              open={isVoiceChannelsOpen} 
              onOpenChange={setIsVoiceChannelsOpen}
              className="px-2 py-1"
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between p-1.5 text-sm hover:bg-accent rounded">
                <span className="font-medium text-muted-foreground">VOICE CHANNELS</span>
                <ChevronRight className="h-4 w-4 transition-transform duration-200" 
                  style={{ transform: isVoiceChannelsOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-2 space-y-0.5 pt-1">
                <div className="group flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent/50 hover:text-accent-foreground">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">General Voice</span>
                </div>
                <div className="group flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent/50 hover:text-accent-foreground">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Music</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1 opacity-70 hover:opacity-100 cursor-pointer">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="text-xs">Add Voice Channel</span>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
          
          {/* Channel settings */}
          <div className="p-2 border-t mt-auto">
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Channel Settings
            </Button>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {/* Channel header */}
          <div className="flex justify-between items-center px-4 py-2 border-b">
            <div className="flex items-center">
              <Hash className="h-5 w-5 mr-2 text-muted-foreground" />
              <h2 className="font-semibold">{channel.name}</h2>
              {channel.isPrivate && (
                <Badge variant="outline" className="ml-2">Private</Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <UserPlus className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Tabs for different sections */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="px-2 border-b">
              <TabsList className="grid w-full max-w-md grid-cols-4 h-10">
                <TabsTrigger value="chat" className="text-xs sm:text-sm">
                  <MessageSquare className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Chat</span>
                </TabsTrigger>
                <TabsTrigger value="voice" className="text-xs sm:text-sm">
                  <Phone className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Voice</span>
                </TabsTrigger>
                <TabsTrigger value="members" className="text-xs sm:text-sm">
                  <Users className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Members</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-xs sm:text-sm">
                  <Settings className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Chat tab */}
            <TabsContent value="chat" className="flex-1 flex flex-col px-0 py-0">
              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Hash className="h-12 w-12 mb-2 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Welcome to #{channel.name}!</h3>
                    <p className="text-muted-foreground max-w-sm mt-2">
                      This is the beginning of the {channel.name} channel. 
                      Start the conversation by sending a message.
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))
                )}
              </div>
              
              {/* Message input */}
              <div className="p-3 border-t">
                <div className="flex items-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="flex-shrink-0" 
                    aria-label="Attach file"
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message #${channel.name}`}
                    className="min-h-[2.5rem] resize-none"
                  />
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="flex-shrink-0" 
                    aria-label="Add emoji"
                  >
                    <Smile className="h-5 w-5" />
                  </Button>
                  
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={newMessage.trim() === ""}
                    size="icon"
                    className="flex-shrink-0"
                    aria-label="Send message"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            {/* Voice tab */}
            <TabsContent value="voice" className="flex-1 p-4">
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="bg-muted p-6 rounded-full mb-4">
                  <Phone className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">Voice Chat</h3>
                <p className="text-muted-foreground max-w-sm mt-2">
                  Start a voice conversation with other channel members.
                </p>
                <Button className="mt-4">
                  Join Voice Channel
                </Button>
              </div>
            </TabsContent>
            
            {/* Members tab */}
            <TabsContent value="members" className="flex-1 p-4">
              <h3 className="font-medium mb-4">Channel Members</h3>
              
              <div className="space-y-5">
                <div className="space-y-1">
                  <h4 className="text-xs text-muted-foreground font-medium ml-2">ADMINS - 1</h4>
                  <div className="flex items-center p-2 hover:bg-muted rounded-md">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src="/placeholder.svg" alt="Admin" />
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center">
                      <span className="font-medium">
                        {channel.ownerId === "user-1" ? "You" : "Admin"}
                      </span>
                      <Crown className="h-3.5 w-3.5 text-amber-500 ml-1.5" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-xs text-muted-foreground font-medium ml-2">MODERATORS - 2</h4>
                  <div className="flex items-center p-2 hover:bg-muted rounded-md">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src="/placeholder.svg" alt="Mod" />
                      <AvatarFallback>M</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center">
                      <span>Moderator</span>
                      <Shield className="h-3.5 w-3.5 text-blue-500 ml-1.5" />
                    </div>
                  </div>
                  <div className="flex items-center p-2 hover:bg-muted rounded-md">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src="/placeholder.svg" alt="Mod" />
                      <AvatarFallback>M2</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center">
                      <span>Moderator 2</span>
                      <Shield className="h-3.5 w-3.5 text-blue-500 ml-1.5" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-xs text-muted-foreground font-medium ml-2">MEMBERS - {channel.members - 3}</h4>
                  {Array.from({ length: Math.max(0, channel.members - 3) }).map((_, i) => (
                    <div key={i} className="flex items-center p-2 hover:bg-muted rounded-md">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src="/placeholder.svg" alt={`Member ${i+1}`} />
                        <AvatarFallback>M{i+1}</AvatarFallback>
                      </Avatar>
                      <span>Member {i+1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            {/* Settings tab */}
            <TabsContent value="settings" className="flex-1 p-4">
              <h3 className="font-medium mb-4">Channel Settings</h3>
              
              <div className="space-y-4 max-w-lg">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Channel Name</label>
                  <Input value={channel.name} readOnly={channel.ownerId !== "user-1"} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input value={channel.description} readOnly={channel.ownerId !== "user-1"} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Visibility</label>
                  <div className="flex items-center space-x-2 text-sm">
                    <Badge variant={channel.isPrivate ? "outline" : "default"}>
                      {channel.isPrivate ? "Private" : "Public"}
                    </Badge>
                  </div>
                </div>
                
                <div className="pt-4">
                  <h4 className="text-sm font-medium mb-2">Invite Link</h4>
                  <div className="flex space-x-2">
                    <Input value={`https://app.com/invite/${channel.id}`} readOnly />
                    <Button variant="outline">Copy</Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Share this link to invite people to your channel
                  </p>
                </div>
                
                <Separator className="my-4" />
                
                {channel.ownerId === "user-1" && (
                  <div className="pt-4">
                    <Button variant="destructive">Delete Channel</Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
