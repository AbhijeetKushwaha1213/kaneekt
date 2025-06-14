
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/supabase";
import { User } from "@/types";
import { Video, Image as LucideImage, FileText, Calendar } from "lucide-react"; // Aliased Image
import React from "react";

// Mock data for posts with enhanced properties
export const POSTS = [
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
export const getContentTypeIcon = (post: any) => {
  if (post.mediaType === "video") {
    return <Video className="h-5 w-5 text-blue-500" />;
  } else if (post.mediaType === "image") {
    return <LucideImage className="h-5 w-5 text-green-500" />; // Used aliased LucideImage
  } else if (post.tags && post.tags.some((tag: string) => tag.toLowerCase().includes("event"))) { // Added null check for post.tags
    return <Calendar className="h-5 w-5 text-purple-500" />;
  } else {
    return <FileText className="h-5 w-5 text-gray-500" />;
  }
};

// Group posts by topic
export const groupPostsByTopic = (posts: any[]) => {
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
export const TOPIC_STYLES: Record<string, { color: string, icon: React.ReactNode }> = {
  tech: { 
    color: 'bg-blue-50 text-blue-700 border-blue-200', 
    icon: <FileText className="h-5 w-5 text-blue-500" />
  },
  music: { 
    color: 'bg-purple-50 text-purple-700 border-purple-200', 
    icon: <LucideImage className="h-5 w-5 text-purple-500" /> // Used aliased LucideImage
  },
  food: { 
    color: 'bg-orange-50 text-orange-700 border-orange-200', 
    icon: <LucideImage className="h-5 w-5 text-orange-500" /> // Used aliased LucideImage
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
    icon: <LucideImage className="h-5 w-5 text-amber-500" /> // Used aliased LucideImage
  },
};

export function calculateAge(dob: string | null | undefined): number {
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

export function mapProfileToAppUser(profile: Profile): User {
  const appUser: User = {
    id: profile.id,
    name: profile.name || profile.username || 'Unnamed User',
    username: profile.username || undefined,
    avatar: profile.avatar || undefined,
    bio: profile.bio || '',
    interests: profile.interests || [],
    age: calculateAge(profile.dob),
    location: profile.location || undefined,
    isOnline: false, 
    profileData: profile,
    latitude: (profile as any).latitude || undefined,
    longitude: (profile as any).longitude || undefined,
  };
  return appUser;
}

export async function fetchDiscoverProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');
  if (error) {
    console.error("Error fetching profiles for discover feed:", error);
    throw new Error(error.message);
  }
  return data || [];
}

export interface DiscoverFeedCommonProps {
  searchQuery?: string;
  selectedInterests?: string[];
  currentUserInterests?: string[];
  ageRange?: [number, number];
  sortBy?: string;
  topics?: string[];
}

