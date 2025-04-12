
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InterestBadge } from "@/components/ui/interest-badge";
import { Heart, MessageSquare, Share2, Bookmark, MoreHorizontal, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Mock data for posts
const POSTS = [
  {
    id: "post1",
    author: {
      id: "user1",
      name: "Jane Smith",
      avatar: "/placeholder.svg",
      distance: 1.2,
    },
    content: "Just discovered an amazing coffee shop downtown! Anyone want to join me for a cup tomorrow morning?",
    mediaUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    mediaType: "image",
    timestamp: new Date(Date.now() - 1000 * 60 * 20),
    likes: 24,
    comments: 5,
    location: "Downtown Café",
    tags: ["Coffee", "Social", "Downtown"]
  },
  {
    id: "post2",
    author: {
      id: "user2",
      name: "Robert Chen",
      avatar: "/placeholder.svg",
      distance: 0.8,
    },
    content: "Looking for players to join our neighborhood basketball game this Saturday at Central Park. All skill levels welcome!",
    mediaUrl: null,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    likes: 18,
    comments: 12,
    location: "Central Park Courts",
    tags: ["Basketball", "Sports", "Weekend"]
  },
  {
    id: "post3",
    author: {
      id: "user3",
      name: "Emily Johnson",
      avatar: "/placeholder.svg",
      distance: 2.5,
    },
    content: "Just finished this painting for the community art show next week! Hope to see some of you there.",
    mediaUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=745&q=80",
    mediaType: "image",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
    likes: 56,
    comments: 7,
    location: "Home Studio",
    tags: ["Art", "Painting", "LocalEvents"]
  },
  {
    id: "post4",
    author: {
      id: "user4",
      name: "Marcus Williams",
      avatar: "/placeholder.svg",
      distance: 5.1,
    },
    content: "Organizing a neighborhood cleanup this Sunday at 10AM. Let's make our community beautiful! Bring gloves if you have them.",
    mediaUrl: null,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    likes: 42,
    comments: 15,
    location: "Riverside Park",
    tags: ["Community", "Environment", "Volunteer"]
  }
];

interface DiscoverFeedProps {
  sortBy: string;
}

export function DiscoverFeed({ sortBy }: DiscoverFeedProps) {
  // Sort posts based on selected option
  const sortedPosts = [...POSTS].sort((a, b) => {
    if (sortBy === "trending") {
      // Sort by engagement (likes + comments)
      return (b.likes + b.comments) - (a.likes + a.comments);
    } else if (sortBy === "recent") {
      // Sort by timestamp (most recent first)
      return b.timestamp.getTime() - a.timestamp.getTime();
    } else if (sortBy === "nearby") {
      // Sort by distance
      return (a.author.distance || 99) - (b.author.distance || 99);
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      {sortedPosts.map((post, index) => (
        <Card key={post.id} className="overflow-hidden animate-in fade-in-up" style={{
          animationDelay: `${index * 100}ms`
        }}>
          <CardContent className="p-0">
            {/* Post header */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{post.author.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {post.author.distance} km away • {formatDistanceToNow(post.timestamp, { addSuffix: true })}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Post content */}
            <div className="px-4 pb-3">
              <p className="text-sm">{post.content}</p>
              
              {post.location && (
                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{post.location}</span>
                </div>
              )}
            </div>
            
            {/* Post tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="px-4 pb-3 flex flex-wrap gap-1">
                {post.tags.map(tag => (
                  <InterestBadge key={tag} label={tag} className="text-xs py-0.5" />
                ))}
              </div>
            )}
            
            {/* Post media */}
            {post.mediaUrl && (
              <div className="aspect-video bg-muted relative overflow-hidden">
                {post.mediaType === "image" ? (
                  <img 
                    src={post.mediaUrl} 
                    alt="Post content" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video 
                    src={post.mediaUrl} 
                    controls 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="p-2 border-t flex justify-between">
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                <Heart className="h-4 w-4 mr-1" />
                {post.likes}
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                <MessageSquare className="h-4 w-4 mr-1" />
                {post.comments}
              </Button>
            </div>
            
            <div className="flex space-x-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
