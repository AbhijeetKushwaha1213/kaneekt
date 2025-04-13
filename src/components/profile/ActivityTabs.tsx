
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PostItem } from "./PostItem";
import { EventItem } from "./EventItem";
import { EmptyState } from "./EmptyState";
import { AuthUser } from "@/types";

interface ActivityTabsProps {
  posts: any[];
  userData: AuthUser | null;
  avatarUrl: string | null;
  handleCreatePostClick: () => void;
}

export function ActivityTabs({ posts, userData, avatarUrl, handleCreatePostClick }: ActivityTabsProps) {
  const postItems = posts.filter(post => post.type === 'post');
  const eventItems = posts.filter(post => post.type === 'event');
  
  return (
    <Tabs defaultValue="posts">
      <TabsList className="grid grid-cols-3">
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="events">Events</TabsTrigger>
        <TabsTrigger value="channels">Channels</TabsTrigger>
      </TabsList>
      
      <div className="flex justify-between items-center mt-4">
        <h2 className="text-lg font-medium">Activity</h2>
        <Button size="sm" onClick={handleCreatePostClick}>
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </div>
      
      <TabsContent value="posts" className="mt-2 space-y-4">
        {postItems.length > 0 ? (
          postItems.map(post => (
            <PostItem 
              key={post.id} 
              post={post} 
              userData={userData} 
              avatarUrl={avatarUrl} 
            />
          ))
        ) : (
          <EmptyState type="post" handleCreatePostClick={handleCreatePostClick} />
        )}
      </TabsContent>
      
      <TabsContent value="events" className="mt-2 space-y-4">
        {eventItems.length > 0 ? (
          eventItems.map(event => (
            <EventItem 
              key={event.id} 
              event={event} 
              userData={userData} 
              avatarUrl={avatarUrl} 
            />
          ))
        ) : (
          <EmptyState type="event" handleCreatePostClick={handleCreatePostClick} />
        )}
      </TabsContent>
      
      <TabsContent value="channels" className="mt-2">
        <EmptyState type="channel" />
      </TabsContent>
    </Tabs>
  );
}
