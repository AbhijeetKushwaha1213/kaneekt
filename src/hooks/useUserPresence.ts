
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useUserPresence() {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) return;

    // Set current user as online
    const setOnline = async () => {
      try {
        await supabase
          .from('user_presence')
          .upsert({
            user_id: user.id,
            is_online: true,
            last_seen: new Date().toISOString()
          });
      } catch (error) {
        console.error('Error setting user online:', error);
      }
    };

    // Set current user as offline when leaving
    const setOffline = async () => {
      try {
        await supabase
          .from('user_presence')
          .update({
            is_online: false,
            last_seen: new Date().toISOString()
          })
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error setting user offline:', error);
      }
    };

    setOnline();

    // Listen for presence changes
    const channel = supabase
      .channel('user-presence-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence'
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const { user_id, is_online } = payload.new;
            setOnlineUsers(prev => ({
              ...prev,
              [user_id]: is_online
            }));
          }
        }
      )
      .subscribe();

    // Set offline when page unloads
    const handleBeforeUnload = () => {
      setOffline();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      setOffline();
      supabase.removeChannel(channel);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  const getUserOnlineStatus = (userId: string) => {
    return onlineUsers[userId] || false;
  };

  return {
    onlineUsers,
    getUserOnlineStatus
  };
}
