
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Smile, Mic, Video, Phone } from "lucide-react";
import { VoiceMessage } from "@/components/chat/VoiceMessage";
import { VideoCall } from "@/components/chat/VideoCall";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { FileUploader } from "@/components/ui/file-uploader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ChatInputProps {
  conversationId: string;
  userId: string;
  recipientName?: string;
  onMessageSent?: () => void;
}

export function ChatInput({ conversationId, userId, recipientName = "User", onMessageSent }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const { toast } = useToast();

  const checkMessageLimit = () => {
    const allMessages = JSON.parse(localStorage.getItem("chatMessages") || "[]");
    const conversationMessages = allMessages.filter(
      (m: any) => m.conversation_id === conversationId
    );
    
    const userMessages = conversationMessages.filter(
      (m: any) => m.sender_id === userId
    );

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

      if (userId !== 'anonymous') {
        try {
          await supabase.from('messages').insert(messageData);
        } catch (error) {
          console.error("Error saving to Supabase:", error);
        }
      }

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

  const handleVoiceMessage = async (audioBlob: Blob) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const messageData = {
        id: `msg-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: userId,
        content: "🎤 Voice message",
        type: "voice",
        audio_data: reader.result,
        created_at: new Date().toISOString(),
        is_read: false
      };

      const allMessages = JSON.parse(localStorage.getItem("chatMessages") || "[]");
      allMessages.push(messageData);
      localStorage.setItem("chatMessages", JSON.stringify(allMessages));
      onMessageSent?.();
    };
    reader.readAsDataURL(audioBlob);
  };

  const handleFileUpload = (files: File[]) => {
    files.forEach(file => {
      const messageData = {
        id: `msg-${Date.now()}-${Math.random()}`,
        conversation_id: conversationId,
        sender_id: userId,
        content: `📎 ${file.name}`,
        type: "file",
        file_data: URL.createObjectURL(file),
        file_name: file.name,
        file_type: file.type,
        created_at: new Date().toISOString(),
        is_read: false
      };

      const allMessages = JSON.parse(localStorage.getItem("chatMessages") || "[]");
      allMessages.push(messageData);
      localStorage.setItem("chatMessages", JSON.stringify(allMessages));
    });
    
    onMessageSent?.();
    setShowFileUploader(false);
    toast({
      title: "Files uploaded",
      description: `${files.length} file(s) sent successfully`
    });
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const { hasReachedLimit } = checkMessageLimit();

  const handleVideoCall = () => {
    toast({
      title: "Video call started",
      description: `Calling ${recipientName}...`
    });
  };

  const handleAudioCall = () => {
    toast({
      title: "Audio call started",
      description: `Calling ${recipientName}...`
    });
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2 p-2 border-t">
        {/* Video Call */}
        <Button variant="ghost" size="icon" onClick={handleVideoCall}>
          <Video className="h-4 w-4" />
        </Button>

        {/* Audio Call */}
        <Button variant="ghost" size="icon" onClick={handleAudioCall}>
          <Phone className="h-4 w-4" />
        </Button>
        
        {/* File Upload */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowFileUploader(!showFileUploader)}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Emoji Picker */}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <Smile className="h-4 w-4" />
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
          
          <VoiceMessage onSend={handleVoiceMessage} />
          
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading || hasReachedLimit}
            size="icon"
            className="h-10 w-10"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-full left-0 z-50 mb-2">
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
        </div>
      )}

      {/* File Uploader */}
      {showFileUploader && (
        <div className="absolute bottom-full left-0 right-0 z-50 mb-2">
          <FileUploader onFilesUpload={handleFileUpload} />
        </div>
      )}
      
      {hasReachedLimit && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full">
          💬 One message limit - like each other to chat freely!
        </div>
      )}
    </div>
  );
}
