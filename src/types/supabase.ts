
import type { Database } from '@/integrations/supabase/types';

// Define custom types based on the generated Database type
export type Tables = Database['public']['Tables'];

// Profile-related types
export type Profile = Tables['profiles']['Row'];
export type ProfileInsert = Tables['profiles']['Insert'];
export type ProfileUpdate = Tables['profiles']['Update'];

// Post-related types
export type Post = Tables['posts']['Row'];
export type PostInsert = Tables['posts']['Insert'];
export type PostUpdate = Tables['posts']['Update'];

// Conversation-related types
export type Conversation = Tables['conversations']['Row'];
export type ConversationInsert = Tables['conversations']['Insert'];
export type ConversationUpdate = Tables['conversations']['Update'];

// Message-related types
export type Message = Tables['messages']['Row'] & {
  type?: 'text' | 'image' | 'video' | 'voice' | 'file' | 'location';
  file_data?: string;
  audio_data?: string;
  sender?: {
    id: string;
    name: string;
    username?: string;
    avatar?: string;
  };
};
export type MessageInsert = Tables['messages']['Insert'];
export type MessageUpdate = Tables['messages']['Update'];

// Enhanced social features types
export type Like = Tables['likes']['Row'];
export type LikeInsert = Tables['likes']['Insert'];

export type Comment = Tables['comments']['Row'];
export type CommentInsert = Tables['comments']['Insert'];
export type CommentUpdate = Tables['comments']['Update'];

export type Follow = Tables['follows']['Row'];
export type FollowInsert = Tables['follows']['Insert'];

export type FriendRequest = Tables['friend_requests']['Row'];
export type FriendRequestInsert = Tables['friend_requests']['Insert'];
export type FriendRequestUpdate = Tables['friend_requests']['Update'];

export type Story = Tables['stories']['Row'];
export type StoryInsert = Tables['stories']['Insert'];
export type StoryUpdate = Tables['stories']['Update'];

export type StoryView = Tables['story_views']['Row'];
export type StoryViewInsert = Tables['story_views']['Insert'];

export type StoryReaction = Tables['story_reactions']['Row'];
export type StoryReactionInsert = Tables['story_reactions']['Insert'];

// Extended profile type with optional location fields for future compatibility
export interface ProfileWithLocation extends Profile {
  latitude?: number;
  longitude?: number;
  location_sharing_enabled?: boolean;
  location_updated_at?: string;
}

// Enhanced post type with engagement data
export interface PostWithEngagement extends Post {
  isLiked?: boolean;
  commentsData?: Comment[];
  author?: Profile;
}

// Enhanced story type with interaction data
export interface StoryWithInteractions extends Story {
  views_count?: number;
  reactions_count?: number;
  has_viewed?: boolean;
  user_reaction?: string;
  author?: Profile;
}
