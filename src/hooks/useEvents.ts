
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Event {
  id: string;
  creator_id: string;
  name: string;
  description?: string;
  location: string;
  date_time: string;
  max_attendees?: number;
  categories: string[];
  is_public: boolean;
  latitude?: number;
  longitude?: number;
  created_at: string;
  creator?: {
    id: string;
    name: string;
    avatar?: string;
  };
  attendee_count?: number;
  user_status?: 'attending' | 'maybe' | 'not_attending';
}

export function useEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
    subscribeToEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          creator:profiles!events_creator_id_fkey (
            id,
            name,
            avatar
          ),
          event_attendees (
            status,
            user_id
          )
        `)
        .gte('date_time', new Date().toISOString())
        .order('date_time', { ascending: true });

      if (error) throw error;

      const eventsWithCounts = data?.map(event => ({
        ...event,
        creator: Array.isArray(event.creator) ? event.creator[0] : event.creator,
        categories: event.categories || [],
        attendee_count: event.event_attendees?.filter(a => a.status === 'attending').length || 0,
        user_status: user ? event.event_attendees?.find(a => a.user_id === user.id)?.status as 'attending' | 'maybe' | 'not_attending' : undefined
      })) || [];

      setEvents(eventsWithCounts);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToEvents = () => {
    const channel = supabase
      .channel('events-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events'
        },
        () => fetchEvents()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const createEvent = async (eventData: {
    name: string;
    description?: string;
    location: string;
    date_time: string;
    max_attendees?: number;
    categories?: string[];
    is_public?: boolean;
    latitude?: number;
    longitude?: number;
  }) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('events')
        .insert([{
          creator_id: user.id,
          categories: eventData.categories || [],
          is_public: eventData.is_public ?? true,
          ...eventData
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Event created",
        description: "Your event has been created successfully"
      });

      return { data };
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive"
      });
      return { error: error.message };
    }
  };

  const updateAttendance = async (eventId: string, status: 'attending' | 'maybe' | 'not_attending') => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('event_attendees')
        .upsert({
          event_id: eventId,
          user_id: user.id,
          status
        });

      if (error) throw error;

      await fetchEvents(); // Refresh the events list

      toast({
        title: "RSVP updated",
        description: `You are now marked as ${status}`
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast({
        title: "Error",
        description: "Failed to update RSVP",
        variant: "destructive"
      });
      return { error: error.message };
    }
  };

  return {
    events,
    loading,
    createEvent,
    updateAttendance,
    refetch: fetchEvents
  };
}
