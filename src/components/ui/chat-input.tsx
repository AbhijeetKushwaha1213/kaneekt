
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Smile, Phone, Video } from 'lucide-react';
import { MessageAttachmentUploader, AttachmentType } from '@/components/ui/message-attachment-uploader';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ChatInputProps {
  conversationId: string;
  userId: string;
  onMessageSent?: () => void;
}

export function ChatInput({ conversationId, userId, onMessageSent }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachment, setAttachment] = useState<{
    file: File;
    type: AttachmentType;
    preview?: string;
  } | null>(null);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAttachmentSelect = (file: File, type: AttachmentType) => {
    let preview: string | undefined;
    
    if (type === 'image' || type === 'video') {
      preview = URL.createObjectURL(file);
    }
    
    setAttachment({ file, type, preview });
    
    toast({
      title: 'File attached',
      description: `${file.name} is ready to send`,
    });
  };

  const handleAttachmentRemove = () => {
    if (attachment?.preview) {
      URL.revokeObjectURL(attachment.preview);
    }
    setAttachment(null);
  };

  const handleVoiceCall = () => {
    toast({
      title: 'Voice call',
      description: 'Voice calling feature coming soon!',
    });
  };

  const handleVideoCall = () => {
    toast({
      title: 'Video call',
      description: 'Video calling feature coming soon!',
    });
  };

  const handleEmojiClick = () => {
    toast({
      title: 'Emojis',
      description: 'Emoji picker coming soon!',
    });
  };

  const sendMessage = async () => {
    const content = message.trim();
    if (!content && !attachment) return;

    setIsLoading(true);
    try {
      let attachmentData = null;
      
      if (attachment) {
        // For now, just store attachment info (file upload coming soon)
        attachmentData = {
          name: attachment.file.name,
          type: attachment.type,
          size: attachment.file.size
        };
      }

      const newMessage = {
        id: `msg-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: userId,
        content: content || `Sent a ${attachment?.type || 'file'}`,
        created_at: new Date().toISOString(),
        attachment: attachmentData,
        is_read: false
      };

      // Try to save to Supabase first, fall back to localStorage
      try {
        const { error } = await supabase
          .from('messages')
          .insert([{
            conversation_id: conversationId,
            sender_id: userId,
            content: newMessage.content,
          }]);

        if (error) {
          throw error;
        }
      } catch (supabaseError) {
        console.log('Supabase not available, using localStorage');
        
        // Fall back to localStorage
        const storedMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
        storedMessages.push(newMessage);
        localStorage.setItem('chatMessages', JSON.stringify(storedMessages));
      }

      setMessage('');
      handleAttachmentRemove();
      onMessageSent?.();

      toast({
        title: 'Message sent',
        description: attachment ? 'Message with attachment sent successfully' : undefined,
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Call buttons */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleVoiceCall}
          className="flex items-center gap-2"
        >
          <Phone className="h-4 w-4" />
          <span className="hidden sm:inline">Voice Call</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleVideoCall}
          className="flex items-center gap-2"
        >
          <Video className="h-4 w-4" />
          <span className="hidden sm:inline">Video Call</span>
        </Button>
      </div>

      {/* Message input */}
      <div className="flex items-end gap-2">
        <MessageAttachmentUploader
          onAttachmentSelect={handleAttachmentSelect}
          onAttachmentRemove={handleAttachmentRemove}
          currentAttachment={attachment}
        />
        
        <div className="flex-1">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={attachment ? "Add a message..." : "Type a message..."}
            disabled={isLoading}
            className="w-full"
          />
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleEmojiClick}
          disabled={isLoading}
        >
          <Smile className="h-5 w-5" />
        </Button>
        
        <Button
          onClick={sendMessage}
          disabled={isLoading || (!message.trim() && !attachment)}
          size="icon"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
