
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

export function useMessageReactions(messageId?: string) {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<MessageReaction[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (messageId) {
      fetchReactions();
      subscribeToReactions();
    }
  }, [messageId]);

  const fetchReactions = async () => {
    if (!messageId) return;

    try {
      // Fetch reactions and separately fetch user profiles
      const { data: reactionsData, error: reactionsError } = await supabase
        .from('message_reactions')
        .select('*')
        .eq('message_id', messageId)
        .order('created_at', { ascending: true });

      if (reactionsError) throw reactionsError;

      // Get unique user IDs
      const userIds = [...new Set(reactionsData?.map(r => r.user_id) || [])];
      
      // Fetch user profiles separately
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, avatar')
        .in('id', userIds);

      if (profilesError) {
        console.warn('Could not fetch user profiles:', profilesError);
      }

      // Combine reactions with user data
      const reactionsWithUsers = reactionsData?.map(reaction => ({
        ...reaction,
        user: profilesData?.find(profile => profile.id === reaction.user_id) || undefined
      })) || [];

      setReactions(reactionsWithUsers);
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  };

  const subscribeToReactions = () => {
    if (!messageId) return;

    const channel = supabase
      .channel(`reactions-${messageId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
          filter: `message_id=eq.${messageId}`
        },
        () => fetchReactions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const addReaction = async (emoji: string) => {
    if (!user || !messageId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: user.id,
          emoji
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeReaction = async (emoji: string) => {
    if (!user || !messageId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing reaction:', error);
      toast({
        title: "Error",
        description: "Failed to remove reaction",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleReaction = async (emoji: string) => {
    if (!user) return;

    const existingReaction = reactions.find(
      r => r.user_id === user.id && r.emoji === emoji
    );

    if (existingReaction) {
      await removeReaction(emoji);
    } else {
      await addReaction(emoji);
    }
  };

  return {
    reactions,
    loading,
    addReaction,
    removeReaction,
    toggleReaction
  };
}
