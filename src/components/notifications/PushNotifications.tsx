
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

    // Listen for real-time notifications from the database
    const channel = supabase
      .channel('push-notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'push_notifications',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          const notification = payload.new;
          showNotification(notification.title, notification.body, notification.type, notification.data);
        }
      )
      .subscribe();

    // Listen for new messages to create notifications
    const messagesChannel = supabase
      .channel('message-notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages'
        }, 
        async (payload) => {
          const message = payload.new;
          
          // Only show notification if message is not from current user
          if (message.sender_id !== user.id) {
            // Get sender info
            const { data: sender } = await supabase
              .from('profiles')
              .select('name, username')
              .eq('id', message.sender_id)
              .single();

            const senderName = sender?.name || sender?.username || 'Someone';
            
            // Create notification in database
            await supabase
              .from('push_notifications')
              .insert({
                user_id: user.id,
                title: 'New Message',
                body: `${senderName}: ${message.content}`,
                type: 'message',
                data: {
                  conversation_id: message.conversation_id,
                  sender_id: message.sender_id,
                  message_id: message.id
                }
              });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(messagesChannel);
    };
  }, [user]);

  const showNotification = (title: string, body: string, type: string, data?: any) => {
    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: type,
        data
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
