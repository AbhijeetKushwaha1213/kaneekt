
import { format } from "date-fns";
import { Calendar, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface EventItemProps {
  event: {
    id: string;
    content: string;
    timestamp: string;
    likes: number;
    comments: number;
    isPublic: boolean;
    image?: string;
    eventDate?: string;
    eventLocation?: string;
  };
  userData: {
    name?: string;
    username?: string;
    avatar?: string;
  } | null;
  avatarUrl: string | null;
}

export function EventItem({ event, userData, avatarUrl }: EventItemProps) {
  return (
    <Card key={event.id} className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl || userData?.avatar || "/placeholder.svg"} alt={userData?.name || "User"} />
            <AvatarFallback>{userData?.name?.charAt(0) || userData?.username?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{userData?.name || "User"}</h3>
                <p className="text-xs text-muted-foreground">
                  Posted on {format(new Date(event.timestamp), 'MMM d, yyyy')} • Event
                </p>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <Calendar className="h-3 w-3 mr-1" />
                Event
              </Badge>
            </div>
            
            <p className="mt-2">{event.content}</p>
            
            {event.image && (
              <div className="mt-3">
                <img 
                  src={event.image} 
                  alt="Event image" 
                  className="rounded-md max-h-80 w-auto" 
                />
              </div>
            )}
            
            {event.eventDate && event.eventLocation && (
              <div className="mt-3 p-3 bg-accent/30 rounded-md space-y-1">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  <span className="font-medium">{format(new Date(event.eventDate), 'EEEE, MMMM d, yyyy - h:mm a')}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                  <span>{event.eventLocation}</span>
                </div>
              </div>
            )}
            
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div>{event.likes} interested</div>
                <div>{event.comments} comments</div>
              </div>
              <Button size="sm" variant="outline">
                Interested
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
