
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BackNavigation } from '@/components/ui/back-navigation';
import { ChatInput } from '@/components/ui/chat-input';
import { Hash, Users, Settings, Mic, MicOff, Video, VideoOff, Phone, PhoneOff, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Channel {
  id: string;
  name: string;
  description: string;
  category: string;
  members: number;
  isJoined: boolean;
  isPrivate: boolean;
  messages: Message[];
}

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  timestamp: Date;
}

export default function EnhancedChannel() {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);

  useEffect(() => {
    loadChannel();
  }, [channelId]);

  const loadChannel = () => {
    // Mock channel data
    const mockChannel: Channel = {
      id: channelId || '1',
      name: 'General Discussion',
      description: 'Welcome to the general discussion channel! Feel free to chat about anything.',
      category: 'General',
      members: 42,
      isJoined: true,
      isPrivate: false,
      messages: [
        {
          id: '1',
          content: 'Welcome to the channel! 👋',
          sender: {
            id: 'mod1',
            name: 'Channel Moderator',
            avatar: '/placeholder.svg'
          },
          timestamp: new Date(Date.now() - 60000)
        },
        {
          id: '2',
          content: 'Thanks! Excited to be here!',
          sender: {
            id: 'user1',
            name: 'Sarah Chen',
            avatar: '/placeholder.svg'
          },
          timestamp: new Date(Date.now() - 30000)
        }
      ]
    };

    setChannel(mockChannel);
    setLoading(false);
  };

  const handleJoinVoice = () => {
    setIsVoiceConnected(!isVoiceConnected);
    toast({
      title: isVoiceConnected ? 'Left voice channel' : 'Joined voice channel',
      description: isVoiceConnected ? 'You left the voice channel' : 'You joined the voice channel',
    });
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? 'Unmuted' : 'Muted',
      description: isMuted ? 'Your microphone is now on' : 'Your microphone is now muted',
    });
  };

  const handleDeafen = () => {
    setIsDeafened(!isDeafened);
    toast({
      title: isDeafened ? 'Undeafened' : 'Deafened',
      description: isDeafened ? 'You can now hear others' : 'You cannot hear others',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="flex">
          <div className="w-64 bg-gray-800 p-4">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded"></div>
            </div>
          </div>
          <div className="flex-1 p-4">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-700 rounded"></div>
              <div className="h-64 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Channel not found</h2>
          <Button onClick={() => navigate('/channels')} variant="outline">
            Back to Channels
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex h-screen">
        {/* Left Sidebar - Discord Style */}
        <div className="w-64 bg-gray-800 flex flex-col">
          {/* Channel Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <BackNavigation 
                fallbackRoute="/channels" 
                className="text-gray-400 hover:text-white"
                variant="ghost"
              />
            </div>
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-gray-400" />
              <span className="font-semibold">{channel.name}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">{channel.description}</p>
          </div>

          {/* Voice Channel Section */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase">Voice Channel</span>
              <Badge variant="secondary" className="text-xs">
                {channel.members} members
              </Badge>
            </div>
            
            <div className="bg-gray-700 rounded p-2 mb-2">
              <div className="flex items-center gap-2 text-sm">
                <Volume2 className="h-4 w-4" />
                <span>General Voice</span>
              </div>
              {isVoiceConnected && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>You</span>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleJoinVoice}
              variant={isVoiceConnected ? "destructive" : "secondary"}
              size="sm"
              className="w-full mb-2"
            >
              {isVoiceConnected ? 'Leave Voice' : 'Join Voice'}
            </Button>

            {/* Voice Controls */}
            {isVoiceConnected && (
              <div className="flex gap-1">
                <Button
                  onClick={handleMute}
                  variant={isMuted ? "destructive" : "secondary"}
                  size="icon"
                  className="h-8 w-8"
                >
                  {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button
                  onClick={handleDeafen}
                  variant={isDeafened ? "destructive" : "secondary"}
                  size="icon"
                  className="h-8 w-8"
                >
                  {isDeafened ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>

          {/* Online Members */}
          <div className="p-4 flex-1">
            <div className="text-xs font-semibold text-gray-400 uppercase mb-2">
              Online - {Math.floor(channel.members * 0.7)}
            </div>
            <div className="space-y-2">
              {['Sarah Chen', 'Marcus Johnson', 'Elena Rodriguez'].map((name, i) => (
                <div key={i} className="flex items-center gap-2 text-sm hover:bg-gray-700 rounded p-1 cursor-pointer">
                  <div className="relative">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="text-xs">{name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></div>
                  </div>
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-700 bg-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-gray-400" />
                <h1 className="font-semibold">{channel.name}</h1>
                <Badge variant="secondary">{channel.category}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Users className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {channel.messages.map((message) => (
              <div key={message.id} className="flex gap-3 hover:bg-gray-800/50 p-2 rounded">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.sender.avatar} />
                  <AvatarFallback>{message.sender.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{message.sender.name}</span>
                    <span className="text-xs text-gray-400">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-gray-800">
            <ChatInput
              conversationId={channelId || ''}
              userId={user?.id || ''}
              onMessageSent={() => {
                // Refresh messages
                toast({
                  title: 'Message sent',
                  description: 'Your message has been sent to the channel',
                });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
