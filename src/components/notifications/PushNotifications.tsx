
import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Bell, MessageCircle, Heart, Users, Calendar } from 'lucide-react';

export function PushNotifications() {
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Listen for real-time notifications
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=neq.${user.id}` // Messages not from current user
        }, 
        (payload) => {
          showNotification('New Message', 'You have a new message', 'message');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const showNotification = (title: string, body: string, type: string) => {
    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: type
      });
    }

    // Show toast notification
    const getIcon = () => {
      switch (type) {
        case 'message': return <MessageCircle className="h-4 w-4" />;
        case 'like': return <Heart className="h-4 w-4" />;
        case 'group': return <Users className="h-4 w-4" />;
        case 'event': return <Calendar className="h-4 w-4" />;
        default: return <Bell className="h-4 w-4" />;
      }
    };

    toast({
      title,
      description: body,
      action: getIcon(),
    });
  };

  return null; // This is a background component
}
