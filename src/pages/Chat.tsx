
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChatInput } from "@/components/ui/chat-input";
import { BackNavigation } from "@/components/ui/back-navigation";
import { Phone, Video, MoreVertical, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
}

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  username: string;
  isOnline: boolean;
  lastSeen?: string;
}

export default function Chat() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatUser, setChatUser] = useState<ChatUser | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatData();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatData = () => {
    // Mock chat user data
    const mockUsers: { [key: string]: ChatUser } = {
      'mock-1': {
        id: 'mock-1',
        name: 'Sarah Chen',
        avatar: '/placeholder.svg',
        username: 'sarahc',
        isOnline: true,
      },
      'mock-2': {
        id: 'mock-2',
        name: 'Marcus Johnson',
        avatar: '/placeholder.svg',
        username: 'marcusj',
        isOnline: false,
        lastSeen: '2 hours ago'
      },
      'mock-3': {
        id: 'mock-3',
        name: 'Elena Rodriguez',
        avatar: '/placeholder.svg',
        username: 'elenar',
        isOnline: true,
      },
      'mock-4': {
        id: 'mock-4',
        name: 'David Kim',
        avatar: '/placeholder.svg',
        username: 'davidk',
        isOnline: false,
        lastSeen: '1 day ago'
      }
    };

    const currentUser = mockUsers[id || 'mock-1'] || mockUsers['mock-1'];
    setChatUser(currentUser);

    // Load messages from localStorage
    const storedMessages = localStorage.getItem(`chat_${id}`);
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    } else {
      // Mock messages
      const mockMessages: Message[] = [
        {
          id: '1',
          content: 'Hey! How are you doing?',
          sender_id: id || 'mock-1',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          is_read: true
        },
        {
          id: '2',
          content: 'I\'m doing great! Thanks for asking 😊',
          sender_id: user?.id || 'current-user',
          created_at: new Date(Date.now() - 3000000).toISOString(),
          is_read: true
        },
        {
          id: '3',
          content: 'What are you up to today?',
          sender_id: id || 'mock-1',
          created_at: new Date(Date.now() - 1800000).toISOString(),
          is_read: false
        }
      ];
      setMessages(mockMessages);
      localStorage.setItem(`chat_${id}`, JSON.stringify(mockMessages));
    }

    setLoading(false);
  };

  const handleMessageSent = () => {
    // Reload messages after sending
    const storedMessages = localStorage.getItem(`chat_${id}`);
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  };

  const handleProfileClick = () => {
    window.location.href = `/profile/${id}`;
  };

  const handleVoiceCall = () => {
    toast({
      title: 'Voice call initiated',
      description: `Calling ${chatUser?.name}...`,
    });
  };

  const handleVideoCall = () => {
    toast({
      title: 'Video call initiated',
      description: `Video calling ${chatUser?.name}...`,
    });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!chatUser) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Chat not found</h2>
          <p className="text-muted-foreground">This conversation doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="border-b p-4 bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isMobile && (
              <BackNavigation fallbackRoute="/chats" />
            )}
            <div 
              className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
              onClick={handleProfileClick}
            >
              <div className="relative">
                <Avatar>
                  <AvatarImage src={chatUser.avatar} alt={chatUser.name} />
                  <AvatarFallback>{chatUser.name[0]}</AvatarFallback>
                </Avatar>
                {chatUser.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                )}
              </div>
              <div>
                <h2 className="font-semibold">{chatUser.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {chatUser.isOnline ? 'Online' : `Last seen ${chatUser.lastSeen}`}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleVoiceCall}>
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleVideoCall}>
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.sender_id === user?.id || message.sender_id === 'current-user';
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <Card className={`max-w-[70%] p-3 ${
                isOwn 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}>
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  isOwn 
                    ? 'text-primary-foreground/70' 
                    : 'text-muted-foreground'
                }`}>
                  {new Date(message.created_at).toLocaleTimeString()}
                </p>
              </Card>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="border-t p-4 bg-background">
        <ChatInput
          conversationId={id || ''}
          userId={user?.id || 'current-user'}
          onMessageSent={handleMessageSent}
        />
      </div>
    </div>
  );
}
