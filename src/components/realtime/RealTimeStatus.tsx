
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

    const channel = supabase.channel('user-status')
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const userPresence = presenceState[userId];
        setIsOnline(!!userPresence && userPresence.length > 0);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        if (key === userId) {
          setIsOnline(true);
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        if (key === userId) {
          setIsOnline(false);
          setLastSeen(new Date());
        }
      })
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
