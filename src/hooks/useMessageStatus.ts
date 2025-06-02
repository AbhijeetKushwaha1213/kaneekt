
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useMessageStatus(conversationId: string) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !conversationId) return;

    // Mark messages as delivered when user opens conversation
    const markAsDelivered = async () => {
      try {
        await supabase
          .from('messages')
          .update({
            status: 'delivered',
            delivered_at: new Date().toISOString()
          })
          .eq('conversation_id', conversationId)
          .neq('sender_id', user.id)
          .is('delivered_at', null);
      } catch (error) {
        console.error('Error marking messages as delivered:', error);
      }
    };

    markAsDelivered();

    // Mark messages as read when conversation is visible
    const markAsRead = async () => {
      try {
        await supabase
          .from('messages')
          .update({
            status: 'read',
            is_read: true,
            read_at: new Date().toISOString()
          })
          .eq('conversation_id', conversationId)
          .neq('sender_id', user.id)
          .eq('is_read', false);
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };

    // Mark as read when component mounts and when page becomes visible
    markAsRead();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        markAsRead();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, conversationId]);
}
