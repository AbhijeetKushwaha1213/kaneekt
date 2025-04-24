
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ChatInput } from "@/components/ui/chat-input";
import { ChatMessage } from "@/components/ui/chat-message";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [conversationData, setConversationData] = useState<any>(null);
  const [chatPartner, setChatPartner] = useState<any>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchConversationAndMessages = async () => {
      if (!id || !user) return;
      
      try {
        setLoading(true);
        
        // Check if it's a group chat
        const isGroupChat = id.startsWith('group-');
        
        // Try to fetch from Supabase first
        if (!isGroupChat) {
          // Try to get the conversation
          const { data: conversationData, error: convError } = await supabase
            .from('conversations')
            .select('*')
            .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
            .eq(user.id === conversationData?.user1_id ? 'user2_id' : 'user1_id', id)
            .maybeSingle();
          
          if (conversationData) {
            setConversationData(conversationData);
            
            // Fetch messages for this conversation
            const { data: messagesData, error: msgError } = await supabase
              .from('messages')
              .select('*')
              .eq('conversation_id', conversationData.id)
              .order('created_at', { ascending: true });
              
            if (!msgError && messagesData) {
              setMessages(messagesData);
            } else {
              console.error("Error fetching messages:", msgError);
              loadFromLocalStorage();
            }
          } else {
            // No conversation found in Supabase, check localStorage
            loadFromLocalStorage();
          }
        } else {
          // For group chats, check localStorage
          loadFromLocalStorage();
        }
      } catch (error) {
        console.error("Error fetching conversation:", error);
        loadFromLocalStorage();
      } finally {
        setLoading(false);
      }
    };
    
    const loadFromLocalStorage = () => {
      try {
        // Get conversation data
        const storedConversations = JSON.parse(localStorage.getItem("conversations") || "[]");
        const conversation = storedConversations.find((c: any) => c.id === id);
        
        if (conversation) {
          setConversationData(conversation);
          
          // If it's a group chat, set up the group chat info
          if (id?.startsWith('group-')) {
            setChatPartner({
              name: conversation.user.name,
              avatar: conversation.user.avatar || "/placeholder.svg",
              isGroup: true,
              participants: conversation.participants || []
            });
          } else {
            // For one-on-one chats, set up the partner info
            setChatPartner({
              id: conversation.user.id,
              name: conversation.user.name,
              avatar: conversation.user.avatar || "/placeholder.svg"
            });
          }
          
          // Get messages for this conversation
          const storedMessages = JSON.parse(localStorage.getItem("chatMessages") || "[]");
          const conversationMessages = storedMessages.filter((m: any) => m.conversation_id === id);
          setMessages(conversationMessages);
        }
      } catch (error) {
        console.error("Error loading data from localStorage:", error);
      }
    };
    
    fetchConversationAndMessages();
  }, [id, user]);

  // Function to handle when a new message is sent
  const handleMessageSent = async () => {
    // Refetch messages from Supabase if we have a connection
    if (user && conversationData) {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationData.id)
        .order('created_at', { ascending: true });
        
      if (!error && data) {
        setMessages(data);
        return;
      }
    }
    
    // Fallback to localStorage if needed
    const storedMessages = JSON.parse(localStorage.getItem("chatMessages") || "[]");
    const conversationMessages = storedMessages.filter((m: any) => m.conversation_id === id);
    setMessages(conversationMessages);
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-7.5rem)] lg:h-[calc(100vh-3.5rem)]">
        {/* Chat Header */}
        <div className="px-4 py-2 border-b flex items-center">
          {/* Back button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            asChild
          >
            <Link to="/chats">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-accent mr-3 flex-shrink-0">
              <img 
                src={chatPartner?.avatar || "/placeholder.svg"} 
                alt={chatPartner?.name || "Chat"} 
                className="h-10 w-10 rounded-full object-cover" 
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{chatPartner?.name || "Chat"}</h2>
              {chatPartner?.isGroup && (
                <p className="text-xs text-muted-foreground">
                  {chatPartner?.participants?.length || 0} Participants
                </p>
              )}
              {!chatPartner?.isGroup && (
                <p className="text-xs text-muted-foreground">Online</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <p className="text-muted-foreground mb-2">No messages yet</p>
              <p className="text-sm">Start the conversation by sending a message below</p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage 
                key={message.id} 
                message={message}
                isSent={message.sender_id === user?.id}
              />
            ))
          )}
        </div>
        
        {/* Message Input */}
        <div className="p-4 border-t">
          <ChatInput 
            conversationId={id || ""}
            userId={user?.id || ""}
            onMessageSent={handleMessageSent}
          />
        </div>
      </div>
    </MainLayout>
  );
}
