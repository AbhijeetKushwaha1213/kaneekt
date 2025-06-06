
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Smile, Mic, Plus, Gift } from "lucide-react";
import { VoiceMessage } from "@/components/chat/VoiceMessage";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { EnhancedFileUploader } from "@/components/chat/EnhancedFileUploader";
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
    toast({
      title: "Voice message",
      description: "Voice messages will be implemented soon",
    });
  }, [toast]);

  const handleFileUpload = useCallback((attachment: any) => {
    toast({
      title: "File uploaded",
      description: `${attachment.file_name} has been attached to your message`,
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

  return (
    <div className="relative">
      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={() => setShowFileUploader(!showFileUploader)}
          >
            <Plus className="h-4 w-4" />
          </Button>

          <div className="flex-1 flex items-center space-x-2">
            <Input
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={`Message #${recipientName}`}
              disabled={isLoading}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 shadow-none placeholder:text-gray-500"
            />
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={() => setShowFileUploader(!showFileUploader)}
          >
            <Gift className="h-4 w-4" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={() => setShowFileUploader(!showFileUploader)}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {showEmojiPicker && (
        <div className="absolute bottom-full left-0 z-50 mb-2">
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
        </div>
      )}

      {showFileUploader && (
        <div className="absolute bottom-full left-0 right-0 z-50 mb-2 p-2">
          <EnhancedFileUploader 
            onFileUploaded={handleFileUpload}
            messageId={`temp-${Date.now()}`}
            onClose={() => setShowFileUploader(false)}
          />
        </div>
      )}
    </div>
  );
}
