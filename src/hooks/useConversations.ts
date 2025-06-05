
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ConversationUser {
  id: string;
  name: string;
  avatar: string;
  isOnline?: boolean;
  isGroup?: boolean;
}

export interface ConversationMessage {
  id: string;
  content: string;
  timestamp: Date;
  unread: boolean;
  type?: string;
  status?: string;
}

export interface Conversation {
  id: string;
  user: ConversationUser;
  lastMessage: ConversationMessage;
  isApproved: boolean;
  participants?: any[];
  isPinned?: boolean;
  isMuted?: boolean;
  isArchived?: boolean;
  unreadCount?: number;
}

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchConversations();
      subscribeToConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      // Fetch conversations where the user is a participant
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select(`
          id,
          created_at,
          updated_at,
          user1_id,
          user2_id
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      if (!conversationsData || conversationsData.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // Get the other user's profile for each conversation
      const conversationsWithDetails = await Promise.all(
        conversationsData.map(async (conv) => {
          const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
          
          // Fetch other user's profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, name, username, avatar')
            .eq('id', otherUserId)
            .single();

          // Fetch last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('id, content, created_at, sender_id, is_read, status')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Count unread messages
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', user.id);

          return {
            id: conv.id,
            user: {
              id: otherUserId,
              name: profile?.name || 'User',
              avatar: profile?.avatar || '/placeholder.svg',
              isOnline: false
            },
            lastMessage: {
              id: lastMessage?.id || '',
              content: lastMessage?.content || '',
              timestamp: new Date(lastMessage?.created_at || conv.created_at),
              unread: !lastMessage?.is_read && lastMessage?.sender_id !== user.id,
              status: lastMessage?.status || 'sent'
            },
            isApproved: true,
            unreadCount: unreadCount || 0,
            isPinned: false,
            isMuted: false,
            isArchived: false
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToConversations = () => {
    if (!user) return;

    const channel = supabase
      .channel('conversations-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `user1_id=eq.${user.id}`
        },
        () => fetchConversations()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `user2_id=eq.${user.id}`
        },
        () => fetchConversations()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => fetchConversations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const createConversation = async (otherUserId: string) => {
    if (!user) return null;

    try {
      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`)
        .single();

      if (existingConv) {
        return existingConv.id;
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert([{
          user1_id: user.id,
          user2_id: otherUserId
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        return null;
      }

      fetchConversations();
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  return {
    conversations,
    loading,
    createConversation,
    refetch: fetchConversations
  };
}
