
import React, { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

interface ChatInputProps {
  conversationId: string;
  userId: string;
  onMessageSent?: () => void;
}

export function ChatInput({ conversationId, userId, onMessageSent }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    
    if (!message.trim()) return;
    
    setIsSending(true);
    try {
      // Check if this is a channel message (starts with "channel_")
      const isChannelMessage = conversationId.startsWith('channel_');
      
      if (isChannelMessage) {
        // Handle channel messages - store in localStorage with channel-specific key
        const channelId = conversationId.replace('channel_', '');
        storeChannelMessage(message, channelId, userId);
      } else {
        // Handle direct messages
        if (userId) {
          // Check if conversation exists
          let conversationIdToUse = conversationId;
          
          if (!conversationId.startsWith('group-')) {
            // For one-on-one chats, we need to check if a conversation exists in Supabase
            const { data, error } = await supabase
              .from('conversations')
              .select('id')
              .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
              .eq('user2_id', conversationId)
              .maybeSingle();
              
            if (data) {
              conversationIdToUse = data.id;
            } else {
              // Create a new conversation if it doesn't exist
              const { data: newConv, error: convError } = await supabase
                .from('conversations')
                .insert({
                  user1_id: userId,
                  user2_id: conversationId
                })
                .select('id')
                .single();
                
              if (convError) {
                console.error("Error creating conversation:", convError);
                throw convError;
              }
              
              if (newConv) {
                conversationIdToUse = newConv.id;
              }
            }
          }
          
          const messageId = `msg-${uuidv4()}`;
          
          // Try to insert the message to Supabase
          const { error } = await supabase
            .from('messages')
            .insert({
              id: messageId,
              content: message,
              conversation_id: conversationIdToUse,
              sender_id: userId,
              is_read: false
            });
            
          if (error) {
            // If Supabase insert fails, use local storage as fallback
            console.error("Error sending message to Supabase:", error);
            storeMessageLocally(message, conversationId, userId);
          }
        } else {
          // No Supabase connection, use local storage
          storeMessageLocally(message, conversationId, userId);
        }
      }
      
      // Clear message input after sending
      setMessage("");
      
      // Call the callback if provided
      if (onMessageSent) onMessageSent();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Failed to send message",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };
  
  const storeChannelMessage = (content: string, channelId: string, senderId: string) => {
    try {
      // Get existing channel messages or initialize empty array
      const storedMessages = JSON.parse(localStorage.getItem(`channel_messages_${channelId}`) || "[]");
      
      // Add new message
      const newMessage = {
        id: `channel-msg-${Date.now()}`,
        content,
        channel_id: channelId,
        sender_id: senderId,
        created_at: new Date().toISOString(),
        is_read: false
      };
      
      storedMessages.push(newMessage);
      
      // Save back to local storage
      localStorage.setItem(`channel_messages_${channelId}`, JSON.stringify(storedMessages));
    } catch (error) {
      console.error("Error storing channel message locally:", error);
    }
  };
  
  const storeMessageLocally = (content: string, conversationId: string, senderId: string) => {
    try {
      // Get existing messages or initialize empty array
      const storedMessages = JSON.parse(localStorage.getItem("chatMessages") || "[]");
      
      // Add new message
      const newMessage = {
        id: `local-msg-${Date.now()}`,
        content,
        conversation_id: conversationId,
        sender_id: senderId,
        created_at: new Date().toISOString(),
        is_read: false
      };
      
      storedMessages.push(newMessage);
      
      // Save back to local storage
      localStorage.setItem("chatMessages", JSON.stringify(storedMessages));
      
      // Update conversation last message
      const conversations = JSON.parse(localStorage.getItem("conversations") || "[]");
      const conversationIndex = conversations.findIndex((c: any) => c.id === conversationId);
      
      if (conversationIndex !== -1) {
        conversations[conversationIndex].lastMessage = {
          id: newMessage.id,
          content: content.length > 30 ? content.substring(0, 30) + '...' : content,
          timestamp: new Date(),
          unread: false
        };
        
        localStorage.setItem("conversations", JSON.stringify(conversations));
      }
    } catch (error) {
      console.error("Error storing message locally:", error);
    }
  };

  return (
    <form onSubmit={handleSendMessage} className="flex flex-col space-y-2">
      <div className="flex items-end space-x-2">
        <Textarea
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="resize-none min-h-[80px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <Button 
          type="submit" 
          size="icon" 
          className="mb-[1px]"
          disabled={!message.trim() || isSending}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
}
