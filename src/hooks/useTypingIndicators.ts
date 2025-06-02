
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useTypingIndicators(conversationId: string) {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [typingTimer, setTypingTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!conversationId || !user) return;

    // Listen for typing indicator changes
    const channel = supabase
      .channel(`typing-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const { user_id, is_typing } = payload.new;
            if (user_id !== user.id) {
              setTypingUsers(prev => {
                if (is_typing && !prev.includes(user_id)) {
                  return [...prev, user_id];
                } else if (!is_typing) {
                  return prev.filter(id => id !== user_id);
                }
                return prev;
              });
            }
          } else if (payload.eventType === 'DELETE') {
            const { user_id } = payload.old;
            setTypingUsers(prev => prev.filter(id => id !== user_id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user]);

  const setTyping = useCallback(async (isTyping: boolean) => {
    if (!user || !conversationId) return;

    try {
      if (isTyping) {
        await supabase
          .from('typing_indicators')
          .upsert({
            conversation_id: conversationId,
            user_id: user.id,
            is_typing: true
          });
      } else {
        await supabase
          .from('typing_indicators')
          .delete()
          .eq('conversation_id', conversationId)
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error updating typing indicator:', error);
    }
  }, [user, conversationId]);

  const startTyping = useCallback(() => {
    setTyping(true);
    
    // Clear existing timer
    if (typingTimer) {
      clearTimeout(typingTimer);
    }

    // Set new timer to stop typing after 3 seconds of inactivity
    const timer = setTimeout(() => {
      setTyping(false);
    }, 3000);
    
    setTypingTimer(timer);
  }, [setTyping, typingTimer]);

  const stopTyping = useCallback(() => {
    setTyping(false);
    if (typingTimer) {
      clearTimeout(typingTimer);
      setTypingTimer(null);
    }
  }, [setTyping, typingTimer]);

  return {
    typingUsers,
    startTyping,
    stopTyping
  };
}
