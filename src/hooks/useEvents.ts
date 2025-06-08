
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
  updated_at: string;
  creator?: {
    id: string;
    name: string;
    avatar?: string;
  };
  attendee_count?: number;
  user_status?: 'attending' | 'maybe' | 'not_attending' | null;
  distance?: number;
}

export function useEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles!events_creator_id_fkey (
            id,
            name,
            avatar
          ),
          event_attendees (
            status,
            user_id
          )
        `)
        .eq('is_public', true)
        .gte('date_time', new Date().toISOString())
        .order('date_time', { ascending: true });

      if (error) throw error;

      const enhancedEvents = (data || []).map(event => ({
        ...event,
        creator: Array.isArray(event.profiles) ? event.profiles[0] : event.profiles,
        attendee_count: event.event_attendees?.length || 0,
        user_status: user ? event.event_attendees?.find((a: any) => a.user_id === user.id)?.status || null : null,
        categories: event.categories || [],
        description: event.description || undefined,
        max_attendees: event.max_attendees || undefined,
        latitude: event.latitude ? Number(event.latitude) : undefined,
        longitude: event.longitude ? Number(event.longitude) : undefined
      })) as Event[];

      setEvents(enhancedEvents);
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

  const createEvent = async (eventData: Omit<Event, 'id' | 'creator_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          ...eventData,
          creator_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join the creator
      await supabase.from('event_attendees').insert({
        event_id: data.id,
        user_id: user.id,
        status: 'attending'
      });

      await fetchEvents();
      toast({
        title: "Success",
        description: "Event created successfully"
      });

      return { data };
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive"
      });
      return { error: 'Failed to create event' };
    }
  };

  const updateAttendance = async (eventId: string, status: 'attending' | 'maybe' | 'not_attending') => {
    if (!user) return;

    try {
      await supabase.from('event_attendees').upsert({
        event_id: eventId,
        user_id: user.id,
        status
      });

      await fetchEvents();
      toast({
        title: "Success",
        description: `RSVP updated to ${status}`
      });
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast({
        title: "Error",
        description: "Failed to update RSVP",
        variant: "destructive"
      });
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
