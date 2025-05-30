
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

// Story-related types
export type Story = Tables['stories']['Row'];
export type StoryInsert = Tables['stories']['Insert'];
export type StoryUpdate = Tables['stories']['Update'];

// Event-related types
export type Event = Tables['events']['Row'];
export type EventInsert = Tables['events']['Insert'];
export type EventUpdate = Tables['events']['Update'];

// Like-related types
export type Like = Tables['likes']['Row'];
export type LikeInsert = Tables['likes']['Insert'];
export type LikeUpdate = Tables['likes']['Update'];

// Group-related types
export type Group = Tables['groups']['Row'];
export type GroupInsert = Tables['groups']['Insert'];
export type GroupUpdate = Tables['groups']['Update'];

// Achievement-related types
export type Achievement = Tables['achievements']['Row'];
export type AchievementInsert = Tables['achievements']['Insert'];
export type AchievementUpdate = Tables['achievements']['Update'];

// Extended profile type with optional location fields for future compatibility
export interface ProfileWithLocation extends Profile {
  latitude?: number;
  longitude?: number;
  location_sharing_enabled?: boolean;
  location_updated_at?: string;
}
