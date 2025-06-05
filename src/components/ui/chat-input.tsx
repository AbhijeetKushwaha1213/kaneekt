
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Smile, Mic, Video, Phone } from "lucide-react";
import { VoiceMessage } from "@/components/chat/VoiceMessage";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { FileUploader } from "@/components/ui/file-uploader";
import { useToast } from "@/hooks/use-toast";
import { useRealTimeMessages } from "@/hooks/useRealTimeMessages";

interface ChatInputProps {
  conversationId: string;
  userId: string;
  recipientName?: string;
  onMessageSent?: () => void;
  onInputChange?: (value: string) => void;
  onSubmit?: () => void;
}

export function ChatInput({ 
  conversationId, 
  userId, 
  recipientName = "User", 
  onMessageSent,
  onInputChange,
  onSubmit
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const { toast } = useToast();
  const { sendMessage } = useRealTimeMessages(conversationId);

  // Handle input change with typing indicator
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);
    onInputChange?.(value);
  }, [onInputChange]);

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);

    try {
      const result = await sendMessage(message.trim());
      
      if (result?.error) {
        toast({
          title: "Error sending message",
          description: "Please try again",
          variant: "destructive"
        });
      } else {
        setMessage("");
        onSubmit?.();
        onMessageSent?.();
      }
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
  }, [message, sendMessage, onSubmit, onMessageSent, toast, isLoading]);

  const handleVoiceMessage = useCallback(async (audioBlob: Blob) => {
    // For now, we'll just show a placeholder for voice messages
    // In a real implementation, you'd upload the audio to storage first
    toast({
      title: "Voice message",
      description: "Voice messages will be implemented soon",
    });
  }, [toast]);

  const handleFileUpload = useCallback((files: File[]) => {
    // For now, we'll just show a placeholder for file uploads
    // In a real implementation, you'd upload files to storage first
    toast({
      title: "File upload",
      description: "File uploads will be implemented soon",
    });
    setShowFileUploader(false);
  }, [toast]);

  const handleEmojiSelect = useCallback((emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleVideoCall = useCallback(() => {
    toast({
      title: "Video call started",
      description: `Calling ${recipientName}...`
    });
  }, [recipientName, toast]);

  const handleAudioCall = useCallback(() => {
    toast({
      title: "Audio call started",
      description: `Calling ${recipientName}...`
    });
  }, [recipientName, toast]);

  return (
    <div className="relative">
      <div className="flex items-center space-x-2 p-2 border-t">
        <Button variant="ghost" size="icon" onClick={handleVideoCall}>
          <Video className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" onClick={handleAudioCall}>
          <Phone className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowFileUploader(!showFileUploader)}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

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
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1"
          />
          
          <VoiceMessage onSend={handleVoiceMessage} />
          
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
            size="icon"
            className="h-10 w-10"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {showEmojiPicker && (
        <div className="absolute bottom-full left-0 z-50 mb-2">
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
        </div>
      )}

      {showFileUploader && (
        <div className="absolute bottom-full left-0 right-0 z-50 mb-2">
          <FileUploader onFilesUpload={handleFileUpload} />
        </div>
      )}
    </div>
  );
}
