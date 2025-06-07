
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EventCreation } from '@/components/events/EventCreation';
import { CalendarIcon, MapPin, Users, Clock, Filter } from 'lucide-react';
import { formatDistance } from '@/utils/distanceUtils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Event {
  id: string;
  name: string;
  description: string;
  location: string;
  date: string;
  time: string;
  maxAttendees?: number;
  categories: string[];
  createdBy: string;
  attendees: string[];
  createdAt: string;
  distance?: number;
}

interface EventDiscoveryProps {
  userLocation?: { latitude: number; longitude: number };
  selectedInterests?: string[];
}

export function EventDiscovery({ userLocation, selectedInterests = [] }: EventDiscoveryProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<'all' | 'today' | 'this-week' | 'my-interests'>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    // Load events from localStorage and mock data
    const storedEvents = JSON.parse(localStorage.getItem('userEvents') || '[]');
    
    // Add some mock events for demonstration
    const mockEvents: Event[] = [
      {
        id: 'mock-1',
        name: 'Coffee & Philosophy Discussion',
        description: 'Weekly discussion about consciousness, free will, and ethics',
        location: 'Central Park Café',
        date: new Date(Date.now() + 86400000).toISOString(),
        time: '14:00',
        categories: ['Philosophy', 'Social'],
        createdBy: 'Philosophy Enthusiast',
        attendees: ['user1', 'user2', 'user3'],
        createdAt: new Date().toISOString(),
        distance: userLocation ? Math.random() * 10 : undefined
      },
      {
        id: 'mock-2',
        name: 'Guitar Learning Circle',
        description: 'Beginners and intermediate players welcome! Bring your guitar.',
        location: 'Community Center Room B',
        date: new Date(Date.now() + 172800000).toISOString(),
        time: '18:30',
        maxAttendees: 8,
        categories: ['Music', 'Learning'],
        createdBy: 'Guitar Teacher',
        attendees: ['user4', 'user5'],
        createdAt: new Date().toISOString(),
        distance: userLocation ? Math.random() * 15 : undefined
      }
    ];

    const allEvents = [...storedEvents, ...mockEvents];
    setEvents(allEvents);
  };

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.date);
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

  const joinEvent = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, attendees: [...event.attendees, 'current-user'] }
        : event
    ));
    
    toast({
      title: "Joined event! 🎉",
      description: "You'll receive reminders and updates about this event"
    });
  };

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
                    <AvatarFallback>{event.createdBy[0]}</AvatarFallback>
                  </Avatar>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(event.date), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {event.attendees.length}
                      {event.maxAttendees && `/${event.maxAttendees}`} attending
                    </span>
                  </div>
                </div>

                {event.distance && (
                  <p className="text-xs text-muted-foreground">
                    {formatDistance(event.distance)} away
                  </p>
                )}

                <div className="flex flex-wrap gap-1">
                  {event.categories.map(category => (
                    <Badge key={category} variant="secondary" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">
                    by {event.createdBy}
                  </span>
                  <Button 
                    size="sm"
                    onClick={() => joinEvent(event.id)}
                    disabled={event.attendees.includes('current-user')}
                  >
                    {event.attendees.includes('current-user') ? 'Joined' : 'Join Event'}
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
