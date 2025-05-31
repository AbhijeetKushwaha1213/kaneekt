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
  Shield,
  Volume2,
  Mic,
  MicOff,
  Headphones
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
      <div className="flex h-[calc(100vh-3.5rem)] bg-gray-50 dark:bg-gray-900">
        {/* Discord-style Sidebar */}
        <div className="w-64 bg-gray-800 text-white flex flex-col">
          {/* Server Header */}
          <div className="p-3 border-b border-gray-700 bg-gray-850">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white truncate">{channel?.name}</h3>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white h-6 w-6">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Channel List */}
          <div className="flex-1 overflow-y-auto p-2">
            {/* Text Channels */}
            <Collapsible 
              open={isTextChannelsOpen} 
              onOpenChange={setIsTextChannelsOpen}
              className="mb-4"
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between p-1 text-xs font-semibold text-gray-400 hover:text-gray-200 uppercase tracking-wide">
                <span>Text Channels</span>
                <PlusCircle 
                  className="h-4 w-4 hover:text-white cursor-pointer" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAddChannelDialogOpen(true);
                  }}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 mt-1">
                {subChannels
                  .filter(sc => sc.type === 'text')
                  .map(subChannel => (
                    <div 
                      key={subChannel.id}
                      className={`group flex items-center gap-2 px-2 py-1 mx-1 rounded cursor-pointer ${
                        activeSubChannel === subChannel.id ? 
                        'bg-gray-700 text-white' : 
                        'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                      }`}
                      onClick={() => handleSubChannelClick(subChannel.id, 'text')}
                    >
                      <Hash className="h-4 w-4" />
                      <span className="text-sm">{subChannel.name}</span>
                    </div>
                  ))
                }
              </CollapsibleContent>
            </Collapsible>
            
            {/* Voice Channels */}
            <Collapsible 
              open={isVoiceChannelsOpen} 
              onOpenChange={setIsVoiceChannelsOpen}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between p-1 text-xs font-semibold text-gray-400 hover:text-gray-200 uppercase tracking-wide">
                <span>Voice Channels</span>
                <PlusCircle 
                  className="h-4 w-4 hover:text-white cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAddVoiceChannelDialogOpen(true);
                  }}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 mt-1">
                {subChannels
                  .filter(sc => sc.type === 'voice')
                  .map(subChannel => (
                    <div 
                      key={subChannel.id}
                      className={`group flex items-center gap-2 px-2 py-1 mx-1 rounded cursor-pointer ${
                        activeSubChannel === subChannel.id ? 
                        'bg-gray-700 text-white' : 
                        'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                      }`}
                      onClick={() => handleSubChannelClick(subChannel.id, 'voice')}
                    >
                      <Volume2 className="h-4 w-4" />
                      <span className="text-sm">{subChannel.name}</span>
                      {activeSubChannel === subChannel.id && (
                        <div className="ml-auto flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs">2</span>
                        </div>
                      )}
                    </div>
                  ))
                }
              </CollapsibleContent>
            </Collapsible>
          </div>
          
          {/* User Info Bar */}
          <div className="p-2 bg-gray-900 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">You</p>
                  <p className="text-xs text-gray-400">#1234</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                  <Mic className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                  <Headphones className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-gray-400 hover:text-white"
                  onClick={() => setIsSettingsDialogOpen(true)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
          {/* Channel Header */}
          <div className="flex justify-between items-center px-4 py-3 border-b bg-white dark:bg-gray-800 shadow-sm">
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-gray-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {subChannels.find(sc => sc.id === activeSubChannel)?.name || activeSubChannel}
              </h2>
              <div className="h-4 w-px bg-gray-300 mx-2"></div>
              <p className="text-sm text-gray-500">
                {filteredMessages.length === 0 ? 'No messages yet' : `${filteredMessages.length} messages`}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <UserPlus className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Users className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <MessageSquare className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <Hash className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Welcome to #{subChannels.find(sc => sc.id === activeSubChannel)?.name || activeSubChannel}!
                </h3>
                <p className="text-gray-500 max-w-sm">
                  This is the beginning of the #{subChannels.find(sc => sc.id === activeSubChannel)?.name || activeSubChannel} channel. 
                  Start the conversation by sending a message.
                </p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))
            )}
          </div>
          
          {/* Message Input */}
          <div className="p-4 border-t bg-white dark:bg-gray-800">
            <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <PlusCircle className="h-5 w-5" />
              </Button>
              
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message #${subChannels.find(sc => sc.id === activeSubChannel)?.name || activeSubChannel}`}
                className="flex-1 border-0 bg-transparent focus-visible:ring-0"
              />
              
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Paperclip className="h-5 w-5" />
              </Button>
              
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Smile className="h-5 w-5" />
              </Button>
              
              <Button 
                onClick={handleSendMessage} 
                disabled={newMessage.trim() === ""}
                size="icon"
                className="h-8 w-8"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Members Sidebar */}
        <div className="w-60 bg-gray-50 dark:bg-gray-900 border-l">
          <div className="p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">
              Members — {channel?.members || 0}
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                  Online — 3
                </h4>
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder.svg" alt={`Member ${i+1}`} />
                          <AvatarFallback>M{i+1}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">Member {i+1}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                  Offline — {Math.max(0, (channel?.members || 0) - 3)}
                </h4>
                <div className="space-y-2">
                  {Array.from({ length: Math.max(0, (channel?.members || 0) - 3) }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                      <div className="relative">
                        <Avatar className="h-8 w-8 opacity-60">
                          <AvatarImage src="/placeholder.svg" alt={`Member ${i+4}`} />
                          <AvatarFallback>M{i+4}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gray-400 border-2 border-white rounded-full"></div>
                      </div>
                      <span className="text-sm text-gray-500">Member {i+4}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Keep existing dialogs */}
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
