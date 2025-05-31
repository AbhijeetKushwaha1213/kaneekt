
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InterestBadge } from "@/components/ui/interest-badge";
import { Heart, MessageSquare, Share2, Bookmark, MoreHorizontal, MapPin, Video, Image, FileText, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";

// Mock data for posts with enhanced properties
const POSTS = [
  {
    id: "post1",
    author: {
      id: "user1",
      name: "Jane Smith",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
      distance: 1.2,
    },
    content: "Just discovered an amazing coffee shop downtown! Anyone want to join me for a cup tomorrow morning?",
    mediaUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    mediaType: "image",
    timestamp: new Date(Date.now() - 1000 * 60 * 20),
    likes: 24,
    comments: 5,
    location: "Downtown Café",
    tags: ["Coffee", "Social", "Food"],
    topics: ["food", "events"]
  },
  {
    id: "post2",
    author: {
      id: "user2",
      name: "Robert Chen",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
      distance: 0.8,
    },
    content: "Looking for players to join our neighborhood basketball game this Saturday at Central Park. All skill levels welcome!",
    mediaUrl: null,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    likes: 18,
    comments: 12,
    location: "Central Park Courts",
    tags: ["Basketball", "Sports", "Weekend"],
    topics: ["events", "sport"]
  },
  {
    id: "post3",
    author: {
      id: "user3",
      name: "Emily Johnson",
      avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
      distance: 2.5,
    },
    content: "Just finished this painting for the community art show next week! Hope to see some of you there.",
    mediaUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=745&q=80",
    mediaType: "image",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
    likes: 56,
    comments: 7,
    location: "Home Studio",
    tags: ["Art", "Painting", "LocalEvents"],
    topics: ["art", "events"]
  },
  {
    id: "post4",
    author: {
      id: "user4",
      name: "Marcus Williams",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
      distance: 5.1,
    },
    content: "Organizing a neighborhood cleanup this Sunday at 10AM. Let's make our community beautiful! Bring gloves if you have them.",
    mediaUrl: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    mediaType: "image",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    likes: 42,
    comments: 15,
    location: "Riverside Park",
    tags: ["Community", "Environment", "Volunteer"],
    topics: ["events"]
  },
  {
    id: "post5",
    author: {
      id: "user5",
      name: "Sophia Chen",
      avatar: "https://images.unsplash.com/photo-1615473967657-9dc96d93bfb9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80",
      distance: 1.7,
    },
    content: "Check out my latest tech tutorial on building a React app with Tailwind CSS. Let me know what you think!",
    mediaUrl: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    mediaType: "image",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
    likes: 31,
    comments: 8,
    location: "Tech Hub Coworking",
    tags: ["Technology", "Programming", "React"],
    topics: ["tech"]
  }
];

// Function to get content type icon
const getContentTypeIcon = (post: any) => {
  if (post.mediaType === "video") {
    return <Video className="h-5 w-5 text-blue-500" />;
  } else if (post.mediaType === "image") {
    return <Image className="h-5 w-5 text-green-500" />;
  } else if (post.tags.some((tag: string) => tag.toLowerCase().includes("event"))) {
    return <Calendar className="h-5 w-5 text-purple-500" />;
  } else {
    return <FileText className="h-5 w-5 text-gray-500" />;
  }
};

interface DiscoverFeedProps {
  searchQuery?: string;
  selectedInterests?: string[];
  ageRange?: [number, number];
  sortBy?: string;
  topics?: string[];
}

export function DiscoverFeed({ 
  searchQuery = "",
  selectedInterests = [],
  ageRange = [18, 50],
  sortBy = "trending",
  topics = []
}: DiscoverFeedProps) {
  // Filter posts based on selected topics if any
  const filteredPosts = topics.length > 0
    ? POSTS.filter(post => post.topics?.some(topic => topics.includes(topic)))
    : POSTS;

  // Sort posts based on selected option
  const sortedPosts = [...filteredPosts].sort((a, b) => {
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

  if (sortedPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed animate-in fade-in">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 mb-4">
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
      {sortedPosts.map((post, index) => (
        <Card 
          key={post.id} 
          className="overflow-hidden hover:shadow-md transition-all duration-300 animate-in fade-in-up" 
          style={{
            animationDelay: `${index * 100}ms`
          }}
        >
          <CardContent className="p-0">
            {/* Post header with author info */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Avatar className="cursor-pointer">
                      <AvatarImage src={post.author.avatar} alt={post.author.name} />
                      <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="flex justify-between space-x-4">
                      <Avatar>
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold">{post.author.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {post.author.distance} km away from you
                        </p>
                        <div className="flex items-center pt-2">
                          <Button variant="outline" size="sm" className="text-xs">View Profile</Button>
                        </div>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
                
                <div>
                  <div className="font-medium">{post.author.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {post.author.distance} km away • {formatDistanceToNow(post.timestamp, { addSuffix: true })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Content type badge */}
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-1">
                  {getContentTypeIcon(post)}
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
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
              <div className="relative aspect-video bg-muted overflow-hidden group">
                {post.mediaType === "image" ? (
                  <img 
                    src={post.mediaUrl} 
                    alt="Post content" 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <video 
                    src={post.mediaUrl} 
                    controls 
                    className="w-full h-full object-cover"
                  />
                )}
                
                {/* Subtle overlay gradient at bottom for better text visibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="p-2 border-t flex justify-between">
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
              >
                <Heart className="h-4 w-4 mr-1" />
                {post.likes}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                {post.comments}
              </Button>
            </div>
            
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              >
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
