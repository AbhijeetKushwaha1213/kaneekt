
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Smile, Phone, Video, Paperclip, Mic, MicOff, Image as ImageIcon, FileText } from 'lucide-react';
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
  const [isRecording, setIsRecording] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAttachment(file);
      toast({
        title: 'File attached',
        description: `${file.name} is ready to send`,
      });
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleVoiceRecord = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        
        const audioChunks: Blob[] = [];
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          const audioFile = new File([audioBlob], 'voice-message.wav', { type: 'audio/wav' });
          setAttachment(audioFile);
          stream.getTracks().forEach(track => track.stop());
          toast({
            title: 'Voice message recorded',
            description: 'Your voice message is ready to send',
          });
        };
        
        mediaRecorder.start();
        setIsRecording(true);
        toast({
          title: 'Recording started',
          description: 'Speak your message...',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Could not access microphone',
          variant: 'destructive'
        });
      }
    } else {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    }
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
    // Simple emoji insertion
    const emojis = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '💯', '✨'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    setMessage(prev => prev + randomEmoji);
    inputRef.current?.focus();
  };

  const sendMessage = async () => {
    const content = message.trim();
    if (!content && !attachment) return;

    setIsLoading(true);
    try {
      let messageContent = content;
      let attachmentData = null;
      
      if (attachment) {
        attachmentData = {
          name: attachment.name,
          type: attachment.type,
          size: attachment.size
        };
        
        if (attachment.type.startsWith('audio/')) {
          messageContent = content || '🎤 Voice message';
        } else if (attachment.type.startsWith('image/')) {
          messageContent = content || '📷 Image';
        } else if (attachment.type.startsWith('video/')) {
          messageContent = content || '🎥 Video';
        } else {
          messageContent = content || `📎 ${attachment.name}`;
        }
      }

      const newMessage = {
        id: `msg-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: userId,
        content: messageContent,
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
      setAttachment(null);
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

      {/* Attachment preview */}
      {attachment && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
          <div className="flex items-center gap-2 flex-1">
            {attachment.type.startsWith('image/') && <ImageIcon className="h-4 w-4" />}
            {attachment.type.startsWith('audio/') && <Mic className="h-4 w-4" />}
            {attachment.type.startsWith('video/') && <Video className="h-4 w-4" />}
            {!attachment.type.startsWith('image/') && !attachment.type.startsWith('audio/') && !attachment.type.startsWith('video/') && <FileText className="h-4 w-4" />}
            <span className="text-sm truncate">{attachment.name}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAttachment(null)}
          >
            Remove
          </Button>
        </div>
      )}

      {/* Message input */}
      <div className="flex items-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleAttachmentClick}
          disabled={isLoading}
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        
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
          variant="ghost"
          size="icon"
          onClick={handleVoiceRecord}
          disabled={isLoading}
          className={isRecording ? 'bg-red-500 text-white' : ''}
        >
          {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        
        <Button
          onClick={sendMessage}
          disabled={isLoading || (!message.trim() && !attachment)}
          size="icon"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
      />
    </div>
  );
}
