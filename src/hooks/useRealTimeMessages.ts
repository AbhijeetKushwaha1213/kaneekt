
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RealtimeMessage {
  id: string;
  content: string;
  timestamp: Date;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  isCurrentUser: boolean;
  type?: 'text' | 'image' | 'video' | 'voice' | 'file' | 'location';
  status?: 'sent' | 'delivered' | 'read';
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
        const transformedMessages = (data || []).map(msg => ({
          id: msg.id,
          content: msg.content,
          timestamp: new Date(msg.created_at || ''),
          sender: {
            id: msg.sender?.id || '',
            name: msg.sender?.name || '',
            avatar: msg.sender?.avatar || undefined
          },
          isCurrentUser: msg.sender_id === user?.id,
          type: (msg.type as 'text' | 'image' | 'video' | 'voice' | 'file' | 'location') || 'text',
          status: (msg.status as 'sent' | 'delivered' | 'read') || 'sent'
        })) as RealtimeMessage[];

        setMessages(transformedMessages);
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
            const newMessage = {
              id: data.id,
              content: data.content,
              timestamp: new Date(data.created_at || ''),
              sender: {
                id: data.sender?.id || '',
                name: data.sender?.name || '',
                avatar: data.sender?.avatar || undefined
              },
              isCurrentUser: data.sender_id === user?.id,
              type: (data.type as 'text' | 'image' | 'video' | 'voice' | 'file' | 'location') || 'text',
              status: (data.status as 'sent' | 'delivered' | 'read') || 'sent'
            } as RealtimeMessage;

            setMessages(prev => [...prev, newMessage]);
            
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
                    status: (payload.new.status as 'sent' | 'delivered' | 'read') || 'sent'
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

  const sendMessage = async (content: string, type: string = 'text') => {
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
