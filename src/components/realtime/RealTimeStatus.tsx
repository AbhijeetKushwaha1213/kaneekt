
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RealTimeStatusProps {
  userId: string;
  showLabel?: boolean;
}

export function RealTimeStatus({ userId, showLabel = false }: RealTimeStatusProps) {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<Date | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Fetch current status
    const fetchStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('user_presence')
          .select('is_online, last_seen')
          .eq('user_id', userId)
          .maybeSingle();

        if (!error && data) {
          setIsOnline(data.is_online);
          setLastSeen(data.last_seen ? new Date(data.last_seen) : null);
        }
      } catch (error) {
        console.error('Error fetching user status:', error);
      }
    };

    fetchStatus();

    // Listen for real-time updates
    const channel = supabase
      .channel(`user-status-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const { is_online, last_seen } = payload.new;
            setIsOnline(is_online);
            setLastSeen(last_seen ? new Date(last_seen) : null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, user]);

  const getLastSeenText = () => {
    if (!lastSeen) return 'Last seen recently';
    const now = new Date();
    const diff = now.getTime() - lastSeen.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Last seen just now';
    if (minutes < 60) return `Last seen ${minutes}m ago`;
    if (hours < 24) return `Last seen ${hours}h ago`;
    return `Last seen ${days}d ago`;
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
      {showLabel && (
        <span className="text-xs text-muted-foreground">
          {isOnline ? 'Online' : getLastSeenText()}
        </span>
      )}
    </div>
  );
}
