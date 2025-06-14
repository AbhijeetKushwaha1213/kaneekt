import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageSquare, Share2, Bookmark, MoreHorizontal, MapPin, Image as ImageIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { POSTS, DiscoverFeedCommonProps, getContentTypeIcon } from "@/utils/discoverFeedUtils.tsx";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";


interface DiscoverFeedPostsProps extends DiscoverFeedCommonProps {}

export function DiscoverFeedPosts({ 
  sortBy = "trending", 
  topics = [] 
}: DiscoverFeedPostsProps) {
  const filteredPosts = topics.length > 0
    ? POSTS.filter(post => post.topics?.some(topic => topics.includes(topic)))
    : POSTS;

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === "trending") {
      return (b.likes + b.comments) - (a.likes + a.comments);
    } else if (sortBy === "recent") {
      return b.timestamp.getTime() - a.timestamp.getTime();
    } else if (sortBy === "nearby") {
      return (a.author.distance || 99) - (b.author.distance || 99);
    }
    return 0;
  });

  if (sortedPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-muted/20 rounded-lg border border-dashed animate-in fade-in">
        <div className="bg-muted/50 rounded-full p-4 mb-4">
          <MapPin className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No content found</h3>
        <p className="text-muted-foreground max-w-md mb-6">
          There's no content matching your selected topics in your area yet. Try selecting different topics or be the first to post!
        </p>
        <Button>Create a Post</Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {sortedPosts.map((post) => (
        <Card key={post.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <p className="font-medium cursor-pointer hover:underline">{post.author.name}</p>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="flex items-center space-x-3">
                        <Avatar>
                           <AvatarImage src={post.author.avatar} />
                           <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h4 className="text-sm font-semibold">{post.author.name}</h4>
                            <p className="text-xs text-muted-foreground">{post.author.distance} km away</p>
                        </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(post.timestamp, { addSuffix: true })}
                  {post.location && (
                    <>
                      {' · '} 
                      <MapPin className="inline h-3 w-3 mr-1" /> 
                      {post.location}
                    </>
                  )}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="ml-auto">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-sm">{post.content}</p>
            {post.mediaUrl && post.mediaType === 'image' && (
              <div className="rounded-lg overflow-hidden border">
                <img src={post.mediaUrl} alt="Post media" className="w-full h-auto object-cover" />
              </div>
            )}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
              </div>
            )}
          </CardContent>
          <CardFooter className="px-4 py-3 border-t flex justify-between items-center">
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                <Heart className="h-4 w-4 mr-1.5" /> {post.likes}
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                <MessageSquare className="h-4 w-4 mr-1.5" /> {post.comments}
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
