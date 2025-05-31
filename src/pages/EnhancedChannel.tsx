
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChatInput } from '@/components/ui/chat-input';
import { BackNavigation } from '@/components/ui/back-navigation';
import { 
  Hash, 
  Users, 
  Settings, 
  Bell, 
  Pin,
  Smile,
  Gift,
  Search,
  MoreVertical,
  UserPlus,
  Volume2,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  PhoneOff
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string;
  created_at: string;
  type: 'text' | 'image' | 'file';
}

interface Channel {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  isJoined: boolean;
  isPrivate: boolean;
  avatar?: string;
}

export default function EnhancedChannel() {
  const { channelId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [channel, setChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(12);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [inVoiceChannel, setInVoiceChannel] = useState(false);

  useEffect(() => {
    loadChannelData();
    loadMessages();
  }, [channelId]);

  const loadChannelData = () => {
    // Mock channel data
    const mockChannels: { [key: string]: Channel } = {
      'general': {
        id: 'general',
        name: '# general',
        description: 'General discussion for everyone',
        category: 'Text Channels',
        memberCount: 156,
        isJoined: true,
        isPrivate: false,
        avatar: '/placeholder.svg'
      },
      'gaming': {
        id: 'gaming',
        name: '# gaming',
        description: 'Talk about your favorite games',
        category: 'Text Channels',
        memberCount: 89,
        isJoined: true,
        isPrivate: false,
        avatar: '/placeholder.svg'
      },
      'music': {
        id: 'music',
        name: '# music',
        description: 'Share and discover new music',
        category: 'Text Channels',
        memberCount: 67,
        isJoined: false,
        isPrivate: false,
        avatar: '/placeholder.svg'
      }
    };

    const channelData = mockChannels[channelId || 'general'] || mockChannels['general'];
    setChannel(channelData);
    setLoading(false);
  };

  const loadMessages = () => {
    // Mock messages for the channel
    const mockMessages: Message[] = [
      {
        id: '1',
        content: 'Welcome to the channel! 👋',
        sender_id: 'mod-1',
        sender_name: 'ChannelBot',
        sender_avatar: '/placeholder.svg',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        type: 'text'
      },
      {
        id: '2',
        content: 'Hey everyone! How\'s everyone doing today?',
        sender_id: 'user-1',
        sender_name: 'Sarah Chen',
        sender_avatar: '/placeholder.svg',
        created_at: new Date(Date.now() - 1800000).toISOString(),
        type: 'text'
      },
      {
        id: '3',
        content: 'Great! Just finished a new project. Excited to share it with you all!',
        sender_id: 'user-2',
        sender_name: 'Marcus Johnson',
        sender_avatar: '/placeholder.svg',
        created_at: new Date(Date.now() - 900000).toISOString(),
        type: 'text'
      }
    ];

    setMessages(mockMessages);
  };

  const handleJoinChannel = () => {
    if (!channel) return;
    
    const updatedChannel = { ...channel, isJoined: true };
    setChannel(updatedChannel);
    
    toast({
      title: "Joined channel! 🎉",
      description: `You've joined ${channel.name}`,
    });
  };

  const handleLeaveChannel = () => {
    if (!channel) return;
    
    const updatedChannel = { ...channel, isJoined: false };
    setChannel(updatedChannel);
    
    toast({
      title: "Left channel",
      description: `You've left ${channel.name}`,
    });
    
    navigate('/channels');
  };

  const handleJoinVoice = () => {
    setInVoiceChannel(true);
    toast({
      title: "Joined voice channel",
      description: "You're now in the voice channel",
    });
  };

  const handleLeaveVoice = () => {
    setInVoiceChannel(false);
    setIsMuted(false);
    setIsDeafened(false);
    toast({
      title: "Left voice channel",
      description: "You've left the voice channel",
    });
  };

  const handleMessageSent = () => {
    // Reload messages after sending
    loadMessages();
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Channel not found</h2>
          <p className="text-muted-foreground mb-4">This channel doesn't exist or has been deleted.</p>
          <Button onClick={() => navigate('/channels')}>
            Back to Channels
          </Button>
        </div>
      </div>
    );
  }

  if (!channel.isJoined) {
    return (
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="border-b p-4 bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BackNavigation fallbackRoute="/channels" />
              <Hash className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-xl font-semibold">{channel.name.replace('# ', '')}</h1>
            </div>
          </div>
        </div>

        {/* Join Channel Prompt */}
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md mx-auto text-center p-6">
            <Hash className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Join {channel.name}</h2>
            <p className="text-muted-foreground mb-4">{channel.description}</p>
            <div className="flex items-center justify-center gap-4 mb-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{channel.memberCount} members</span>
              </div>
            </div>
            <Button onClick={handleJoinChannel} className="w-full">
              Join Channel
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Discord-like Header */}
      <div className="border-b bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <BackNavigation fallbackRoute="/channels" />
            <Hash className="h-5 w-5 text-gray-500" />
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {channel.name.replace('# ', '')}
            </h1>
            <div className="hidden md:block text-sm text-gray-500 border-l pl-3 ml-3">
              {channel.description}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Pin className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Users className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={message.sender_avatar} alt={message.sender_name} />
                  <AvatarFallback>{message.sender_name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {message.sender_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 break-words">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="border-t bg-white dark:bg-gray-800 p-4">
            <ChatInput
              conversationId={channelId || ''}
              userId={user?.id || 'current-user'}
              onMessageSent={handleMessageSent}
            />
          </div>
        </div>

        {/* Sidebar - Online Members */}
        <div className="hidden lg:block w-60 border-l bg-gray-50 dark:bg-gray-800">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Online — {onlineUsers}
              </h3>
            </div>
            
            {/* Voice Channel Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  General Voice
                </span>
              </div>
              
              {!inVoiceChannel ? (
                <Button 
                  onClick={handleJoinVoice}
                  variant="outline" 
                  size="sm" 
                  className="w-full mb-3"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Join Voice
                </Button>
              ) : (
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      Voice Connected
                    </span>
                    <Button 
                      onClick={handleLeaveVoice}
                      variant="ghost" 
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <PhoneOff className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      onClick={() => setIsMuted(!isMuted)}
                      variant="ghost"
                      size="sm"
                      className={isMuted ? 'bg-red-500 text-white' : ''}
                    >
                      {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                    <Button
                      onClick={() => setIsDeafened(!isDeafened)}
                      variant="ghost"
                      size="sm"
                      className={isDeafened ? 'bg-red-500 text-white' : ''}
                    >
                      {isDeafened ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Online Members List */}
            <div className="space-y-2">
              {[
                { name: 'Sarah Chen', status: 'online', activity: 'Playing Spotify' },
                { name: 'Marcus Johnson', status: 'online', activity: 'In Voice' },
                { name: 'Elena Rodriguez', status: 'idle', activity: 'Away' },
                { name: 'David Kim', status: 'online', activity: 'Browsing' }
              ].map((member, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                  <div className="relative">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/placeholder.svg" alt={member.name} />
                      <AvatarFallback className="text-xs">{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                      member.status === 'online' ? 'bg-green-500' : 
                      member.status === 'idle' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {member.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {member.activity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
