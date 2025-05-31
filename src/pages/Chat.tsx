
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ChatMessage } from "@/components/ui/chat-message";
import { ChatInput } from "@/components/ui/chat-input";
import { BackNavigation } from "@/components/ui/back-navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const [messages, setMessages] = useState<any[]>([]);
  const [conversationName, setConversationName] = useState("");
  const [conversationUser, setConversationUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  
  useEffect(() => {
    if (!id) return;
    
    const loadMessages = async () => {
      setIsLoading(true);
      
      try {
        const conversations = JSON.parse(localStorage.getItem("conversations") || "[]");
        const conversationData = conversations.find((c: any) => c.id === id);
        
        if (conversationData) {
          setConversationName(conversationData.user.name || "Chat");
          setConversationUser(conversationData.user);
          setIsOnline(Math.random() > 0.5); // Mock online status
          
          if (user) {
            const { data, error } = await supabase
              .from('messages')
              .select('*')
              .eq('conversation_id', id)
              .order('created_at', { ascending: true });
              
            if (data && !error) {
              setMessages(data);
            } else {
              console.error("Error loading messages from Supabase:", error);
              loadMessagesFromLocalStorage();
            }
          } else {
            loadMessagesFromLocalStorage();
          }
        }
      } catch (error) {
        console.error("Error loading messages:", error);
        loadMessagesFromLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };
    
    const loadMessagesFromLocalStorage = () => {
      try {
        const allStoredMessages = JSON.parse(localStorage.getItem("chatMessages") || "[]");
        const filteredMessages = allStoredMessages.filter(
          (m: any) => m.conversation_id === id
        );
        setMessages(filteredMessages);
      } catch (error) {
        console.error("Error loading messages from local storage:", error);
        setMessages([]);
      }
    };
    
    loadMessages();
    
    if (user) {
      const channel = supabase
        .channel(`conversation:${id}`)
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `conversation_id=eq.${id}` 
          }, 
          (payload) => {
            setMessages(current => [...current, payload.new]);
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [id, user]);

  const handleMessageSent = () => {
    const allStoredMessages = JSON.parse(localStorage.getItem("chatMessages") || "[]");
    const filteredMessages = allStoredMessages.filter(
      (m: any) => m.conversation_id === id
    );
    setMessages(filteredMessages);
  };

  const handleProfileClick = () => {
    if (conversationUser?.id) {
      navigate(`/profile/${conversationUser.id}`);
    }
  };

  const handleVoiceCall = () => {
    toast({
      title: "Voice call started",
      description: `Calling ${conversationName}...`
    });
  };

  const handleVideoCall = () => {
    toast({
      title: "Video call started",
      description: `Video calling ${conversationName}...`
    });
  };

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
                    <AvatarFallback>{conversationName[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h1 className="font-semibold">{conversationName}</h1>
                  <p className="text-sm text-muted-foreground">
                    {isOnline ? 'Online' : `${messages.length} messages`}
                  </p>
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
            {isLoading ? (
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
                    timestamp: new Date(message.created_at || Date.now()),
                    sender: {
                      id: message.sender_id,
                      name: message.sender_id === user?.id ? "You" : conversationName,
                      avatar: message.sender_id === user?.id ? (user?.user_metadata?.avatar_url || '/placeholder.svg') : (conversationUser?.avatar || '/placeholder.svg')
                    },
                    isCurrentUser: message.sender_id === user?.id,
                    type: message.type || 'text',
                    mediaUrl: message.file_data || message.audio_data
                  }}
                />
              ))
            ) : (
              <div className="text-center py-10">
                <div className="bg-accent/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conversationUser?.avatar || '/placeholder.svg'} />
                    <AvatarFallback>{conversationName[0] || 'U'}</AvatarFallback>
                  </Avatar>
                </div>
                <h3 className="font-medium mb-1">{conversationName}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Start your conversation with {conversationName}
                </p>
                <Button variant="outline" size="sm" onClick={handleProfileClick}>
                  View Profile
                </Button>
              </div>
            )}
          </div>
          
          {/* Chat input */}
          <ChatInput 
            conversationId={id || ""} 
            userId={user?.id || "anonymous"} 
            recipientName={conversationName}
            onMessageSent={handleMessageSent} 
          />
        </div>
      </div>
      
      <div className="md:hidden h-16"></div>
    </MainLayout>
  );
}
