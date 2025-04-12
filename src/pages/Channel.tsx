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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

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
  const navigate = useNavigate();
  
  const [activeSubChannel, setActiveSubChannel] = useState("general");
  
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isAddChannelDialogOpen, setIsAddChannelDialogOpen] = useState(false);
  const [isAddVoiceChannelDialogOpen, setIsAddVoiceChannelDialogOpen] = useState(false);
  const [isNotificationsDialogOpen, setIsNotificationsDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  
  const [newSubchannelName, setNewSubchannelName] = useState("");
  const [subChannels, setSubChannels] = useState<{id: string, name: string, type: 'text' | 'voice'}[]>([
    { id: 'general', name: 'general', type: 'text' },
    { id: 'announcements', name: 'announcements', type: 'text' },
    { id: 'welcome', name: 'welcome', type: 'text' },
    { id: 'general-voice', name: 'General Voice', type: 'voice' },
    { id: 'music', name: 'Music', type: 'voice' }
  ]);
  
  useEffect(() => {
    if (!channelId) return;
    
    const mockChannel = CHANNELS.find(c => c.id === channelId);
    
    const userChannelsString = localStorage.getItem('userChannels');
    const userChannels = userChannelsString ? JSON.parse(userChannelsString) : [];
    const userChannel = userChannels.find((c: ChannelType) => c.id === channelId);
    
    if (mockChannel || userChannel) {
      setChannel(mockChannel || userChannel);
      
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
      
      const subChannelsKey = `subchannel_${channelId}`;
      const storedSubChannels = localStorage.getItem(subChannelsKey);
      if (storedSubChannels) {
        try {
          const parsedSubChannels = JSON.parse(storedSubChannels);
          setSubChannels(parsedSubChannels);
        } catch (error) {
          console.error("Failed to parse stored subchannels", error);
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
  
  const handleAddSubChannel = (type: 'text' | 'voice') => {
    if (!newSubchannelName.trim() || !channel) return;
    
    const newId = `${type === 'text' ? '' : 'voice-'}${newSubchannelName.toLowerCase().replace(/\s+/g, '-')}`;
    const newSubChannel = {
      id: newId,
      name: newSubchannelName,
      type: type
    };
    
    const updatedSubChannels = [...subChannels, newSubChannel];
    setSubChannels(updatedSubChannels);
    
    const subChannelsKey = `subchannel_${channelId}`;
    localStorage.setItem(subChannelsKey, JSON.stringify(updatedSubChannels));
    
    if (type === 'text') {
      setIsAddChannelDialogOpen(false);
    } else {
      setIsAddVoiceChannelDialogOpen(false);
    }
    setNewSubchannelName("");
    
    toast({
      title: `${type === 'text' ? 'Text' : 'Voice'} channel created`,
      description: `${newSubchannelName} has been added to the channel.`
    });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleSubChannelClick = (subChannelId: string, type: 'text' | 'voice') => {
    if (type === 'text') {
      setActiveSubChannel(subChannelId);
      setActiveTab("chat");
    } else {
      setActiveSubChannel(subChannelId);
      setActiveTab("voice");
    }
  };
  
  const handleCopyInviteLink = () => {
    const inviteLink = `https://app.com/invite/${channelId}`;
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Invite link copied",
      description: "The invite link has been copied to your clipboard."
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
    <MainLayout>
      <div className="flex h-[calc(100vh-3.5rem)]">
        <div className="w-60 border-r bg-background flex flex-col">
          <div className="p-3 border-b">
            <h3 className="font-semibold truncate">{channel.name}</h3>
          </div>
          
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
                {subChannels
                  .filter(sc => sc.type === 'text')
                  .map(subChannel => (
                    <div 
                      key={subChannel.id}
                      className={`group flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer ${
                        activeSubChannel === subChannel.id ? 
                        'bg-accent/50 text-accent-foreground' : 
                        'hover:bg-accent/50 hover:text-accent-foreground'
                      }`}
                      onClick={() => handleSubChannelClick(subChannel.id, 'text')}
                    >
                      <Hash className={`h-4 w-4 ${activeSubChannel === subChannel.id ? '' : 'text-muted-foreground'}`} />
                      <span className="text-sm">{subChannel.name}</span>
                    </div>
                  ))
                }
                <div 
                  className="flex items-center gap-2 px-2 py-1 opacity-70 hover:opacity-100 cursor-pointer"
                  onClick={() => setIsAddChannelDialogOpen(true)}
                >
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
                {subChannels
                  .filter(sc => sc.type === 'voice')
                  .map(subChannel => (
                    <div 
                      key={subChannel.id}
                      className={`group flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer ${
                        activeSubChannel === subChannel.id ? 
                        'bg-accent/50 text-accent-foreground' : 
                        'hover:bg-accent/50 hover:text-accent-foreground'
                      }`}
                      onClick={() => handleSubChannelClick(subChannel.id, 'voice')}
                    >
                      <Users className={`h-4 w-4 ${activeSubChannel === subChannel.id ? '' : 'text-muted-foreground'}`} />
                      <span className="text-sm">{subChannel.name}</span>
                    </div>
                  ))
                }
                <div 
                  className="flex items-center gap-2 px-2 py-1 opacity-70 hover:opacity-100 cursor-pointer"
                  onClick={() => setIsAddVoiceChannelDialogOpen(true)}
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="text-xs">Add Voice Channel</span>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
          
          <div className="p-2 border-t mt-auto">
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              size="sm"
              onClick={() => setIsSettingsDialogOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Channel Settings
            </Button>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center px-4 py-2 border-b">
            <div className="flex items-center">
              <Hash className="h-5 w-5 mr-2 text-muted-foreground" />
              <h2 className="font-semibold">{
                activeSubChannel ? 
                `${channel.name} / ${subChannels.find(sc => sc.id === activeSubChannel)?.name || activeSubChannel}` : 
                channel.name
              }</h2>
              {channel.isPrivate && (
                <Badge variant="outline" className="ml-2">Private</Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsNotificationsDialogOpen(true)}
              >
                <Bell className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsInviteDialogOpen(true)}
              >
                <UserPlus className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setActiveTab("voice")}
              >
                <Video className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
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
            
            <TabsContent value="chat" className="flex-1 flex flex-col px-0 py-0">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {filteredMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Hash className="h-12 w-12 mb-2 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Welcome to #{
                      subChannels.find(sc => sc.id === activeSubChannel)?.name || activeSubChannel
                    }!</h3>
                    <p className="text-muted-foreground max-w-sm mt-2">
                      This is the beginning of the {
                        subChannels.find(sc => sc.id === activeSubChannel)?.name || activeSubChannel
                      } channel. 
                      Start the conversation by sending a message.
                    </p>
                  </div>
                ) : (
                  filteredMessages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))
                )}
              </div>
              
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
                    placeholder={`Message #${subChannels.find(sc => sc.id === activeSubChannel)?.name || activeSubChannel}`}
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
            
            <TabsContent value="voice" className="flex-1 p-4">
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="bg-muted p-6 rounded-full mb-4">
                  <Phone className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">Voice Chat</h3>
                <p className="text-muted-foreground max-w-sm mt-2">
                  {activeSubChannel && subChannels.find(sc => sc.id === activeSubChannel)?.type === 'voice' 
                    ? `Join the ${subChannels.find(sc => sc.id === activeSubChannel)?.name} voice channel.`
                    : "Start a voice conversation with other channel members."
                  }
                </p>
                <Button className="mt-4">
                  Join Voice Channel
                </Button>
              </div>
            </TabsContent>
            
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
                    <Button variant="outline" onClick={handleCopyInviteLink}>Copy</Button>
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
      
      <Dialog open={isAddChannelDialogOpen} onOpenChange={setIsAddChannelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Text Channel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="channel-name">Channel Name</Label>
              <Input
                id="channel-name"
                placeholder="e.g., resources"
                value={newSubchannelName}
                onChange={(e) => setNewSubchannelName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddChannelDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => handleAddSubChannel('text')}>Create Channel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isAddVoiceChannelDialogOpen} onOpenChange={setIsAddVoiceChannelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Voice Channel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="voice-channel-name">Voice Channel Name</Label>
              <Input
                id="voice-channel-name"
                placeholder="e.g., Gaming"
                value={newSubchannelName}
                onChange={(e) => setNewSubchannelName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddVoiceChannelDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => handleAddSubChannel('voice')}>Create Voice Channel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Channel Settings</DialogTitle>
          </DialogHeader>
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
            
            <div className="pt-2">
              <h4 className="text-sm font-medium mb-2">Invite Link</h4>
              <div className="flex space-x-2">
                <Input value={`https://app.com/invite/${channel.id}`} readOnly />
                <Button variant="outline" onClick={handleCopyInviteLink}>Copy</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Share this link to invite people to your channel
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isNotificationsDialogOpen} onOpenChange={setIsNotificationsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Channel Notifications</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">All Messages</h4>
                  <p className="text-sm text-muted-foreground">Get notified for every new message</p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Mentions Only</h4>
                  <p className="text-sm text-muted-foreground">Only get notified when someone mentions you</p>
                </div>
                <Button variant="default" size="sm">Active</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">No Notifications</h4>
                  <p className="text-sm text-muted-foreground">Don't get notified about new messages</p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsNotificationsDialogOpen(false)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite People to {channel.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="invite-link">Channel Invite Link</Label>
              <div className="flex space-x-2">
                <Input id="invite-link" value={`https://app.com/invite/${channel.id}`} readOnly />
                <Button variant="outline" onClick={handleCopyInviteLink}>Copy</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Share this link to invite people to your channel
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsInviteDialogOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
