import React from "react";
import { UserCard } from "@/components/ui/user-card";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InterestBadge } from "@/components/ui/interest-badge";
import { Heart, MessageSquare, Share2, Bookmark, MoreHorizontal, MapPin, Video, Image, FileText, Calendar, Users, Compass } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { USERS } from "@/data/mock-data";
import { sortUsersByActivity, sortUsersByRecency, sortUsersBySimilarity } from "@/utils/userFilters";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

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

// Group posts by topic
const groupPostsByTopic = (posts: any[]) => {
  const grouped: Record<string, any[]> = {};
  
  posts.forEach(post => {
    post.topics?.forEach((topic: string) => {
      if (!grouped[topic]) {
        grouped[topic] = [];
      }
      grouped[topic].push(post);
    });
  });
  
  return grouped;
};

// Mock topics with colors and icons
const TOPIC_STYLES: Record<string, { color: string, icon: React.ReactNode }> = {
  tech: { 
    color: 'bg-blue-50 text-blue-700 border-blue-200', 
    icon: <FileText className="h-5 w-5 text-blue-500" />
  },
  music: { 
    color: 'bg-purple-50 text-purple-700 border-purple-200', 
    icon: <Image className="h-5 w-5 text-purple-500" />
  },
  food: { 
    color: 'bg-orange-50 text-orange-700 border-orange-200', 
    icon: <Image className="h-5 w-5 text-orange-500" />
  },
  events: { 
    color: 'bg-pink-50 text-pink-700 border-pink-200', 
    icon: <Calendar className="h-5 w-5 text-pink-500" />
  },
  sport: { 
    color: 'bg-green-50 text-green-700 border-green-200', 
    icon: <Video className="h-5 w-5 text-green-500" />
  },
  art: { 
    color: 'bg-amber-50 text-amber-700 border-amber-200', 
    icon: <Image className="h-5 w-5 text-amber-500" />
  },
};

interface DiscoverFeedProps {
  searchQuery?: string;
  selectedInterests?: string[];
  ageRange?: [number, number];
  sortBy?: string;
  topics?: string[];
  viewType?: 'grid' | 'feed' | 'categories';
}

export function DiscoverFeed({ 
  searchQuery = "",
  selectedInterests = [],
  ageRange = [18, 50],
  sortBy = "trending",
  topics = [],
  viewType = "feed"
}: DiscoverFeedProps) {
  const isMobile = useIsMobile();

  if (viewType === 'grid') {
    // For the "People" tab, show a grid of user cards
    let filteredUsers = [...USERS].filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.bio.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesInterests = selectedInterests.length === 0 || 
                              selectedInterests.some(interest => user.interests.includes(interest));
      
      const matchesAge = user.age >= ageRange[0] && user.age <= ageRange[1];
      
      return matchesSearch && matchesInterests && matchesAge;
    });
    
    // Apply sorting
    switch (sortBy) {
      case 'active':
        filteredUsers = sortUsersByActivity(filteredUsers);
        break;
      case 'recent':
        filteredUsers = sortUsersByRecency(filteredUsers);
        break;
      case 'similar':
        // Mock current user's interests for demo
        const currentUserInterests = ["Music", "Travel", "Photography", "Cooking"];
        filteredUsers = sortUsersBySimilarity(filteredUsers, currentUserInterests);
        break;
      default:
        // Distance sorting handled elsewhere
        break;
    }
    
    if (filteredUsers.length === 0) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-muted/20 rounded-lg border border-dashed">
          <div className="bg-muted/50 rounded-full p-4 mb-4">
            <Users className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No users found</h3>
          <p className="text-muted-foreground max-w-md mb-3">
            Try adjusting your filters or search terms to find more people
          </p>
          <Button variant="outline">Reset Filters</Button>
        </div>
      );
    }
    
    return (
      <>
        {filteredUsers.map((user) => (
          <UserCard 
            key={user.id} 
            user={user} 
            className="transform-gpu transition-all duration-200 hover:-translate-y-1"
          />
        ))}
      </>
    );
  } else if (viewType === 'categories') {
    // Group posts by topic
    const groupedPosts = groupPostsByTopic(POSTS);
    const filteredTopics = topics.length > 0 
      ? topics
      : Object.keys(groupedPosts);
    
    return (
      <>
        {filteredTopics.map(topic => {
          const topicPosts = groupedPosts[topic] || [];
          const topicStyle = TOPIC_STYLES[topic] || { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: <FileText className="h-5 w-5" /> };
          
          return (
            <Card key={topic} className={`overflow-hidden border ${topicStyle.color.split(' ')[0]} border-${topicStyle.color.split(' ')[2]}`}>
              <div className={`flex items-center p-4 ${topicStyle.color}`}>
                <div className="mr-3">{topicStyle.icon}</div>
                <h2 className="text-lg font-medium capitalize">{topic}</h2>
                <div className="ml-auto text-sm font-medium">{topicPosts.length} posts</div>
              </div>
              <CardContent className="p-4 grid gap-4 grid-cols-2">
                {topicPosts.slice(0, 2).map(post => (
                  <div key={post.id} className="border rounded-md p-3 hover:bg-accent/20 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{post.author.name}</span>
                    </div>
                    <p className="text-sm line-clamp-2">{post.content}</p>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="p-3 border-t">
                <Button variant="ghost" className="w-full text-sm" size="sm">
                  View all {topicPosts.length} posts in {topic}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
        
        {filteredTopics.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-muted/20 rounded-lg border border-dashed">
            <div className="bg-muted/50 rounded-full p-4 mb-4">
              <Compass className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No topics found</h3>
            <p className="text-muted-foreground max-w-md mb-3">
              Select different topics to explore more content
            </p>
            <Button variant="outline">Explore All Topics</Button>
          </div>
        )}
      </>
    );
  }

  // Default feed view
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
                <div className="bg-muted rounded-full p-1">
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
          
          <CardFooter className={cn("p-2 border-t flex justify-between", isMobile ? "flex-wrap" : "")}>
            <div className={cn("flex space-x-1", isMobile ? "w-full mb-2" : "")}>
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
            
            <div className={cn("flex space-x-1", isMobile ? "w-full justify-end" : "")}>
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
