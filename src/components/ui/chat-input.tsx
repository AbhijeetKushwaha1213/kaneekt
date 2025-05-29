
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ChatInputProps {
  conversationId: string;
  userId: string;
  onMessageSent?: () => void;
}

export function ChatInput({ conversationId, userId, onMessageSent }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check if this is the first message to this person
  const checkMessageLimit = () => {
    const allMessages = JSON.parse(localStorage.getItem("chatMessages") || "[]");
    const conversationMessages = allMessages.filter(
      (m: any) => m.conversation_id === conversationId
    );
    
    const userMessages = conversationMessages.filter(
      (m: any) => m.sender_id === userId
    );

    // Check if users are matched (liked each other)
    const matches = JSON.parse(localStorage.getItem('matches') || '[]');
    const isMatched = matches.includes(conversationId);

    return { 
      hasReachedLimit: userMessages.length >= 1 && !isMatched,
      isFirstMessage: userMessages.length === 0,
      isMatched 
    };
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const { hasReachedLimit, isFirstMessage, isMatched } = checkMessageLimit();

    if (hasReachedLimit) {
      toast({
        title: "Message limit reached",
        description: "You can only send one message until they respond or you both like each other",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const messageData = {
        id: `msg-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: userId,
        content: message.trim(),
        created_at: new Date().toISOString(),
        is_read: false
      };

      // Try to save to Supabase first
      if (userId !== 'anonymous') {
        try {
          await supabase.from('messages').insert(messageData);
        } catch (error) {
          console.error("Error saving to Supabase:", error);
        }
      }

      // Always save to localStorage as backup
      const allMessages = JSON.parse(localStorage.getItem("chatMessages") || "[]");
      allMessages.push(messageData);
      localStorage.setItem("chatMessages", JSON.stringify(allMessages));

      if (isFirstMessage) {
        toast({
          title: "First message sent!",
          description: isMatched 
            ? "You can continue chatting freely since you're matched!"
            : "Wait for them to respond or like each other to unlock unlimited messaging",
        });
      }

      setMessage("");
      onMessageSent?.();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error sending message",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const { hasReachedLimit, isMatched } = checkMessageLimit();

  return (
    <div className="flex items-center space-x-2">
      <Button variant="ghost" size="icon" className="h-10 w-10">
        <Paperclip className="h-4 w-4" />
      </Button>
      
      <div className="flex-1 flex items-center space-x-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            hasReachedLimit 
              ? "Like each other to unlock unlimited messaging"
              : "Type a message..."
          }
          disabled={isLoading || hasReachedLimit}
          className="flex-1"
        />
        
        <Button
          onClick={handleSendMessage}
          disabled={!message.trim() || isLoading || hasReachedLimit}
          size="icon"
          className="h-10 w-10"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      {hasReachedLimit && !isMatched && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full">
          💬 One message limit - like each other to chat freely!
        </div>
      )}
    </div>
  );
}
