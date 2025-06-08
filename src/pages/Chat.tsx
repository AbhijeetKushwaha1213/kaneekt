
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ChatMessage } from "@/components/ui/chat-message";
import { ChatInput } from "@/components/ui/chat-input";
import { BackNavigation } from "@/components/ui/back-navigation";
import { RealTimeStatus } from "@/components/realtime/RealTimeStatus";
import { TypingIndicator } from "@/components/ui/typing-indicator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRealTimeMessages } from "@/hooks/useRealTimeMessages";
import { useTypingIndicators } from "@/hooks/useTypingIndicators";
import { useUserPresence } from "@/hooks/useUserPresence";
import { useMessageStatus } from "@/hooks/useMessageStatus";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Phone, Video, MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [conversationUser, setConversationUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Real-time hooks
  const { messages, loading: messagesLoading, sendMessage } = useRealTimeMessages(id);
  const { typingUsers, startTyping, stopTyping } = useTypingIndicators(id || '');
  const { getUserOnlineStatus } = useUserPresence();
  useMessageStatus(id || '');
  
  const isOnline = conversationUser?.id ? getUserOnlineStatus(conversationUser.id) : false;

  useEffect(() => {
    if (!id || !user) return;
    
    const loadConversationData = async () => {
      setIsLoading(true);
      
      try {
        // Get conversation details
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .select('user1_id, user2_id')
          .eq('id', id)
          .single();

        if (convError) {
          console.error("Error loading conversation:", convError);
          navigate('/chats');
          return;
        }

        // Determine the other user
        const otherUserId = conversation.user1_id === user.id ? conversation.user2_id : conversation.user1_id;
        
        // Get other user's profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, username, avatar')
          .eq('id', otherUserId)
          .single();

        if (profileError) {
          console.error("Error loading user profile:", profileError);
          setConversationUser({
            id: otherUserId,
            name: "User",
            avatar: "/placeholder.svg"
          });
        } else {
          setConversationUser({
            id: profile.id,
            name: profile.name || "User",
            avatar: profile.avatar || "/placeholder.svg"
          });
        }
      } catch (error) {
        console.error("Error loading conversation data:", error);
        toast({
          title: "Error",
          description: "Failed to load conversation",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConversationData();
  }, [id, user, navigate, toast]);

  const handleMessageSent = async (content: string) => {
    const result = await sendMessage(content);
    if (result?.error) {
      console.error("Failed to send message:", result.error);
    }
  };

  const handleProfileClick = () => {
    if (conversationUser?.id) {
      navigate(`/profile/${conversationUser.id}`);
    }
  };

  const handleVoiceCall = () => {
    toast({
      title: "Voice call started",
      description: `Calling ${conversationUser?.name || 'User'}...`
    });
  };

  const handleVideoCall = () => {
    toast({
      title: "Video call started",
      description: `Video calling ${conversationUser?.name || 'User'}...`
    });
  };

  const handleInputChange = (value: string) => {
    if (value.trim()) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  const handleInputSubmit = () => {
    stopTyping();
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="h-[calc(100vh-7.5rem)] md:h-[calc(100vh-3.5rem)] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading conversation...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="h-[calc(100vh-7.5rem)] md:h-[calc(100vh-3.5rem)] flex flex-col">
        {/* Enhanced header */}
        <div className="border-b p-4 bg-background/95 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BackNavigation customBackPath="/chats" showHome={false} />
              
              <div 
                className="flex items-center space-x-3 cursor-pointer hover:bg-accent/50 rounded-lg p-2 -ml-2 transition-colors"
                onClick={handleProfileClick}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conversationUser?.avatar || '/placeholder.svg'} />
                    <AvatarFallback>{conversationUser?.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  {conversationUser?.id && (
                    <div className="absolute bottom-0 right-0">
                      <RealTimeStatus userId={conversationUser.id} />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h1 className="font-semibold">{conversationUser?.name || 'User'}</h1>
                  <div className="text-sm text-muted-foreground">
                    {conversationUser?.id && (
                      <RealTimeStatus userId={conversationUser.id} showLabel />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={handleVoiceCall}>
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleVideoCall}>
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messagesLoading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading messages...</p>
              </div>
            ) : messages.length > 0 ? (
              messages.map((message) => (
                <ChatMessage 
                  key={message.id} 
                  message={{
                    id: message.id,
                    content: message.content,
                    timestamp: message.timestamp,
                    sender: {
                      id: message.sender.id,
                      name: message.isCurrentUser ? "You" : (conversationUser?.name || 'User'),
                      avatar: message.isCurrentUser ? (user?.user_metadata?.avatar_url || '/placeholder.svg') : (conversationUser?.avatar || '/placeholder.svg')
                    },
                    isCurrentUser: message.isCurrentUser,
                    type: message.type || 'text',
                    status: message.status
                  }}
                />
              ))
            ) : (
              <div className="text-center py-10">
                <div className="bg-accent/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conversationUser?.avatar || '/placeholder.svg'} />
                    <AvatarFallback>{conversationUser?.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                </div>
                <h3 className="font-medium mb-1">{conversationUser?.name || 'User'}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Start your conversation with {conversationUser?.name || 'User'}
                </p>
                <Button variant="outline" size="sm" onClick={handleProfileClick}>
                  View Profile
                </Button>
              </div>
            )}
          </div>
          
          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <TypingIndicator userNames={[conversationUser?.name || 'User']} />
          )}
          
          {/* Chat input */}
          <ChatInput 
            conversationId={id || ""} 
            userId={user?.id || "anonymous"} 
            recipientName={conversationUser?.name || 'User'}
            onMessageSent={() => handleMessageSent}
            onInputChange={handleInputChange}
            onSubmit={handleInputSubmit}
          />
        </div>
      </div>
      
      <div className="md:hidden h-16"></div>
    </MainLayout>
  );
}
