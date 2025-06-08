import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define a more specific Message type for this hook
export interface RealtimeMessage {
  id: string;
  content: string;
  conversation_id: string;
  sender_id: string;
  created_at: string;
  status?: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'image' | 'video' | 'voice' | 'file' | 'location';
  media_url?: string;
  file_data?: string;
  audio_data?: string;
  delivered_at?: string;
  read_at?: string;
  is_read?: boolean;
  channel_id?: string;
  sender?: {
    id: string;
    name: string;
    username?: string;
    avatar?: string;
  };
}

export function useRealTimeMessages(conversationId?: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [conversationId, user]);

  const fetchMessages = async () => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey (
            id,
            name,
            username,
            avatar
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive"
        });
      } else {
        const formattedMessages = data?.map(msg => ({
          ...msg,
          type: msg.type as 'text' | 'image' | 'video' | 'voice' | 'file' | 'location' || 'text',
          status: msg.status as 'sent' | 'delivered' | 'read' || 'sent',
          sender: Array.isArray(msg.sender) ? msg.sender[0] : msg.sender
        })) || [];
        
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          // Fetch the complete message with sender info
          const { data, error } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles!messages_sender_id_fkey (
                id,
                name,
                username,
                avatar
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (!error && data) {
            const formattedMessage = {
              ...data,
              type: data.type as 'text' | 'image' | 'video' | 'voice' | 'file' | 'location' || 'text',
              status: data.status as 'sent' | 'delivered' | 'read' || 'sent',
              sender: Array.isArray(data.sender) ? data.sender[0] : data.sender
            };
            
            setMessages(prev => [...prev, formattedMessage]);
            
            // Auto-mark as delivered if not sent by current user
            if (data.sender_id !== user?.id) {
              setTimeout(() => {
                supabase
                  .from('messages')
                  .update({
                    status: 'delivered',
                    delivered_at: new Date().toISOString()
                  })
                  .eq('id', data.id);
              }, 100);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          // Update message status in real-time
          setMessages(prev => 
            prev.map(msg => 
              msg.id === payload.new.id 
                ? { 
                    ...msg, 
                    ...payload.new,
                    type: payload.new.type as 'text' | 'image' | 'video' | 'voice' | 'file' | 'location' || msg.type,
                    status: payload.new.status as 'sent' | 'delivered' | 'read' || msg.status
                  }
                : msg
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (content: string, type: 'text' | 'image' | 'video' | 'voice' | 'file' | 'location' = 'text') => {
    if (!user || !conversationId) return { error: 'Missing requirements' };

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          type,
          status: 'sent'
        }])
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive"
        });
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      console.error('Error sending message:', error);
      return { error: 'Failed to send message' };
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    refetch: fetchMessages
  };
}
