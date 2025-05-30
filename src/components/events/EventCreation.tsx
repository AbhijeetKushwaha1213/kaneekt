
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, MapPin, Users, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export function EventCreation() {
  const [isOpen, setIsOpen] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDate, setEventDate] = useState<Date>();
  const [eventTime, setEventTime] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { toast } = useToast();

  const categories = [
    'Social', 'Sports', 'Food & Drink', 'Arts & Culture', 'Music',
    'Technology', 'Outdoor', 'Gaming', 'Fitness', 'Learning'
  ];

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const createEvent = () => {
    if (eventName && eventDate && eventTime && eventLocation) {
      // Store event in localStorage for demo
      const events = JSON.parse(localStorage.getItem('userEvents') || '[]');
      const newEvent = {
        id: `event-${Date.now()}`,
        name: eventName,
        description: eventDescription,
        location: eventLocation,
        date: eventDate.toISOString(),
        time: eventTime,
        maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
        categories: selectedCategories,
        createdBy: 'current-user',
        attendees: ['current-user'],
        createdAt: new Date().toISOString()
      };
      events.push(newEvent);
      localStorage.setItem('userEvents', JSON.stringify(events));

      toast({
        title: "Event created! 🎉",
        description: `${eventName} has been scheduled for ${format(eventDate, 'MMM dd, yyyy')}`
      });

      // Reset form
      setIsOpen(false);
      setEventName('');
      setEventDescription('');
      setEventLocation('');
      setEventDate(undefined);
      setEventTime('');
      setMaxAttendees('');
      setSelectedCategories([]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          Create Event
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="event-name">Event Name</Label>
            <Input
              id="event-name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="What's the event called?"
            />
          </div>
          
          <div>
            <Label htmlFor="event-description">Description</Label>
            <Textarea
              id="event-description"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              placeholder="Tell people what to expect..."
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="event-location">Location</Label>
            <Input
              id="event-location"
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              placeholder="Where will it happen?"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {eventDate ? format(eventDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={eventDate}
                    onSelect={setEventDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label htmlFor="event-time">Time</Label>
              <Input
                id="event-time"
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="max-attendees">Max Attendees (Optional)</Label>
            <Input
              id="max-attendees"
              type="number"
              value={maxAttendees}
              onChange={(e) => setMaxAttendees(e.target.value)}
              placeholder="Leave empty for unlimited"
            />
          </div>
          
          <div>
            <Label>Categories</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {categories.map(category => (
                <Badge
                  key={category}
                  variant={selectedCategories.includes(category) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleCategoryToggle(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
          
          <Button 
            onClick={createEvent} 
            className="w-full"
            disabled={!eventName || !eventDate || !eventTime || !eventLocation}
          >
            Create Event
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
