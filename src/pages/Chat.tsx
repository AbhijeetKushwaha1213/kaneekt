import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ChatMessage } from "@/components/ui/chat-message";
import { ChatInput } from "@/components/ui/chat-input";
import { PageHeader } from "@/components/ui/page-header";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<any[]>([]);
  const [conversationName, setConversationName] = useState("");
  const [conversationUser, setConversationUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!id) return;
    
    const loadMessages = async () => {
      setIsLoading(true);
      
      try {
        // Get conversation data first
        const conversations = JSON.parse(localStorage.getItem("conversations") || "[]");
        const conversationData = conversations.find((c: any) => c.id === id);
        
        if (conversationData) {
          setConversationName(conversationData.user.name || "Chat");
          
          // Try to load messages from Supabase first
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
              // Fall back to local storage
              loadMessagesFromLocalStorage();
            }
          } else {
            // No authenticated user, use local storage
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
        // Load from local storage
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
    
    // Subscribe to new messages if using Supabase
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

  const handleProfileClick = () => {
    if (conversationUser?.id) {
      navigate(`/profile/${conversationUser.id}`);
    }
  };

  return (
    <MainLayout>
      <div className="h-[calc(100vh-7.5rem)] md:h-[calc(100vh-3.5rem)] flex flex-col">
        {/* Enhanced page header with clickable profile */}
        <div className="border-b p-4">
          <div className="flex items-center space-x-3">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/chats')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            
            <Avatar className="h-10 w-10">
              <AvatarImage src={conversationUser?.avatar || '/placeholder.svg'} />
              <AvatarFallback>{conversationName[0] || 'U'}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 
                className="font-semibold cursor-pointer hover:text-primary transition-colors"
                onClick={handleProfileClick}
              >
                {conversationName}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Loading..." : `${messages.length} messages`}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="text-center py-10">
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
                    isCurrentUser: message.sender_id === user?.id
                  }}
                />
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No messages yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Send a message to start the conversation
                </p>
              </div>
            )}
          </div>
          
          {/* Chat input */}
          <div className="border-t p-4">
            <ChatInput 
              conversationId={id || ""} 
              userId={user?.id || "anonymous"} 
              onMessageSent={handleMessageSent} 
            />
          </div>
        </div>
      </div>
      
      {/* Add padding at the bottom to account for mobile navigation */}
      <div className="md:hidden h-16"></div>
    </MainLayout>
  );
}
