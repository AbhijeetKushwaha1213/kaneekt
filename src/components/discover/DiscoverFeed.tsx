import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/supabase";
import { User } from "@/types"; // App's User type
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

function calculateAge(dob: string | null | undefined): number {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function mapProfileToAppUser(profile: Profile): User {
  // Assuming profile might contain latitude and longitude directly or via a joined table
  // For now, we'll check for direct properties, ProfileWithLocation interface implies they could exist.
  const appUser: User = {
    id: profile.id,
    name: profile.name || profile.username || 'Unnamed User',
    username: profile.username || undefined,
    avatar: profile.avatar || undefined,
    bio: profile.bio || '',
    interests: profile.interests || [],
    age: calculateAge(profile.dob),
    location: profile.location || undefined,
    isOnline: false, // Default, can be enhanced with presence system like useUserPresence
    profileData: profile, // Store the raw profile data
    latitude: (profile as any).latitude || undefined, // Attempt to get latitude
    longitude: (profile as any).longitude || undefined, // Attempt to get longitude
  };
  return appUser;
}

async function fetchDiscoverProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');
  if (error) {
    console.error("Error fetching profiles for discover feed:", error);
    throw new Error(error.message);
  }
  return data || [];
}

interface DiscoverFeedProps {
  searchQuery?: string;
  selectedInterests?: string[];
  currentUserInterests?: string[]; // Added for similarity sort
  ageRange?: [number, number];
  sortBy?: string;
  topics?: string[]; // For post feed view
  viewType?: 'grid' | 'feed' | 'categories';
}

export function DiscoverFeed({ 
  searchQuery = "",
  selectedInterests = [],
  currentUserInterests = [], // Added
  ageRange = [18, 50],
  sortBy = "trending", // "trending" for posts, for users it might map to 'distance' or 'active'
  topics = [],
  viewType = "feed"
}: DiscoverFeedProps) {
  const isMobile = useIsMobile();

  const { data: profiles, isLoading: isLoadingProfiles, error: profilesError } = useQuery<Profile[]>({
    queryKey: ['discoverProfiles'],
    queryFn: fetchDiscoverProfiles,
    enabled: viewType === 'grid', // Only fetch if viewType is grid (for people)
  });

  if (viewType === 'grid') {
    if (isLoadingProfiles) {
      return <div className="col-span-full text-center py-8">Loading profiles...</div>;
    }
    if (profilesError) {
      return <div className="col-span-full text-center py-8 text-destructive">Error loading profiles.</div>;
    }

    const mappedUsers: User[] = (profiles || []).map(mapProfileToAppUser);

    let filteredUsers = mappedUsers.filter(user => {
      const nameMatch = user.name.toLowerCase().includes(searchQuery.toLowerCase());
      const bioMatch = (user.bio || '').toLowerCase().includes(searchQuery.toLowerCase());
      const usernameMatch = (user.username || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSearch = nameMatch || bioMatch || usernameMatch;
      
      const matchesInterests = selectedInterests.length === 0 || 
                              selectedInterests.some(interest => (user.interests || []).includes(interest));
      
      const matchesAge = user.age >= ageRange[0] && user.age <= ageRange[1];
      
      return matchesSearch && matchesInterests && matchesAge;
    });
    
    // Apply sorting for people
    // Note: sortBy for 'grid' (people) might differ from 'feed' (posts)
    // 'trending' for posts. For people, 'distance' (handled by NearbyPeople), 'active', 'recent', 'similar'
    switch (sortBy) {
      case 'active': // Corresponds to "Most Active"
        filteredUsers = sortUsersByActivity(filteredUsers);
        break;
      case 'recent': // Corresponds to "Most Recent" (joined)
        filteredUsers = sortUsersByRecency(filteredUsers);
        break;
      case 'similar': // New sort option, needs UI if not already there for people
        if (currentUserInterests.length > 0) {
         filteredUsers = sortUsersBySimilarity(filteredUsers, currentUserInterests);
        }
        break;
      // 'trending' or 'distance' might be default or handled by specific components like NearbyPeople
      // Default sort might be by relevance or ID if no specific sort is matched.
      default:
         // Could add a default sort, e.g., by name or ID
         // filteredUsers.sort((a, b) => a.name.localeCompare(b.name));
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
            Try adjusting your filters or search terms to find more people.
          </p>
          {/* <Button variant="outline">Reset Filters</Button> Consider adding functionality */}
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

  // Default feed view (uses POSTS mock data)
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

  if (sortedPosts.length === 0 && viewType === 'feed') { // Ensure this only shows for feed view if it's empty
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
  
  // Return statement for the 'feed' or 'categories' view using POSTS mock data
  if (viewType === 'feed') {
    return (
      <div className="space-y-6">
        {/* ... keep existing code for rendering sortedPosts (mock post data) ... */}
      </div>
    );
  }
  
  // Fallback for 'categories' if not handled above or if POSTS logic is different.
  // This part of the code related to POSTS should be reviewed if it's meant to be dynamic too.
  // For now, the request is focused on "People" tab.
  return <div className="col-span-full text-center py-8">Select a view type.</div>;
}
