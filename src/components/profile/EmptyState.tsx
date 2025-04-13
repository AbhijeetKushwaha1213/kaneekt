
import { Plus, Calendar, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  type: 'post' | 'event' | 'channel';
  handleCreatePostClick?: () => void;
}

export function EmptyState({ type, handleCreatePostClick }: EmptyStateProps) {
  if (type === 'post') {
    return (
      <Card>
        <CardContent className="p-6 min-h-[200px] flex flex-col items-center justify-center text-center">
          <h3 className="text-lg font-medium mb-1">No posts yet</h3>
          <p className="text-muted-foreground max-w-md mb-4">
            Share your thoughts, ideas, or questions with your followers
          </p>
          {handleCreatePostClick && (
            <Button onClick={handleCreatePostClick}>
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }
  
  if (type === 'event') {
    return (
      <Card>
        <CardContent className="p-6 min-h-[200px] flex flex-col items-center justify-center text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-1">No events yet</h3>
          <p className="text-muted-foreground max-w-md mb-4">
            Create events to connect with people who share your interests
          </p>
          {handleCreatePostClick && (
            <Button onClick={handleCreatePostClick}>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-6 min-h-[200px] flex flex-col items-center justify-center text-center">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-1">No channels joined</h3>
        <p className="text-muted-foreground max-w-md mb-4">
          Join channels to connect with people who share your interests
        </p>
        <Button asChild>
          <Link to="/channels">
            Explore Channels
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
