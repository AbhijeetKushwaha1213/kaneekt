
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EventCreation } from '@/components/events/EventCreation';
import { CalendarIcon, MapPin, Users, Clock } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface EventDiscoveryProps {
  userLocation?: { latitude: number; longitude: number };
  selectedInterests?: string[];
}

export function EventDiscovery({ userLocation, selectedInterests = [] }: EventDiscoveryProps) {
  const { events, loading, updateAttendance } = useEvents();
  const [filter, setFilter] = useState<'all' | 'today' | 'this-week' | 'my-interests'>('all');
  const { toast } = useToast();

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.date_time);
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    switch (filter) {
      case 'today':
        return eventDate.toDateString() === today.toDateString();
      case 'this-week':
        return eventDate >= today && eventDate <= nextWeek;
      case 'my-interests':
        return event.categories.some(cat => selectedInterests.includes(cat));
      default:
        return true;
    }
  });

  const joinEvent = async (eventId: string) => {
    await updateAttendance(eventId, 'attending');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Discover Events</h2>
          <EventCreation />
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Discover Events</h2>
        <EventCreation />
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'All Events' },
          { key: 'today', label: 'Today' },
          { key: 'this-week', label: 'This Week' },
          { key: 'my-interests', label: 'My Interests' }
        ].map(({ key, label }) => (
          <Button
            key={key}
            variant={filter === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(key as any)}
            className="whitespace-nowrap"
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={event.creator?.avatar} alt={event.creator?.name} />
                    <AvatarFallback>{event.creator?.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(event.date_time), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(event.date_time), 'HH:mm')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {event.attendee_count}
                      {event.max_attendees && `/${event.max_attendees}`} attending
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {event.categories.map(category => (
                    <Badge key={category} variant="secondary" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">
                    by {event.creator?.name || 'User'}
                  </span>
                  <Button 
                    size="sm"
                    onClick={() => joinEvent(event.id)}
                    disabled={event.user_status === 'attending'}
                  >
                    {event.user_status === 'attending' ? 'Attending' : 'Join Event'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No events found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {filter === 'my-interests' 
                ? "No events match your interests yet. Try creating one!"
                : "Be the first to create an event in your area!"
              }
            </p>
            <EventCreation />
          </Card>
        )}
      </div>
    </div>
  );
}
