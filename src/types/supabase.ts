
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
export type Message = Tables['messages']['Row'];
export type MessageInsert = Tables['messages']['Insert'];
export type MessageUpdate = Tables['messages']['Update'];

// Define custom types for features not yet in database
export interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  content?: string;
  view_count: number;
  created_at: string;
  expires_at: string;
  profiles?: {
    name: string;
    avatar: string;
  };
}

export interface StoryInsert {
  user_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  content?: string;
}

export interface StoryUpdate {
  media_url?: string;
  media_type?: 'image' | 'video';
  content?: string;
}

export interface Event {
  id: string;
  creator_id: string;
  title: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  event_date: string;
  max_participants?: number;
  is_premium_only: boolean;
  created_at: string;
}

export interface EventInsert {
  creator_id: string;
  title: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  event_date: string;
  max_participants?: number;
  is_premium_only?: boolean;
}

export interface EventUpdate {
  title?: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  event_date?: string;
  max_participants?: number;
  is_premium_only?: boolean;
}

export interface Like {
  id: string;
  liker_id: string;
  liked_id: string;
  is_super_like: boolean;
  created_at: string;
}

export interface LikeInsert {
  liker_id: string;
  liked_id: string;
  is_super_like?: boolean;
}

export interface LikeUpdate {
  is_super_like?: boolean;
}

export interface Group {
  id: string;
  creator_id: string;
  name: string;
  description?: string;
  category?: string;
  is_private: boolean;
  max_members: number;
  created_at: string;
}

export interface GroupInsert {
  creator_id: string;
  name: string;
  description?: string;
  category?: string;
  is_private?: boolean;
  max_members?: number;
}

export interface GroupUpdate {
  name?: string;
  description?: string;
  category?: string;
  is_private?: boolean;
  max_members?: number;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  title: string;
  description?: string;
  points: number;
  earned_at: string;
}

export interface AchievementInsert {
  user_id: string;
  achievement_type: string;
  title: string;
  description?: string;
  points?: number;
}

export interface AchievementUpdate {
  achievement_type?: string;
  title?: string;
  description?: string;
  points?: number;
}

// Extended profile type with optional location fields for future compatibility
export interface ProfileWithLocation extends Profile {
  latitude?: number;
  longitude?: number;
  location_sharing_enabled?: boolean;
  location_updated_at?: string;
}
